# Makeen — Hackathon Pitch Script
**Track:** الذكاء الاصطناعي التوليدي للتقنية المالية (Generative AI for Fintech)
**Target length:** ~5-6 minutes (cut the bracketed lines to trim to 3-4 min, add the bracketed "if time allows" lines to stretch to 8+ min)

Two versions below: a full word-for-word script, and a condensed talking-points version for a quick glance on stage. Assign sections to whoever's presenting each part, or have one person carry it straight through.

---

## FULL SCRIPT

### 1. Hook (20-30 sec)

"Every year, banks and fintechs reject loan applications, flag transactions as fraud, and score credit risk using AI models that nobody outside the data science team can actually explain. If you're the applicant who got denied, the answer you get is basically: the algorithm said no. That's not good enough anymore, not for the customer, and not for the regulator asking why."

### 2. Problem (45-60 sec)

"These models, gradient boosting, random forests, neural networks, are accurate, but they're black boxes. And that's a real, immediate problem for three reasons:

Regulation. GDPR Article 22 gives people the right to a real explanation of automated decisions. The EU AI Act classifies credit scoring as high-risk and demands transparency. And SAMA, our own central bank, requires model governance and fair customer treatment. 'The AI decided' is not a defensible answer to a regulator, an auditor, or a rejected applicant.

Operational risk. Loan officers and fraud analysts can't validate decisions they don't understand, so bias and errors go unnoticed until it's a headline.

Trust. Customers deserve a real reason, and institutions that can't give one lose trust and face complaints."

### 3. Solution (45-60 sec)

"That's what Makeen does. We sit on top of a bank's existing credit, fraud, or risk model, and turn every decision into a clear, plain-language, compliance-ready explanation.

We combine proven explainability techniques, SHAP and LIME, with a generative AI layer that takes those raw feature scores and turns them into an explanation a real person can actually read, tailored to who's asking: a compliance officer, a loan officer, or the customer themselves. And it's not a one-shot answer, it's a conversation. You can ask follow-up questions and get grounded, plain-language answers back."

### 4. Live Demo (2-2.5 min)

"Let me show you. [Load the German Credit sample dataset.]

Here's a real applicant. I'll ask our assistant a simple question: 'Will this applicant be approved?'

[Show: prediction + confidence + SHAP breakdown appearing in chat.]

In seconds, we get the decision, and the top factors that drove it, income, credit history, debt ratio, ranked by how much they mattered. Notice the answer isn't a wall of numbers, it's written like a person would explain it to another person.

[If asking a follow-up: ] I can ask 'why?' or 'what would change this?' and get a grounded explanation, not a generic chatbot answer, it's strictly tied to the actual numbers behind the decision.

[If model adapter is demoed: ] And this isn't locked to one model. Watch, I'll swap in a different model file here, [upload alternate model], same pipeline, same explanation quality. That's what model-agnostic actually means in practice, not just a slide.

Now the part that matters most for this track: reports. One click, [generate report], and we get a full audit-ready PDF, the decision, the SHAP breakdown, and a mapping to the exact compliance requirement it satisfies, GDPR Article 22, SAMA governance. This is the kind of document a compliance team can actually hand to a regulator.

[If time allows: ] And zooming out, here's our portfolio view, approval rates, the top factors driving decisions across the whole applicant pool, not just one case."

### 5. Differentiation (30-45 sec)

"What makes this different from just running SHAP yourself: we don't stop at a technical plot only a data scientist can read. Generative AI makes it human-readable and audience-specific, and we frame everything around actual fintech compliance, not generic data science. And because the underlying model is pluggable, this layers onto a bank's existing stack instead of replacing it."

### 6. Close (20-30 sec)

"Credit scoring, fraud detection, and risk analysis are core fintech functions, and explainability is now a top regulatory priority, in the Kingdom and globally. Makeen turns 'the AI decided' into a defensible, human-readable reason, built on proven tools, with a clear path from this prototype to real institutional use. Thank you."

---

## CONDENSED TALKING POINTS (for on-stage glance)

**Hook**
- Banks reject/flag people using black-box AI, no real explanation given

**Problem**
- Regulation: GDPR Art. 22, EU AI Act (high-risk), SAMA governance rules
- Ops risk: nobody can validate decisions they don't understand
- Trust: no explanation = complaints, lost trust

**Solution**
- SHAP/LIME (explainability) + generative AI (plain-language narrative)
- Tailored to audience: compliance officer / loan officer / customer
- Conversational, not one-shot

**Demo flow**
1. Pick sample dataset (German Credit)
2. Ask assistant: "will this applicant be approved?"
3. Show prediction + SHAP factors + plain-language answer
4. (If built) swap model file, same explanation still works
5. One-click compliance/audit PDF report ← flagship "reports" feature
6. (If time) portfolio dashboard view

**Differentiation**
- Not just a SHAP plot, human-readable + role-specific
- Grounded in real compliance framing, not generic
- Model-agnostic, plugs onto existing bank infra

**Close**
- Real regulatory problem, proven tooling, clear path to production

---

## Notes for whoever presents
- Rehearse the live demo path at least twice end to end before judging, exactly per the "demo reliability" task, don't wing it live.
- If the model-swap or portfolio dashboard aren't finished in time, just skip those bracketed lines, the script still holds without them.
- Keep a backup: if OpenAI/Supabase lags during judging, have a screen recording of a clean run ready to fall back to.
