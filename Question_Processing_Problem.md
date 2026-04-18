# Question Processing 

## The Problem

Our chat system only handled predictions. Different questions need different processing — lookups, predictions, analysis, follow-ups, and unclear inputs all need to be handled differently.

## The Solution

```
Question → Classify (OpenAI) → Route to handler → Return structured results
                                                            ↓
                                              llm.py generates the final answer the user sees
```

We handle 5 question types:
1. **DATA_QUERY** — Stats and lookups ("How many customers?", "Average salary by region?")
2. **PREDICTION** — Predict an outcome for one row or all rows, with SHAP explanation
3. **ANALYSIS** — What drives the target? ("What factors influence churn?")
4. **HISTORY_EXPLANATION** — Follow-up or clarification on a previous result ("why?", "explain more")
5. **UNCLEAR** — Ambiguous question, return clarification suggestions

---

## File: `data_processor.py` — 6 sections

```
SECTION 1  — /train endpoint
SECTION 2  — Core prediction logic (internal)
SECTION 3  — SHAP explanation logic (internal)
SECTION 4  — Question Classifier class
SECTION 5  — Question Processor class (5 handlers)
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
1. Look up the row in `df` by ID (matches value in any column, not just ID columns)
2. Encode using the same encoders from training
3. Align columns to `feature_names`
4. Run `model.predict()` + `model.predict_proba()`
5. Write result to `prediction_cache[chat_id]` so SHAP can read it without re-predicting
6. Return: `{ prediction, confidence, predicted_class_index }`

### `predict_local_batch(chat_id)`
1. Get fully-encoded `X` from `trained_models[chat_id]`
2. Run `model.predict()` + `model.predict_proba()` on all rows at once
3. Pair each prediction with its ID from `df`
4. Return: `{ results: [{id_column, id_value, prediction, confidence}, ...], summary: {total, <label>: count}, predicted_class_indices }`

---

## SECTION 3 — SHAP Explanation Logic

This section explains why the model made each prediction. SHAP assigns each feature a value showing how much it pushed the prediction up or down. There are 5 functions covering single, batch, global, directional, and class-specific explanations.

All functions return `shap_value` as the key name. Positive = pushed prediction up, negative = pulled it down.

These are internal functions called by the handlers in Section 5, not endpoints.

### `explain_shap_local_single(chat_id)`
- Reads the encoded row from `prediction_cache[chat_id]`
- Runs `TreeExplainer` on that single row
- Returns top 8 features sorted by `abs(shap_value)` — signed values

### `explain_shap_local_batch(chat_id, batch_result)`
- Runs `TreeExplainer` once on all rows in `X` (efficient — one call)
- **per_row**: top 3 features per row, signed shap_values
- **aggregate**: `mean(abs(SHAP))` across all rows → top 8 overall factors (unsigned)

### `explain_shap_global(chat_id)`
- Samples up to 500 rows for speed
- Computes **signed** `mean(SHAP)` on class index 1 (the positive/higher-sorted class)
- Returns top 8 by absolute value — positive means pushes prediction up, negative pulls it down
- Used by ANALYSIS `global` mode

### `explain_shap_directional(chat_id, direction)`
- Same signed mean as global, but filtered by direction
- `direction = "increase"` → only features with positive mean SHAP
- `direction = "decrease"` → only features with negative mean SHAP
- Returns top 8 in the requested direction
- Used by ANALYSIS `directional` mode

### `explain_shap_class_specific(chat_id, target_class)`
- `mean(abs(SHAP))` for one specific predicted class index
- Returns top 8 by absolute importance for that class
- Used by ANALYSIS `class_specific` mode

---

## SECTION 4 — Question Classifier

This section classifies the user's question into one of the 5 types and extracts relevant info. It calls OpenAI with the question, dataset context (column names + sample rows), and recent conversation history, then returns structured JSON. Recent history (last 3 turns) is passed so the classifier can detect follow-up questions accurately.

Internal class — not an endpoint.

```json
{
  "type": "PREDICTION | ANALYSIS | DATA_QUERY | HISTORY_EXPLANATION | UNCLEAR",
  "history_mode": "last | full | null",
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

**`history_mode`** is only set for `HISTORY_EXPLANATION`:
- `"last"` — vague follow-up referring to the most recent result ("why?", "explain", "tell me more")
- `"full"` — references something specific from an older turn ("explain the batch prediction", "go back to the first analysis")

---

## SECTION 5 — Question Processor (5 handlers)

This section routes each classified question to the right handler and assembles the final structured result. Each handler calls the relevant prediction and SHAP functions from Sections 2 and 3. It does NOT generate the final text answer — that is passed to llm.py.

Internal class — not an endpoint.

### DATA_QUERY
1. GPT writes a pandas expression from the question + column context
2. Execute it on `df`
3. Return: `{ type, raw_result }`

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
2. `explain_shap_local_batch` → per-row SHAP (top 3) + aggregate (top 8)
3. Group rows by predicted label into `predicted_as`
4. Return structured result — LLM formatting handled by llm.py

### ANALYSIS
- Classifier extracts `target_column`, `analysis_mode`, `direction`, `target_class`
- Auto-retrain if `target_column` differs from the current model (or no model exists yet)
- Call the matching SHAP function (all modes sample up to 500 rows from `X` for speed):
  - **global** → `explain_shap_global` — signed `mean(SHAP)` on class index 1 → top 8 by |shap|
  - **directional** → `explain_shap_directional` — signed mean filtered by direction → top 8 that increase or decrease the target
  - **class_specific** → `explain_shap_class_specific` — `mean(abs(SHAP))` for one specific class → top 8 that drive that outcome
- Return structured result — LLM formatting handled by llm.py

### HISTORY_EXPLANATION
- `history_mode = "last"` → read from in-memory `chat_history_cache[chat_id]` (last 3 turns)
- `history_mode = "full"` → load all Q&A pairs from the database (`Query` + `Response` tables)
- If no history available: return a message asking the user to ask a question first
- Calls GPT with the full conversation history as messages to generate a plain-language explanation
- Return: `{ type, answer }` — plain text, no structured data

### UNCLEAR
- Return clarifications + `unclear_answer` directly (no model needed)

---

## SECTION 6 — `/processQuestion` Endpoint

This is the main entry point. It validates the user, loads the cached data and model, builds context for the classifier, and routes to the right handler. After processing, it updates the in-memory history cache (last 3 turns) so future HISTORY_EXPLANATION questions work.

```
POST /processQuestion
Body: { chat_id: int, question: str }
```

1. Validate user & chat ownership
2. Get `cleaned_data_cache[chat_id]` — auto-recovers from Supabase if missing (server restart)
3. Get `trained_models[chat_id]` — optional, can be null for DATA_QUERY and UNCLEAR
4. Build `df_context` (columns, sample rows, id_columns, target_column) and call `QuestionClassifier` with recent history
5. Route to the right handler:
   - **HISTORY_EXPLANATION**: reads from `chat_history_cache` or DB depending on `history_mode`
   - **PREDICTION / ANALYSIS**: classifier infers `target_column` from the question → auto-retrain if it differs from the current model or no model exists yet
   - **DATA_QUERY / UNCLEAR**: no model needed
6. Append `{ question, answer }` to `chat_history_cache[chat_id]`, keep last 3

---

## Response Structures

**PREDICTION (local_single):** *"Will applicant A005 be approved?"*
```json
{
  "type": "PREDICTION",
  "mode": "local_single",
  "id_column": "applicant_id",
  "id_value": "A005",
  "prediction": "yes",
  "confidence": 82.3,
  "shap_values": [
    { "feature": "credit_score", "shap_value":  0.31 },
    { "feature": "income",       "shap_value":  0.28 },
    { "feature": "age",          "shap_value": -0.08 }
  ]
}
```

**PREDICTION (local_batch):** *"Which applicants will be approved?"*
```json
{
  "type": "PREDICTION",
  "mode": "local_batch",
  "summary": { "total": 20, "yes": 13, "no": 7 },
  "predicted_as": {
    "yes": ["A001", "A003", "A005"],
    "no":  ["A002", "A004", "A007"]
  },
  "shap_aggregate": [
    { "feature": "credit_score", "shap_value": 0.38 },
    { "feature": "income",       "shap_value": 0.29 }
  ],
  "results": [
    {
      "id_value": "A001",
      "prediction": "yes",
      "confidence": 82.3,
      "shap_values": [
        { "feature": "credit_score", "shap_value": 0.31 }
      ]
    }
  ]
}
```

**ANALYSIS (global):** *"What drives approval?"*
```json
{
  "type": "ANALYSIS",
  "mode": "global",
  "target_column": "approved",
  "direction": null,
  "target_class": null,
  "shap_values": [
    { "feature": "credit_score", "shap_value":  0.38 },
    { "feature": "income",       "shap_value":  0.29 },
    { "feature": "loan_amount",  "shap_value": -0.12 }
  ]
}
```

**ANALYSIS (directional):** *"What increases approval chances?"*
```json
{
  "type": "ANALYSIS",
  "mode": "directional",
  "target_column": "approved",
  "direction": "increase",
  "target_class": null,
  "shap_values": [
    { "feature": "credit_score", "shap_value": 0.38 },
    { "feature": "income",       "shap_value": 0.29 }
  ]
}
```

**ANALYSIS (class_specific):** *"What makes someone get approved?"*
```json
{
  "type": "ANALYSIS",
  "mode": "class_specific",
  "target_column": "approved",
  "direction": null,
  "target_class": "yes",
  "shap_values": [
    { "feature": "credit_score", "shap_value": 0.41 },
    { "feature": "income",       "shap_value": 0.33 },
    { "feature": "loan_term",    "shap_value": 0.18 }
  ]
}
```

**HISTORY_EXPLANATION:** *"Why?" / "Explain more" / "What drove that result?"*
```json
{
  "type": "HISTORY_EXPLANATION",
  "answer": "The applicant was predicted as approved mainly because their credit score of 780 is well above average, which strongly signals low risk to the model. Their income of $85,000 also helped. The loan amount was relatively high but not enough to outweigh those positives."
}
```

**DATA_QUERY:** *"How many applicants were approved?"*
```json
{
  "type": "DATA_QUERY",
  "raw_result": "13"
}
```

**UNCLEAR:** *"Tell me something interesting"*
```json
{
  "type": "UNCLEAR",
  "answer": "Could you clarify what you meant? Here are some questions you could ask:",
  "clarifications": [
    "How many applicants have a credit score above 700?",
    "Will applicant A007 be approved?",
    "What factors most influence loan approval?"
  ]
}
```
