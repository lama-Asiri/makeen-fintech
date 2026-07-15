# app/services/report_generator.py

from fpdf import FPDF


def is_explainability_response(response):
    return (
        response.get("shapValues") is not None
        and len(response.get("shapValues", {})) > 0
    )


def format_shap_table(shap_values):
    return sorted(
        shap_values.items(),
        key=lambda x: abs(x[1]),
        reverse=True
    )


def build_section(query, response):
    return {
        "question": query["query_text"],
        "prediction": response.get("prediction", "N/A"),
        "explanation": response.get("answer", ""),
        "shap_table": format_shap_table(response.get("shapValues", {}))
    }


def build_summary_input(sections):
    blocks = []

    for sec in sections:
        top = sec["shap_table"][:3]

        features = ", ".join([
            f"{k} ({round(v, 3)})" for k, v in top
        ])

        blocks.append(
            f"Q: {sec['question']}\n"
            f"Prediction: {sec['prediction']}\n"
            f"Drivers: {features}\n"
        )

    return "\n".join(blocks)


class ReportPDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 16)
        self.cell(0, 10, "AI Audit Report", 0, 1, "C")
        self.ln(5)


def generate_pdf(sections, summary, path="report.pdf"):
    pdf = ReportPDF()
    pdf.add_page()

    # Summary
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Overall Summary", 0, 1)

    pdf.set_font("Arial", "", 10)
    pdf.multi_cell(0, 8, summary)
    pdf.ln(5)

    # Sections
    for i, sec in enumerate(sections, 1):

        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, f"Case {i}", 0, 1)

        pdf.set_font("Arial", "B", 10)
        pdf.cell(0, 8, "Question:", 0, 1)

        pdf.set_font("Arial", "", 10)
        pdf.multi_cell(0, 8, sec["question"])

        pdf.set_font("Arial", "B", 10)
        pdf.cell(0, 8, "Prediction:", 0, 1)

        pdf.set_font("Arial", "", 10)
        pdf.cell(0, 8, str(sec["prediction"]), 0, 1)

        pdf.set_font("Arial", "B", 10)
        pdf.cell(0, 8, "Explanation:", 0, 1)

        pdf.set_font("Arial", "", 10)
        pdf.multi_cell(0, 8, sec["explanation"])

        pdf.set_font("Arial", "B", 10)
        pdf.cell(0, 8, "Feature Contributions:", 0, 1)

        pdf.set_font("Arial", "", 10)
        for f, v in sec["shap_table"]:
            pdf.cell(0, 8, f"{f}: {round(v, 4)}", 0, 1)

        pdf.ln(5)

    pdf.output(path)


def generate_report(chat_data, llm_fn):
    sections = []

    for item in chat_data:
        q = item["query"]
        r = item["response"]

        if is_explainability_response(r):
            sections.append(build_section(q, r))

    if not sections:
        raise ValueError("No explainability results found")

    summary_input = build_summary_input(sections)

    prompt = f"""
    Summarize these model decisions for an audit report.
    Focus on key drivers and consistency.

    {summary_input}
    """

    summary = llm_fn(prompt)

    generate_pdf(sections, summary)

    return "report.pdf"