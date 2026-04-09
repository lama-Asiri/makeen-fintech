# Question Processing Problem

## The Problem 

Our chat system only handles predictions.
Different questions need different processing.

## The Solution 

Build a smart classifier that understands any question and routes to the right processor.

```
Question → OpenAI (what type is this?) → Route to processor → Answer
```

We're handling 4 types:
1. **DATA_QUERY** - Lookups, stats, comparisons (e.g. "How many customers?", "What's the average salary?", "Compare revenue by region?")
2. **PREDICTION** - Will X happen? + why (e.g. "Will this customer churn?")
3. **ANALYSIS** - What drives X? + why (e.g. "What drives customer churn?", "What factors influence revenue?")
4. **UNCLEAR** - Ambiguous questions, ask for clarification

---

## Move EVERYTHING into ONE unified file: `data_processor.py`

This ONE file contains all ML/AI operations organized in 5 sections.

---

## SECTION 1: MODEL TRAINING & CACHING

**What it does:** Train and cache ML models for later use

### `/train` Endpoint
- Takes cleaned data from cache
- Encodes categorical features
- Splits data (80/20 train/test)
- Trains RandomForest model
- Evaluates model (accuracy for classification, R² for regression)
- Stores trained model in memory (`trained_models` cache)
- Returns metrics to user

---

## SECTION 2: PREDICTION & EXPLANATION

**What it does:** Make predictions and prepare SHAP values for explanation

### `/predict` Endpoint
- Gets trained model from cache
- Runs prediction on last row
- Calculates confidence score
- Returns: prediction + confidence + feature names

### `/explain` Endpoint
- Gets trained model from cache
- Calculates SHAP values (why the prediction happened)
- Extracts top 8 most important features
- Returns: SHAP values + feature names + prediction

**Note:** These SHAP values are sent to `llm.py` for final explanation in plain English

---

## SECTION 3: QUESTION CLASSIFICATION LOGIC

**What it is:** Internal logic (NOT an endpoint) that understands question types

This is a **CLASS** called `QuestionClassifier` that works behind the scenes.

### How it works:
1. Receives user question + df context (column names + 5 sample rows)
2. Sends to OpenAI: "What type is this question?"
3. OpenAI analyzes and returns:
   - `type`: Which of 4 types (DATA_QUERY, PREDICTION, ANALYSIS, UNCLEAR)
   - `is_clear`: Whether question is clear or ambiguous
   - `clarifications`: If unclear, suggests 3 options

### The 4 Types Identified:
- **Type 1: DATA_QUERY** - "How many?" / "Average?" / "Compare?"
- **Type 2: PREDICTION** - "Will churn?" / "Is fraud?"
- **Type 3: ANALYSIS** - "What drives?" / "Top factors?"
- **Type 4: UNCLEAR** - "Tell me about..." (needs clarification)

---

## SECTION 4: QUESTION PROCESSING LOGIC

**What it is:** Internal logic (NOT an endpoint) containing 4 handler functions

This is a **CLASS** called `QuestionProcessor` with 4 handler methods that execute based on question type.

### Handler 1: DATA_QUERY Processor
- **What:** Answers lookup/stats/comparison questions
- **How:** Uses LangChain PandasAgent to intelligently query data
- **Returns:** Direct answer (numbers/table/statistics)
- **Model needed:** NO
- **Example:** "How many customers?" → "You have 5,432 customers"

### Handler 2: PREDICTION Processor
- **What:** Answers "Will X happen?" questions
- **How:**
  1. Runs trained model → gets prediction
  2. Runs SHAP → identifies which factors influenced prediction
  3. Returns both to send to llm.py
- **Returns:** Prediction + Confidence + SHAP values
- **Model needed:** YES
- **Example:** "Will they churn?" → Returns prediction + confidence + factors, then llm.py explains in plain English

### Handler 3: ANALYSIS Processor
- **What:** Answers "What drives X?" questions
- **How:**
  1. Runs SHAP on entire dataset (all rows)
  2. Calculates mean absolute SHAP for each feature
  3. Ranks by importance
