# backend/services/report_generator.py

from typing import List, Dict, Any


async def generate_report(cases, summary_fn) -> Dict[str, Any]:
    if not cases:
        return {"cases": [], "summary": "No data found"}

    # Remove duplicates
    seen = set()
    unique_cases = []
    for case in cases:
        key = (
    case.get("query", {}).get("query_text"),
    case.get("response", {}).get("answer")
)
        if key not in seen:
            seen.add(key)
            unique_cases.append(case)

    # Build both the structured cases (for chart rendering on the frontend) and a
    # flattened text blob (fed to summary_fn — the LLM summary prompt just needs
    # plain text, not structure).
    result_cases = []
    full_report_text = ""

    for i, case in enumerate(unique_cases, start=1):
        query = case.get("query", {}).get("query_text", "N/A")
        query = query.strip().rstrip("\\")
        response = case.get("response", {})

        answer = response.get("answer", "N/A")
        prediction = response.get("prediction", "None")
        shap = response.get("shapValues")
        compliance = response.get("compliance") or []

        shap_values = []
        if shap and isinstance(shap, dict):
            shap_values = sorted(
                (
                    {"feature": str(f).replace("\n", " ").strip(), "value": v}
                    for f, v in shap.items()
                ),
                key=lambda x: abs(x["value"]),
                reverse=True,
            )

        result_cases.append({
            "index": i,
            "query": query,
            "answer": answer,
            "prediction": prediction,
            "shapValues": shap_values,
            "compliance": compliance,
        })

        full_report_text += f"Case {i}\n"
        full_report_text += "-" * 50 + "\n"
        full_report_text += f"Query:\n{query}\n\n"
        full_report_text += f"Answer:\n{answer}\n\n"
        full_report_text += f"Prediction: {prediction}\n\n"
        if shap_values:
            full_report_text += "Feature Impact\n"
            for f in shap_values:
                full_report_text += f"{f['feature']:<40} {f['value']:.4f}\n"
        else:
            full_report_text += "No explainability data available\n"
        if compliance:
            full_report_text += "\nCompliance Basis\n"
            for entry in compliance:
                full_report_text += f"{entry['regulation']}\n{entry['text']}\n\n"
        full_report_text += "\n-------------------\n\n"

    # Generate summary
    try:
        summary = await summary_fn(full_report_text)
    except Exception:
        summary = "Summary generation failed."

    return {"cases": result_cases, "summary": summary}