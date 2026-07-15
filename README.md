# Makeen — AI-Powered Data Analysis Platform

**Live App:** [https://makeen-topaz.vercel.app](https://makeen-topaz.vercel.app)
**API:** [https://makeen-production.up.railway.app](https://makeen-production.up.railway.app)

Makeen is a web-based platform that allows non-technical users to upload a dataset, train a machine learning model, and explore predictions and explanations through a conversational AI interface — no coding required.

---

## What It Does

1. **Upload** a CSV or Excel dataset
2. **Train** a machine learning model automatically (classification or regression)
3. **Ask questions** in plain English — _"Which patients are at risk of a stroke?"_
4. **Get predictions** with SHAP and LIME explanations that show _why_ the model made each decision
5. **Save and revisit** conversations across sessions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Uvicorn |
| Machine Learning | scikit-learn (Random Forest), SHAP, LIME |
| AI / LLM | OpenAI GPT (via AsyncOpenAI) |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) |
| Testing — Backend | pytest, pytest-asyncio, httpx |
| Testing — Frontend | Vitest, @testing-library/react |

---

## Project Structure

```
Makeen/
├── backend/
│   ├── app.py                  # FastAPI entry point
│   ├── requirements.txt        # Python dependencies
│   ├── pytest.ini              # Test configuration
│   ├── core/
│   │   ├── supabase_client.py  # Supabase connection
│   │   └── openai_client.py    # OpenAI async client
│   ├── routers/
│   │   ├── auth.py             # Auth, upload, chat, and data endpoints
│   │   └── data_processor.py  # ML pipeline + question processing + streaming
│   └── tests/
│       ├── conftest.py         # Shared fixtures
│       ├── unit/               # Unit tests (49 tests)
│       └── integration/        # Integration tests (36 tests)
│
└── frontend/
    ├── vite.config.ts          # Vite + Vitest config
    ├── package.json
    └── src/
        ├── app/
        │   ├── pages/          # Chat page landing etc
        │   └── components/     # UI components
        ├── lib/
        │   ├── supabase.ts     # Supabase client
        │   └── chatApi.ts      # Backend API wrappers
        └── __tests__/          # Frontend tests (63 tests)
```

---

## Getting Started

The app is live and requires no installation to use — visit [https://makeen-topaz.vercel.app](https://makeen-topaz.vercel.app).

For local development, see **[SETUP_GUIDE.txt](SETUP_GUIDE.txt)** for the full step-by-step instructions.

**Quick summary (local dev only):**

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app:app --reload     # runs on http://localhost:8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                  # runs on http://localhost:5173
```

Both `backend/.env` and `frontend/.env` must be created with the correct keys before running locally. See SETUP_GUIDE.txt for the required variables.

---

## Running the Tests

The project includes **148 automated tests** covering the backend pipeline and frontend components. All tests run fully offline — no API keys or internet connection required.

```bash
# Backend — 85 tests
cd backend
python -m pytest -v

# Frontend — 63 tests
cd frontend
npm test
```

| Suite | Files | Tests |
|-------|-------|-------|
| Backend Unit | 4 | 49 |
| Backend Integration | 2 | 36 |
| Frontend Unit | 2 | 26 |
| Frontend Component | 3 | 37 |
| **Total** | **11** | **148** |

---

## Environment Variables

**backend/.env**
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
OPENAI_API_KEY=
FRONTEND_URL=https://makeen-topaz.vercel.app
```

**frontend/.env**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=https://makeen-production.up.railway.app
```

---

## Team

| Name | Role |
|------|------|
| Lama Asiri | Full-Stack & Project Lead |
| Reem Alhijris | Backend Developer |
| Rahaf Almalki | AI/ML Engineer |
| Shahad Alsomali | UI/UX Designer |

---

## License

This project was developed as a graduation project. All rights reserved.