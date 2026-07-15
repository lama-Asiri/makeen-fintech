# backend/services/report_generator.py

from typing import List, Dict, Any


async def generate_report(cases, summary_fn):
    full_report_text = ""

    if not cases:
        return "No data found"

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

    # Build report
    for i, case in enumerate(unique_cases, start=1):
        query = case.get("query", {}).get("query_text", "N/A")
        query = query.strip().rstrip("\\")
        response = case.get("response", {})

        answer = response.get("answer", "N/A")
        prediction = response.get("prediction", "None")
        shap = response.get("shapValues")

        full_report_text += f"Case {i}\n"
        full_report_text += "-" * 50 + "\n"

        full_report_text += f"Query:\n{query}\n\n"
        full_report_text += f"Answer:\n{answer}\n\n"
        full_report_text += f"Prediction: {prediction}\n\n"

        if shap and isinstance(shap, dict):
            full_report_text += "Feature Impact\n"
            for f, v in shap.items():
                clean_feature = str(f).replace("\n", " ").strip()
                full_report_text += f"{clean_feature:<40} {v:.4f}\n"
        else:
            full_report_text += "No explainability data available\n"

        full_report_text += "\n-------------------\n\n"

    # Generate summary
    try:
        summary = await summary_fn(full_report_text)
    except Exception:
        summary = "Summary generation failed."

    full_report_text += "\n" + "=" * 50 + "\n"
    full_report_text += "OVERALL SUMMARY\n"
    full_report_text += "=" * 50 + "\n"
    full_report_text += summary

    return full_report_text