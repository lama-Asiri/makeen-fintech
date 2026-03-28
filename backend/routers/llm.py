from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.openai_client import openai_client

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# /test-llm — confirmed working, used to verify OpenAI connection
# Keep this as-is for testing. Do not remove.
# ─────────────────────────────────────────────────────────────────────────────

class LLMRequest(BaseModel):
    question: str
    data_summary: str = ""
    shap_values: dict = {}


class LLMResponse(BaseModel):
    answer: str


@router.post("/test-llm", response_model=LLMResponse)
async def test_llm(body: LLMRequest):
    """
    Test endpoint — confirmed working. Sends a plain question to GPT-4o-mini.
    Keep for testing. The real pipeline endpoint is /ask below.
    """
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI explainability assistant. Answer questions about data predictions clearly and simply, without technical jargon.",
                },
                {
                    "role": "user",
                    "content": body.question,
                },
            ],
            max_tokens=500,
        )
        answer = response.choices[0].message.content
        return LLMResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# /ask — the REAL pipeline endpoint (task #15)
# ─────────────────────────────────────────────────────────────────────────────
#
# REEM — this is your main task (#15)
#
# What this endpoint should do:
#   1. Receive the user's question + data summary + SHAP values from the frontend
#      (these come from /explain after Rahaf finishes #17)
#   2. Build a structured prompt that includes:
#      - The user's natural language question
#      - A summary of the dataset (columns, number of rows, target column)
#      - The prediction result ("Churn" or "Not Churn", with confidence %)
#      - The SHAP values (which features pushed the prediction up or down)
#   3. Send the prompt to GPT-4o-mini
#   4. Return the answer in plain English — no jargon, no markdown, like explaining to a friend
#
# Input:
#   {
#     "question": "Will this customer churn?",
#     "prediction": "Churn",
#     "confidence": 0.87,
#     "data_summary": "Dataset: customer_data.csv | 1000 rows | Target: Exited",
#     "shap_values": {
#       "Age": 0.38,
#       "Balance": -0.27,
#       "NumProducts": 0.18
#     }
#   }
#
# Output: { "answer": "Based on the data, this customer is likely to churn..." }
#
# Prompt design tips:
#   - Tell GPT it is an XAI assistant helping non-technical users understand predictions
#   - Tell it to explain SHAP values in plain English
#     e.g. "Age pushed the prediction toward Churn because older customers tend to leave more"
#   - Tell it NOT to use technical terms like SHAP, feature importance, model, etc.
#   - Keep answers under 150 words — concise is better for a chat UI
#   - Use max_tokens=400
#

class AskRequest(BaseModel):
    question: str
    prediction: str = ""
    confidence: float = 0.0
    data_summary: str = ""
    shap_values: dict = {}


@router.post("/ask", response_model=LLMResponse)
async def ask(body: AskRequest):
    """
    Real pipeline endpoint — receives question + SHAP values, returns a plain-English explanation.
    REEM: fill in the prompt below once /explain (Rahaf #17) is ready.
    """
    try:
        # TODO Reem: build the system prompt
        # This tells GPT its role and how to behave
        # system_prompt = """
        # You are an AI explainability assistant for a tool called Makeen.
        # Your job is to help non-technical users understand why an AI made a prediction.
        # Rules:
        # - Never use technical terms like SHAP, feature importance, model, or algorithm
        # - Explain in plain English, as if talking to a friend
        # - Keep your answer under 150 words
        # - Be confident and direct — don't say "it might be" or "possibly"
        # """

        # TODO Reem: build the user message that includes all the context
        # Format the SHAP values as readable sentences, e.g.:
        #   "Age (strong reason to predict Churn)"
        #   "Balance (reason against Churn)"
        #
        # shap_explanation = "\n".join([
        #     f"- {feature}: {'pushes toward' if value > 0 else 'pushes against'} {body.prediction} (strength: {abs(value):.2f})"
        #     for feature, value in sorted(body.shap_values.items(), key=lambda x: abs(x[1]), reverse=True)
        # ])
        #
        # user_message = f"""
        # Dataset info: {body.data_summary}
        # User question: {body.question}
        # Prediction: {body.prediction} (confidence: {body.confidence * 100:.0f}%)
        # Key factors:
        # {shap_explanation}
        #
        # Please explain this prediction in plain English.
        # """

        # TODO Reem: send to GPT and return the answer
        # response = openai_client.chat.completions.create(
        #     model="gpt-4o-mini",
        #     messages=[
        #         {"role": "system", "content": system_prompt},
        #         {"role": "user", "content": user_message},
        #     ],
        #     max_tokens=400,
        # )
        # answer = response.choices[0].message.content
        # return LLMResponse(answer=answer)

        # Remove this line once implemented
        raise HTTPException(status_code=501, detail="Not implemented yet — Reem fill this in")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
