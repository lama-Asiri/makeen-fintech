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

How to interpret factors:
- Positive impact → increases likelihood of the outcome
- Negative impact → decreases likelihood of the outcome
- Stronger values → more influence

Adapt your answer based on the question:
- If user asks for one item → explain it
- If user asks to compare → compare
- If user asks to choose → choose and justify

Always:
- Start with the conclusion
- Then explain the strongest reasons
- Translate everything into real-world meaning
- End with a short summary reinforcing the conclusion

Example of good output:
"This employee is likely to leave the company. They have not been active recently and their workload has been consistently high, which can lead to burnout. Their relatively low salary compared to others in similar roles also makes staying less attractive. While their experience adds some stability, it is not enough to offset these pressures. Overall, the combination of high workload, low engagement, and weaker compensation makes leaving the more likely outcome."

Output only the final explanation. No extra text.
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
@router.post("/ask-with-file", response_model=LLMResponse)
async def ask_with_file(
    file: UploadFile = File(...),
    question: str = Form(...),
    prediction: str = Form(default=""),
    confidence: float = Form(default=0.0),
    shap_values: str = Form(default="{}")
):
    try:
        # Read file
        contents = await file.read()

        if file.filename.endswith(".csv"):
            df = pd.read_csv(StringIO(contents.decode()))
        else:
            df = pd.read_excel(BytesIO(contents))

        # Dataset summary (how data is actually read)
        data_summary = (
            f"Dataset '{file.filename}' with {df.shape[0]} rows and {df.shape[1]} columns. "
            f"Columns: {', '.join(df.columns)}"
        )

        # Better sample formatting
        sample_rows = df.head(5).to_dict(orient="records")
        sample_text = "\n".join(
            [", ".join(f"{k}: {v}" for k, v in row.items()) for row in sample_rows]
        )

        # Safe JSON parsing
        try:
            shap_data = json.loads(shap_values)
        except:
            raise HTTPException(status_code=400, detail="Invalid SHAP JSON format")

        shap_text = json.dumps(shap_data, indent=2)

        # Build prompt (clean)
        user_message = textwrap.dedent(f"""
        User question:
        {question}

        Prediction:
        {prediction} with {confidence * 100:.0f}% confidence

        Dataset summary:
        {data_summary}

        Sample data:
        {sample_text}

        Factors influencing results:
        {shap_text}
        """)

        answer = get_llm_response(SYSTEM_PROMPT, user_message)

        return LLMResponse(answer=answer)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))