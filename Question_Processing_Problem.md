# Question Processing 

## The Problem

Our chat system only handled predictions. Different questions need different processing — lookups, predictions, analysis, and unclear inputs all need to be handled differently.

## The Solution

```
Question → Classify (OpenAI) → Route to handler → Return structured results
                                                            ↓
                                              llm.py generates the final answer the user sees
```

We handle 4 question types:
1. **DATA_QUERY** — Stats and lookups ("How many customers?", "Average salary by region?")
2. **PREDICTION** — Predict an outcome for one row or all rows, with SHAP explanation
3. **ANALYSIS** — What drives the target? ("What factors influence churn?")
4. **UNCLEAR** — Ambiguous question, return clarification suggestions

---

## File: `data_processor.py` — 6 sections

```
SECTION 1  — /train endpoint
SECTION 2  — Core prediction logic (internal)
SECTION 3  — SHAP explanation logic (internal)
SECTION 4  — Question Classifier class
SECTION 5  — Question Processor class (4 handlers)
SECTION 6  — /processQuestion (main endpoint)
```

---

## SECTION 1 — Model Training & Caching

This section handles the `/train` endpoint. Before any prediction can happen, the model must be trained on the uploaded dataset. It takes the cleaned data, encodes categorical columns, splits 80/20, trains a RandomForest, and stores everything (model, encoders, feature names, target info) in `trained_models[chat_id]` so all other sections can use it.

- Gets `X` (no IDs) and `y` from `cleaned_data_cache`
- Encodes categoricals, splits 80/20, trains RandomForest
- Stores model + encoders + metadata in `trained_models[chat_id]`

---

## SECTION 2 — Core Prediction Logic

This section contains the actual prediction functions. There are two modes because a user may ask about a specific row ("Will user 42 be approved?") or about all rows at once ("Which users will be approved?"). Single mode looks up one row by ID and predicts it. Batch mode runs the model on the entire dataset at once and pairs each result with its row ID.

These are internal functions called by the handlers in Section 5, not endpoints.

### `predict_local_single(chat_id, id_column, id_value)`
1. Look up the row in `df` by ID
2. Encode using the same encoders from training
3. Align columns to `feature_names`
4. Run `model.predict()` + `model.predict_proba()`
5. Return: `{ prediction, confidence, predicted_class_index }`

### `predict_local_batch(chat_id)`
1. Get fully-encoded `X` from `trained_models[chat_id]`
2. Run `model.predict()` + `model.predict_proba()` on all rows at once
3. Pair each prediction with its ID from `df`
4. Return: `{ results: [{id_column, id_value, prediction, confidence}, ...], summary: {total, <label>: count} }`

---

## SECTION 3 — SHAP Explanation Logic

This section explains why the model made each prediction. SHAP assigns each feature a value showing how much it pushed the prediction up or down. There are three functions: one for single predictions, one for batch (runs the explainer once on all rows and slices per row for efficiency), and one for global analysis questions.

These are internal functions called by the handlers in Section 5, not endpoints.

### `explain_shap_local_single(chat_id)`
- Runs `TreeExplainer` on the single cached row
- Returns top 8 features sorted by `abs(shap_value)`

### `explain_shap_local_batch(chat_id, batch_result)`
- Runs `TreeExplainer` once on all rows
- Per-row: top 5 features
- Aggregate: `mean(abs(SHAP))` across all rows → top 8 overall factors

### `explain_shap_analysis(chat_id)`
- Samples up to 500 rows for speed
- Returns `mean(abs(SHAP))` per feature across the sample
- Used by the ANALYSIS handler

---

## SECTION 4 — Question Classifier

This section classifies the user's question into one of the 4 types and extracts relevant info. It calls OpenAI with the question and dataset context (column names + sample rows) and returns structured JSON. For PREDICTION questions it also determines the mode (single or batch) and extracts the ID value if the user mentioned a specific row.

Internal class — not an endpoint.

```json
{
  "type": "PREDICTION | ANALYSIS | DATA_QUERY | UNCLEAR",
  "target_column": "column_name | null",
  "prediction_mode": "local_single | local_batch | null",
  "id_column": "column_name | null",
  "id_value": "value | null",
  "analysis_mode": "global | directional | class_specific | null",
  "direction": "increase | decrease | null",
  "target_class": "exact label | null",
  "is_clear": true,
  "clarifications": [],
  "unclear_answer": null
}
```

---

## SECTION 5 — Question Processor (4 handlers)

This section routes each classified question to the right handler and assembles the final structured result. Each handler calls the relevant prediction and SHAP functions from Sections 2 and 3. It does NOT generate the final text answer — that is passed to llm.py.

Internal class — not an endpoint.

### DATA_QUERY
1. GPT writes a pandas expression from the question + column context
2. Execute it on `df`
3. GPT formats the raw result into plain English
4. Return: `{ type, raw_result, answer }`

### PREDICTION — local_single
- Classifier extracts `target_column`, `id_column`, `id_value` from the question
- Auto-retrain if `target_column` differs from the current model (or no model exists yet)
1. `predict_local_single` → look up row by ID, encode, predict → prediction + confidence
2. `explain_shap_local_single` → top 8 SHAP factors for that row
3. Return structured result — LLM formatting handled by llm.py

