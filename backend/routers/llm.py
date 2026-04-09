from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.openai_client import openai_client

router = APIRouter()

# ─────────────────────────────────────────────────────────────
# Request/Response models
# ─────────────────────────────────────────────────────────────
class LLMRequest(BaseModel):
    question: str
    data_summary: str = ""
    shap_values: dict = {}


class LLMResponse(BaseModel):
    answer: str


class AskRequest(BaseModel):
    question: str
    prediction: str = ""
    confidence: float = 0.0
    data_summary: str = ""
    shap_values: dict = {}


# ─────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are an AI assistant inside a program called Makeen.

Your role:
Explain AI prediction results to non-technical users so they clearly understand what happened and why.

Context:
- You receive a user question, a prediction result, a confidence level, and key factors that influenced the result (SHAP Values), data file (use this to know the context).
- The goal is to translate this into a simple, human explanation.

Hard rules (never break these):
- Do NOT use any technical terms (no "SHAP", "feature importance", "model", "algorithm", "prediction score")
- Do NOT explain how the system works internally
- Do NOT use uncertainty language ("might", "could", "possibly")
- Do NOT repeat the input text word-for-word
- Do NOT use bullet points, lists, or formatting
- Keep the response between 60 and 120 words

Style:
- Plain, everyday language
- Natural and easy to read
- Confident and direct

Structure (always follow this order):
1. Start with the final outcome clearly (e.g. "This customer is likely to churn.")
2. Immediately explain the main reasons (focus on the 2-4 strongest factors only)
3. Translate each factor into a real-world meaning (not data terms)
4. End with a short summary reinforcing the conclusion

How to interpret factors:
- Positive impact → increases likelihood of the outcome
- Negative impact → decreases likelihood of the outcome
- Stronger values → more influence

Example of good output:
"This customer is likely to leave. Their age places them in a group that tends to switch services more often, and having multiple products increases that risk. A higher balance slightly reduces the chance of leaving, but not enough to outweigh the other factors. Overall, the stronger signals point toward leaving."

Output only the final explanation. No extra text.
"""


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────
def format_shap_values(shap_values: dict, prediction: str) -> str:
    if not shap_values:
        return "No strong factors available."

    top_factors = sorted(
        shap_values.items(),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:4]

    return "\n".join([
        f"{feature}: {'increases' if value > 0 else 'reduces'} the likelihood of {prediction} (impact {abs(value):.2f})"
        for feature, value in top_factors
    ])


def build_user_message(body: AskRequest, shap_explanation: str) -> str:
    return f"""
User question:
{body.question}

Prediction:
{body.prediction} with {body.confidence * 100:.0f}% confidence

Dataset:
{body.data_summary}

Key factors influencing this result:
{shap_explanation}

Explain the result in simple, non-technical language.
"""


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
# /test-llm — simple test endpoint
# ─────────────────────────────────────────────────────────────
@router.post("/test-llm", response_model=LLMResponse)
async def test_llm(body: LLMRequest):
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an AI explainability assistant. Answer questions about data predictions clearly and simply, without technical jargon."},
                {"role": "user", "content": body.question},
            ],
            max_tokens=500,
        )
        answer = response.choices[0].message.content.strip()
        return LLMResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────
# /ask — main endpoint for explanations
# ─────────────────────────────────────────────────────────────
@router.post("/ask", response_model=LLMResponse)
async def ask(body: AskRequest):
    try:
        shap_explanation = format_shap_values(body.shap_values, body.prediction)
        user_message = build_user_message(body, shap_explanation)
        answer = get_llm_response(SYSTEM_PROMPT, user_message)
        return LLMResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))