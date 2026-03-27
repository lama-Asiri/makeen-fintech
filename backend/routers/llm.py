from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.openai_client import openai_client

router = APIRouter()


class LLMRequest(BaseModel):
    question: str
    data_summary: str = ""
    shap_values: dict = {}


class LLMResponse(BaseModel):
    answer: str


@router.post("/test-llm", response_model=LLMResponse)
async def test_llm(body: LLMRequest):
    """
    Test endpoint — sends a plain question to GPT-4o-mini and returns the answer.
    Replace this with the real pipeline call once SHAP (#17) is wired.
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
