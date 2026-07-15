# backend/services/compliance.py

# Rule-based compliance mapping — NOT an LLM/legal-reasoning engine. 
# Decides which regulations apply based on decision domain (credit vs fraud, from target_column)
# and outcome (adverse vs favorable), and fills the text with this case's actual
# prediction + top SHAP drivers, so it reads as specific to this decision rather
# than a static disclaimer.


ADVERSE_LABELS = {"bad", "rejected", "denied", "fraud", "high risk"}
CREDIT_KEYWORDS = ["credit", "loan", "approval", "risk"]
FRAUD_KEYWORDS = ["fraud", "chargeback", "suspicious"]


def map_compliance_requirements(
    target_column: str | None,
    prediction: str | None,
    top_features: list[dict],
) -> list[dict]:
    if not prediction:
        return []

    target_lower = (target_column or "").lower()
    is_credit_domain = any(k in target_lower for k in CREDIT_KEYWORDS)
    is_fraud_domain = any(k in target_lower for k in FRAUD_KEYWORDS)
    is_adverse = str(prediction).strip().lower() in ADVERSE_LABELS

    top_names = ", ".join(f["feature"] for f in top_features[:3]) if top_features else "the listed factors"

    requirements = []

    # GDPR Article 22
    if is_adverse:
        gdpr_text = (
            f"This is based on GDPR Article 22, which grants individuals the right to "
            f"meaningful information about automated decisions with a significant effect "
            f"on them — this decision ({prediction}) qualifies, and {top_names} are "
            f"provided as the primary drivers to satisfy that right."
        )
    else:
        gdpr_text = (
            f"This is based on GDPR Article 22, which requires transparency for automated "
            f"decisions regardless of outcome — {top_names} are recorded as the factors "
            f"behind this decision ({prediction}) to meet that requirement."
        )
    requirements.append({"regulation": "GDPR Article 22", "text": gdpr_text})

    # SAMA Governance
    requirements.append({
        "regulation": "SAMA Governance",
        "text": (
            f"This is based on SAMA's model governance and fair customer treatment "
            f"requirements, which call for institutions to be able to document and review "
            f"model-driven decisions — the exact factors behind this "
            f"{target_column or 'model'} decision and their relative weight are recorded "
            f"here to support that."
        ),
    })

    # EU AI Act
    if is_credit_domain:
        requirements.append({
            "regulation": "EU AI Act",
            "text": (
                "This is based on the EU AI Act's Annex III, which classifies "
                "creditworthiness evaluation as high-risk and requires transparency and "
                "traceability — this feature-level explanation is provided to satisfy "
                "those obligations."
            ),
        })
    elif is_fraud_domain:
        requirements.append({
            "regulation": "EU AI Act",
            "text": (
                "This is based on the EU AI Act's Annex III, which does not explicitly "
                "classify fraud detection as high-risk, but where a decision like this "
                "leads to an account restriction, equivalent transparency is provided as "
                "good practice."
            ),
        })

    return requirements