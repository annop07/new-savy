# Savy — AI Financial Agent

> Savy started as a receipt manager that scraped expenses out of email over IMAP
> and parsed them with hand-written regex, one branch per vendor. This rebuild
> turns it into an **AI Financial Agent**: a vision LLM reads your slips, a
> vector store makes your spending history searchable in plain language, and an
> agentic advisor pulls your real numbers to tell you where the money went.

This is a **monorepo** — a FastAPI backend and a Next.js frontend, built to run
together with zero external infrastructure (SQLite + embedded Qdrant).

```
Savy/
├── IMAP-Network/   ← Backend  — FastAPI, AI layer, database
└── savvy-front/    ← Frontend — Next.js, Tailwind v4, shadcn/ui
```

## What it does

| | |
| --- | --- |
| 📷 **Scan a slip** | Upload a photo of a bank transfer slip or receipt — a vision LLM reads vendor, amount, date (converts Thai Buddhist year automatically), payment method, and line items into a validated schema. |
| 💬 **Ask in plain language** | *"เดือนนี้ค่ากินเกินงบไหม?"* — semantic search over your receipt history (RAG) answers with real figures and cites the receipts it used. |
| ✨ **Get advice** | An agent calls tools against your actual spending and budgets, then tells you what's over budget and what to do about it. |
| 📧 **Sync email receipts** | IMAP sync now reads emails with an LLM (regex kept as a fallback) — a sender it's never seen before still parses correctly. |

## Architecture

```
                         Next.js frontend (savvy-front/)  ──HTTP──┐
                                                                  ▼
  Email (IMAP) ──▶ email_pipeline ─┐                     FastAPI  (app/main.py)
   (LLM → regex fallback)          │                              │
  Slip image   ──▶ vision_extractor ┼─▶ ExtractedReceipt ─────┐   │
                    (Instructor +   │        (Pydantic)       │   │
                     gemini-2.5)    │                         ▼   ▼
                                    │                   ┌──────────────┐
                                    └──────────────────▶│  Receipts DB │  (SQLAlchemy / SQLite·MySQL)
                                                        └──────┬───────┘
                                    index on write             │
                                          ▼                    │ SQL summaries
                                  ┌───────────────┐            ▼
                                  │  Qdrant (RAG) │◀──── AdvisorTools ────┐
                                  │  fastembed    │   query_spending      │
                                  └───────┬───────┘   budget_status       │
                                          │           search_receipts     │
                          POST /ai/ask ───┘                               │
                          POST /ai/advisor ──▶ agent loop (tool-calling) ─┘
```

Full details, API specs, and skill-by-skill breakdowns live in each part's own
README: [`IMAP-Network/README.md`](IMAP-Network/README.md) ·
[`savvy-front/README.md`](savvy-front/README.md)

## Quick start

You need both halves running — the frontend calls the backend over HTTP.

### 1. Backend

```bash
cd IMAP-Network

# install deps (uv pulls Python 3.11 itself)
uv venv --python 3.11 .venv
uv pip install --python .venv -r requirements.txt

# configure
cp .env.example .env
# edit .env → add OPENAI_API_KEY (OpenAI or an OpenAI-compatible proxy)

# seed a demo user + sample spending (optional but recommended)
PYTHONPATH=. .venv/bin/python -m scripts.seed_demo

# run
PYTHONPATH=. .venv/bin/uvicorn app.main:app --reload --port 8000
```

Backend is now on **http://localhost:8000** — API docs at `/docs`.
Database is SQLite by default (`./data/savy.db`), zero setup.

### 2. Frontend

```bash
cd savvy-front

npm install

# point at the backend (adjust the port if you changed it above)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

npm run dev
```

Open **http://localhost:3000** and log in with the seeded demo account:

```
demo@savy.app / demo1234
```

## Tech stack

**Backend:** FastAPI · SQLAlchemy · Instructor · Pydantic v2 · Qdrant · fastembed · JWT auth · pytest
**Frontend:** Next.js 14 · TypeScript · Tailwind v4 · shadcn/ui (new-york) · Radix UI

## Status

- [x] Vision LLM receipt/slip extraction
- [x] Vector RAG over spending history
- [x] Agentic financial advisor (tool-calling)
- [x] Hybrid LLM + regex email extraction, indexed into RAG
- [x] Full frontend redesign (Tailwind v4, light/dark, AI Hub page)
- [ ] Fresh demo GIF / screenshots for the redesigned UI
- [ ] Restyle the budget add/edit modals to match the new design system
