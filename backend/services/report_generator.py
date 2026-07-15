# backend/services/report_generator.py

from fpdf import FPDF
from typing import List, Dict, Callable


# ----------------------------
# FORMAT SHAP TABLE
# ----------------------------
def format_shap_table(shap_values):
    if not shap_values or not isinstance(shap_values, dict):
        return []

    table = [["Feature", "Impact"]]

    for k, v in shap_values.items():
        try:
            table.append([k, round(float(v), 4)])
        except:
            table.append([k, str(v)])

    return table


# ----------------------------
# GENERATE PDF
# ----------------------------
def generate_pdf(sections, summary, path="report.pdf"):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)

    pdf.add_page()

    # Title
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Audit Report", ln=True)

    pdf.ln(5)

    # Summary
    pdf.set_font("Arial", "", 12)
    pdf.multi_cell(0, 8, f"Summary:\n{summary}")

    pdf.ln(5)

    # Sections
    for i, section in enumerate(sections, start=1):
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 8, f"Case {i}", ln=True)

        pdf.set_font("Arial", "", 11)

        query = section.get("query", "")
        answer = section.get("answer", "")
        prediction = section.get("prediction", "")

        pdf.multi_cell(0, 6, f"Query: {query}")
        pdf.multi_cell(0, 6, f"Answer: {answer}")
        pdf.multi_cell(0, 6, f"Prediction: {prediction}")

        pdf.ln(3)

        # SHAP table
        table = section.get("shap_table", [])

        if table:
            for row in table:
                pdf.cell(90, 6, str(row[0]), border=1)
                pdf.cell(90, 6, str(row[1]), border=1)
                pdf.ln()
        else:
            pdf.cell(0, 6, "No explainability data available", ln=True)

        pdf.ln(5)

    pdf.output(path)
    return path


# ----------------------------
# MAIN GENERATOR
# ----------------------------
def generate_report(
    chat_data: List[Dict],
    llm_generate_summary: Callable[[str], str]
):
    sections = []

    for item in chat_data:
        query = item.get("query", {}).get("query_text", "")
        response = item.get("response", {})

        answer = response.get("answer", "")
        prediction = response.get("prediction", "")
        shap_values = response.get("shapValues")

        shap_table = format_shap_table(shap_values)

        sections.append({
            "query": query,
            "answer": answer,
            "prediction": prediction,
            "shap_table": shap_table
        })

    # DO NOT CRASH if SHAP is missing
    if not any(section.get("shap_table") for section in sections):
        for section in sections:
            section["shap_table"] = [["Feature", "Impact"], ["No data", "N/A"]]

    # Build LLM prompt
    prompt = "Generate a concise audit summary for the following cases:\n\n"

    for s in sections:
        prompt += f"- Query: {s['query']}\n"
        prompt += f"  Prediction: {s['prediction']}\n"

    # Generate summary
    try:
        summary = llm_generate_summary(prompt)
    except Exception:
        summary = "Summary generation failed."

    # Generate PDF
    return generate_pdf(sections, summary)