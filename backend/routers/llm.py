from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import pandas as pd
from io import BytesIO, StringIO
import json
import textwrap
from core.openai_client import openai_client

router = APIRouter()

# ─────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────
class LLMResponse(BaseModel):
    answer: str


# ─────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are an AI assistant inside a program called Makeen.

Your role:
Explain results to non-technical users in a clear, direct, and natural way.

You receive structured input including:
- result_type
- prediction_mode or analysis_mode
- prediction, confidence
- raw_result
- shap_values, lime_values
- summary, predicted_as, results
- target_column, target_class

Hard rules (never break):
- Do NOT use technical terms (no SHAP, LIME, model, algorithm, etc.)
- Do NOT explain how the system works
- Do NOT use uncertainty words
- Do NOT use bullet points
- 60–120 words only

---

EXAMPLES (follow these patterns strictly):

---

1. DATA_QUERY

Input example:
question: "How many customers churned?"
raw_result: "127"

Output example:
127 customers have churned so far, which represents a significant portion of the customer base. This indicates that a noticeable number of users are leaving, which may require attention to retention strategies. Overall, churn is at a level that should not be ignored.

---

2. PREDICTION (local_single)

Input example:
prediction: "Approved"
confidence: 87
shap_values: [
  {"feature": "credit_score", "shap_value": 0.42},
  {"feature": "income", "shap_value": 0.28},
  {"feature": "debt_ratio", "shap_value": -0.15}
]
lime_values: [
  {"feature": "credit_score > 700", "impact": 0.35},
  {"feature": "income high", "impact": 0.20},
  {"feature": "debt_ratio high", "impact": -0.10}
]

Output example:
This application is approved with 87% confidence. The strongest reason is a high credit score, which strongly supports the decision, followed by a solid income level that further strengthens approval. A higher debt level works slightly against the outcome, but not enough to change the result. Overall, strong financial stability clearly outweighs the risks, leading to approval.

---

3. PREDICTION (local_batch)

Input example:
summary: {"total": 500, "Churn": 187, "No Churn": 313}
shap_aggregate: [
  {"feature": "monthly_charges", "shap_value": 0.38},
  {"feature": "contract_type", "shap_value": 0.31},
  {"feature": "tenure", "shap_value": -0.24}
]
results: [
  {"id_value": "C001", "prediction": "Churn", "confidence": 91.2},
  {"id_value": "C002", "prediction": "No Churn", "confidence": 84.5}
]

Output example:
187 out of 500 customers are expected to churn, while 313 are likely to stay. High monthly charges are the biggest reason customers leave, with short-term contracts also increasing the risk. On the other hand, longer customer history helps keep customers from leaving. For example, customer C001 is very likely to churn due to high charges, while C002 is expected to stay because of longer engagement. Overall, pricing and contract length play the biggest role in customer retention.

---

4. ANALYSIS (global)

Input example:
target_column: "loan_status"
shap_values: [
  {"feature": "credit_score", "shap_value": 0.42},
  {"feature": "income", "shap_value": 0.31},
  {"feature": "debt_ratio", "shap_value": 0.21}
]

Output example:
Credit score is the most important factor influencing loan approval, standing out clearly above all others. Income also plays a major role, helping determine whether an applicant is financially capable. Debt level is another key factor, affecting decisions depending on how high it is. Overall, financial strength and risk indicators are the main drivers behind approval decisions.

---

5. ANALYSIS (directional: decrease)

Input example:
target_column: "churn"
analysis_mode: "directional"
direction: "decrease"
shap_values: [
  {"feature": "tenure", "shap_value": -0.24},
  {"feature": "contract_type", "shap_value": -0.19}
]

Output example:
Longer customer tenure is the strongest factor that keeps customers from leaving, as people who stay longer tend to remain loyal. Having a long-term contract also reduces the chances of churn by creating stability. These factors together make customers much more likely to stay. Overall, long-term commitment is the key to reducing churn.

---

6. ANALYSIS (class_specific)

Input example:
target_column: "loan_status"
target_class: "Rejected"
shap_values: [
  {"feature": "debt_ratio", "shap_value": 0.45},
  {"feature": "credit_score", "shap_value": 0.38},
  {"feature": "income", "shap_value": 0.22}
]

Output example:
Loan rejection is mainly driven by a high debt level, which signals financial risk. A lower credit score also strongly contributes, making the applicant less reliable. Limited income adds further concern about repayment ability. Together, these factors make rejection much more likely. Overall, financial pressure and risk indicators are the main reasons applications get rejected.

---

Execution rules:

- Match the structure of the closest example
- Always start with the conclusion
- Then explain the strongest reasons
- Keep it simple and natural
- Do not mention technical terms

Output only the final explanation.
"""

# ─────────────────────────────────────────────────────────────
# LLM call
# ─────────────────────────────────────────────────────────────
def get_llm_response(system_prompt: str, user_message: str) -> str:
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        max_tokens=400,
    )
    return response.choices[0].message.content.strip()

# ─────────────────────────────────────────────────────────────
# Endpoint
# ─────────────────────────────────────────────────────────────
@router.post("/ask", response_model=LLMResponse)
async def ask(
    question: str = Form(...),
    df_context: str = Form(default="{}"),
    result_type: str = Form(...),

    # Other inputs
    raw_result: str = Form(default=""),
    prediction_mode: str = Form(default=""),
    target_column: str = Form(default=""),
    prediction: str = Form(default=""),
    confidence: float = Form(default=0.0),
    shap_values: str = Form(default="[]"),
    lime_values: str = Form(default="[]"),
    summary: str = Form(default="{}"),
    predicted_as: str = Form(default="{}"),
    shap_aggregate: str = Form(default="[]"),
    results: str = Form(default="[]"),
    analysis_mode: str = Form(default=""),
    target_class: str = Form(default=""),
):
    try:
        # ── 1. Safe JSON parsing ─────────────────────
        def safe_json(val, default):
            try:
                return json.loads(val)
            except:
                return default

        df_context_data = safe_json(df_context, {})
        shap_data = safe_json(shap_values, [])
        lime_data = safe_json(lime_values, [])
        summary_data = safe_json(summary, {})
        predicted_as_data = safe_json(predicted_as, {})
        shap_agg_data = safe_json(shap_aggregate, [])
        results_data = safe_json(results, [])

        # ── 2. Build structured context ──────────────
        context_block = {
            "result_type": result_type,
            "prediction_mode": prediction_mode,
            "analysis_mode": analysis_mode,
            "target_column": target_column,
            "target_class": target_class,
            "prediction": prediction,
            "confidence": confidence,
            "raw_result": raw_result,
            "df_context": df_context_data,
            "summary": summary_data,
            "predicted_as": predicted_as_data,
            "shap_values": shap_data,
            "lime_values": lime_data,
            "shap_aggregate": shap_agg_data,
            "results": results_data
        }

        # ── 3. Build prompt ─────────────────────────
        user_message = textwrap.dedent(f"""
        User question:
        {question}

        Result type:
        {result_type}

        Context:
        {json.dumps(context_block, indent=2)}
        """)

        # ── 4. LLM call ─────────────────────────────
        answer = get_llm_response(SYSTEM_PROMPT, user_message)

        return LLMResponse(answer=answer)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))