### PREDICTION — local_batch
- Classifier extracts `target_column` from the question
- Auto-retrain if `target_column` differs from the current model (or no model exists yet)
1. `predict_local_batch` → predict all rows at once
2. `explain_shap_local_batch` → per-row SHAP (top 5) + aggregate (top 8)
3. Group rows by predicted label into `predicted_as`
4. Return structured result — LLM formatting handled by llm.py

### ANALYSIS
- Classifier extracts `target_column`, `analysis_mode`, `direction`, `target_class`
- Auto-retrain if `target_column` differs from the current model (or no model exists yet)
- Call the matching SHAP function (all modes sample up to 500 rows from `X` for speed):
  - **global** → `explain_shap_global` — `mean(abs(SHAP))` across all classes → top 8 by overall importance
  - **directional** → `explain_shap_directional` — signed `mean(SHAP)` on class index 1, filtered by direction → top 8 that increase or decrease the target
  - **class_specific** → `explain_shap_class_specific` — `mean(abs(SHAP))` for one specific class index → top 8 that drive that outcome
- Return structured result — LLM formatting handled by llm.py

### UNCLEAR
- Return clarifications + `unclear_answer` directly (no model needed)

---

## SECTION 6 — `/processQuestion` Endpoint

This is the main entry point. It validates the user, loads the cached data and model, builds context for the classifier, and routes to the right handler.

```
POST /processQuestion
Body: { chat_id: int, question: str }
```

1. Validate user & chat ownership
2. Get `cleaned_data_cache[chat_id]` — required, must call `/parse` first
3. Get `trained_models[chat_id]` — optional, can be null for DATA_QUERY and UNCLEAR
4. Build `df_context` (columns, sample rows, id_columns, target_column) and call `QuestionClassifier`
5. Route to the right handler:
   - **PREDICTION / ANALYSIS**: classifier infers `target_column` from the question → auto-retrain if it differs from the current model or no model exists yet
   - **DATA_QUERY / UNCLEAR**: no model needed

---

## Response Structures

**PREDICTION (local_single):** *"Will applicant A005 be approved?"*
```json
{
  "type": "PREDICTION",
  "mode": "local_single",
  "id_column": "applicant_id",
  "id_value": "A005",
  "prediction": "Approved",
  "confidence": 82.3,
  "shap_values": [
    { "feature": "income",       "shap_value":  0.42 },
    { "feature": "credit_score", "shap_value":  0.31 },
    { "feature": "age",          "shap_value": -0.08 }
  ]
}
```

**PREDICTION (local_batch):** *"Which applicants will be approved?"*
```json
{
  "type": "PREDICTION",
  "mode": "local_batch",
  "summary": { "total": 500, "Approved": 187, "Rejected": 313 },
  "predicted_as": {
    "Approved": ["A005", "A007", "A103"],
    "Rejected": ["A001", "A009", "A012"]
  },
  "shap_aggregate": [
    { "feature": "income",       "importance": 0.38 },
    { "feature": "credit_score", "importance": 0.29 }
  ],
  "results": [
    {
      "id_value": "A005",
      "prediction": "Approved",
      "confidence": 82.3,
      "shap_values": [
        { "feature": "income", "shap_value": 0.42 }
      ]
    }
  ]
}
```

**ANALYSIS (global):** *"What drives churn?"*
```json
{
  "type": "ANALYSIS",
  "mode": "global",
  "target_column": "churn",
  "direction": null,
  "target_class": null,
  "top_factors": [
    { "feature": "contract_type",    "importance": 0.38 },
    { "feature": "monthly_charges",  "importance": 0.29 }
  ]
}
```

**ANALYSIS (directional):** *"What increases churn?"*
```json
{
  "type": "ANALYSIS",
  "mode": "directional",
  "target_column": "churn",
  "direction": "increase",
  "target_class": null,
  "factors": [
    { "feature": "monthly_charges",          "shap_value": 0.22 },
    { "feature": "contract_month_to_month",  "shap_value": 0.18 }
  ]
}
```

**ANALYSIS (class_specific):** *"Why do some customers churn?"* — target column is `churn`, classes are `"Yes"` and `"No"`
```json
{
  "type": "ANALYSIS",
  "mode": "class_specific",
  "target_column": "churn",
  "direction": null,
  "target_class": "Yes",
  "top_factors": [
    { "feature": "contract_type",   "importance": 0.41 },
    { "feature": "monthly_charges", "importance": 0.33 },
    { "feature": "tenure",          "importance": 0.18 }
  ]
}
```

**DATA_QUERY:** *"How many customers are there?"*
```json
{
  "type": "DATA_QUERY",
  "raw_result": "5432",
}
```

**UNCLEAR:** *"Tell me something interesting"*
```json
{
  "type": "UNCLEAR",
  "answer": "Could you clarify what you meant? Here are some questions you could ask:",
  "clarifications": [
    "How many customers are there in total?",
    "What is the average customer age?",
    "What factors influence churn?"
  ]
}
```