- **Returns:** Top 5 factors with importance scores
- **Model needed:** YES
- **Example:** "What drives churn?" → Returns top 5 factors, then llm.py explains what each means for business

### Handler 4: UNCLEAR Processor
- **What:** Handles vague/ambiguous questions
- **How:**
  1. OpenAI suggests 3 clarification options based on question
  2. Returns suggestions to user
  3. Waits for user to pick one
  4. That pick becomes a Type 1, 2, or 3 question
- **Returns:** "Did you mean: 1) ... 2) ... 3) ..."
- **Model needed:** NO
- **Example:** "Tell me about customers" → "Did you mean: 1) How many? 2) Average age? 3) By region?"

---

## SECTION 5: MAIN QUESTION ENDPOINT

**What it does:** Orchestrates the entire question processing flow

### `/processQuestion` Endpoint

This is the main endpoint that ties everything together:

1. **Validate** user & chat
2. **Get** cached cleaned data
3. **Get** cached trained model (if available)
4. **Call** QuestionClassifier (Section 3 logic)
   - Identifies which type the question is
   - Checks if question is clear
5. **Route** based on classification:
   - If Type 4 (UNCLEAR) → Return suggestions
   - If Type 1 (DATA_QUERY) → Execute Handler 1
   - If Type 2 (PREDICTION) → Execute Handler 2
   - If Type 3 (ANALYSIS) → Execute Handler 3
6. **Send results** to llm.py for final explanation
   - For Type 2 & 3: Send SHAP values + data context
   - llm.py explains in plain English (60-120 words)
7. **Save** question + answer to database
8. **Return** complete response to user

### Response Structure:

```json
{
  "type": "PREDICTION",
  "prediction": "Yes",
  "confidence": 0.87,
  "shap_values": {"inactive_days": 0.42, "support_tickets": 0.31},
  "answer": "Yes, they will churn because they haven't been active in 60 days and have unresolved support tickets.",
  "explanation_needed": true
}
```

---

## Complete Flow: How Everything Works Together

```
1. User asks question
   ↓
2. /processQuestion endpoint (Section 5)
   ├─ Validates user
   └─ Gets cached data & model
   ↓
3. QuestionClassifier (Section 3 logic)
   ├─ Analyzes question
   ├─ Sends to OpenAI with df context
   └─ Returns type (1, 2, 3, or 4)
   ↓
4. QuestionProcessor (Section 4 logic)
   ├─ Routes to appropriate handler:
   │  ├─ Handler 1: DATA_QUERY (if Type 1)
   │  ├─ Handler 2: PREDICTION (if Type 2)
   │  ├─ Handler 3: ANALYSIS (if Type 3)
   │  └─ Handler 4: UNCLEAR (if Type 4)
   └─ Executes handler
   ↓
5. For Type 2 & 3: Send to llm.py
   ├─ Send: Question + Results + SHAP values + data context
   ├─ llm.py calls GPT-4o-mini
   └─ Returns: Plain English explanation (60-120 words)
   ↓
6. Save to database
   └─ Store: Question + Answer + Question type
   ↓
7. Return to user
   └─ Complete response with explanation
```

---

## File Structure

### `data_processor.py` (NEW - All ML/Question Logic)
Contains 5 sections:
1. Model Training & Caching
2. Prediction & Explanation
3. QuestionClassifier (logic)
4. QuestionProcessor (logic)
5. Main /processQuestion endpoint

### `llm.py` (EXISTING - Explanation)
- `/ask-with-file` endpoint
- Takes results + SHAP values
- Calls OpenAI GPT-4o-mini
- Returns plain English explanation
- NO CHANGES NEEDED

### `auth.py` (EXISTING - Authentication)
- Keep as is
- No changes

### `main.py` (EXISTING - App Setup)
- Just register `data_processor` router
- No other changes


---
