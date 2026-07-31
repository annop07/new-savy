# Savy — AI Financial Agent

> **Week 2–3 Bootcamp deliverable** — an overhaul of the original *Savy* receipt
> manager into a real **AI Financial Agent**: a vision LLM reads your slips, a
> vector store makes your spending history searchable in plain language, and an
> agentic advisor pulls your real numbers to tell you where the money went.

Savy started as a FastAPI + MySQL app that scraped receipts out of email over
IMAP and parsed them with **hand-written regex, one branch per vendor**. This
overhaul replaces the brittle "brain" with an AI layer while keeping the solid
CRUD / auth / IMAP foundation intact.

## Before → After

| | Old Savy | Savy AI |
| --- | --- | --- |
| **Read a receipt** | regex per vendor (Apple / K PLUS / Steam only) — a new format breaks it | **Vision LLM** reads *any* slip image → validated schema |
| **Read an email** | more regex — a Lazada receipt returns `None` and is silently dropped | **LLM extraction** (regex kept as fallback) — same email yields ฿520, items, TrueMoney, category |
| **Emails feed the AI** | rows land in the DB only | every synced receipt is **indexed into the vector store** → searchable by `/ai/ask` |
| **Analytics** | SQL `GROUP BY` | **Vector RAG** — ask *"เดือนนี้ค่ากินเกินงบไหม?"* in plain Thai |
| **Advice** | none | **Agentic advisor** — calls tools on your real data, then coaches you |
| **Thai Buddhist dates** | manual month map | model converts พ.ศ. → ค.ศ. automatically |
| **Run it** | needs a MySQL server | **SQLite by default — zero infra** |

## What it demonstrates (Week 2–3 skills)

| Skill | Where it lives |
| --- | --- |
| Multimodal Vision LLM → Pydantic schema | [`services/ai/vision_extractor.py`](app/services/ai/vision_extractor.py) · `POST /ai/extract-image` |
| Structured Output (Instructor, schema-valid JSON) | [`services/ai/schemas.py`](app/services/ai/schemas.py), [`text_extractor.py`](app/services/ai/text_extractor.py) |
| Hybrid LLM + regex-fallback email parsing | [`services/ai/email_pipeline.py`](app/services/ai/email_pipeline.py) · `POST /imap-settings/{id}/sync` |
| Vector DB — embedding & semantic search (Qdrant + fastembed) | [`services/ai/vectorstore.py`](app/services/ai/vectorstore.py) · `POST /ai/ask` |
| Tool-calling **agent** loop | [`services/ai/agent.py`](app/services/ai/agent.py), [`tools.py`](app/services/ai/tools.py) · `POST /ai/advisor` |
| Token / cost observability | `TokenUsage` in [`services/ai/client.py`](app/services/ai/client.py) (returned by every AI endpoint) |

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

The **agent loop** ([`agent.py`](app/services/ai/agent.py)) lets the LLM decide
which data tools to call — `get_today`, `get_spending_summary`,
`get_budget_status`, `search_receipts` — and when it has enough to answer. Tools
are bound to `(db, user_id)` per request, so one user can never read another's
spending.

## AI endpoints

All are under the `/api/v1` prefix and require a Bearer token (log in first).

| Method | Path | Purpose |
| --- | --- | --- |
| GET  | `/ai/health` | LLM + vector-store status |
| POST | `/ai/extract-image` | upload a slip/receipt image → structured receipt (`?save=true` persists + indexes it) |
| POST | `/ai/ask` | semantic Q&A over your spending (RAG) |
| POST | `/ai/advisor` | agentic review + budget advice |

Every response includes a `usage` block (`prompt_tokens`, `completion_tokens`,
`total_tokens`, `llm_calls`) so you can see the exact token cost of each call.

## Quick start

```bash
# 1. install deps (uv pulls Python 3.11 itself)
uv venv --python 3.11 .venv
uv pip install --python .venv -r requirements.txt

# 2. configure
cp .env.example .env
# edit .env → add OPENAI_API_KEY (+ OPENAI_BASE_URL if using a proxy)

# 3. seed a demo user + sample spending (optional, great for trying the AI)
PYTHONPATH=. .venv/bin/python -m scripts.seed_demo

# 4. run
PYTHONPATH=. .venv/bin/uvicorn app.main:app --reload
```

Open the interactive docs at **http://localhost:8000/docs**.
The database is **SQLite by default** (`./data/savy.db`) — no server needed.
To use MySQL instead, set `DATABASE_URL` in `.env`.

### Try it

```bash
# log in as the seeded demo user → grab the access_token
TOKEN=$(curl -s localhost:8000/api/v1/token \
  -d 'username=demo@savy.app&password=demo1234' | jq -r .access_token)

# 1) Read a slip image → structured JSON (and save it)
curl -s "localhost:8000/api/v1/ai/extract-image?save=true" \
  -H "Authorization: Bearer $TOKEN" -F file=@slip.jpg | jq

# 2) Ask a plain-language question about your spending (RAG)
curl -s localhost:8000/api/v1/ai/ask -H "Authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"question":"เดือนนี้ฉันใช้จ่ายกับความบันเทิงไปเท่าไหร่"}' | jq

# 3) Let the agent review your budget and advise
curl -s localhost:8000/api/v1/ai/advisor -H "Authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' -d '{}' | jq
```

**Example advisor output** (against the seeded data — entertainment budget ฿800,
actual ฿1,318):

> ⚠️ หมวดความบันเทิงเกินงบไปกว่า 65% มาจาก Steam ฿899 และ Netflix ฿419 …
> 💡 ทบทวน subscription รายเดือน / ตั้งงบให้ครบทุกหมวด / แยกยอดโอนออกจากค่าใช้จ่าย

## Email sync (IMAP)

`POST /imap-settings/{id}/sync?days_back=30&limit=50` fetches receipt emails and
runs each one through [`email_pipeline.py`](app/services/ai/email_pipeline.py):

1. **LLM first** — reads the email like a human would, so a sender the code was
   never taught still parses, and it picks the actual grand total rather than the
   first number that matches a pattern.
2. **Regex fallback** — the original per-vendor extractor still runs when the LLM
   is unavailable (no key, network error, quota) or returns low confidence, so a
   sync never hard-fails. Pass `?use_llm=false` to force regex only.
3. **Indexed** — each saved receipt is embedded into Qdrant, so email receipts are
   searchable via `/ai/ask` and visible to the advisor agent.

Real example — a Lazada receipt email (`ยอดรวมทั้งสิ้น 520 บาท`):

| | Old regex | LLM pipeline |
| --- | --- | --- |
| Result | `None` — the receipt is dropped entirely | ฿520.00 |
| Extra fields | — | items, `TrueMoney Wallet`, order id, category `ช้อปปิ้ง` |

Sync runs as a FastAPI background task, so the extra LLM latency never blocks the
request.

## Models

The endpoint is OpenAI-compatible, so the same code runs against real OpenAI or
a proxy such as **KKU IntelSphere** (`OPENAI_BASE_URL`).

- `LLM_MODEL` — the text agent / advisor (default `qwen3.7-max`)
- `VISION_MODEL` — reads slip images (default `gemini-2.5-flash`: strong Thai OCR,
  cheap, fast). Swap for `gpt-5` / `claude-sonnet-4.5` in `.env`.

> Instructor runs in **MD_JSON** mode so structured output is robust whether the
> model returns bare JSON (Qwen) or fenced ```json (Gemini).

## Vector store modes

- **Embedded (default):** `QDRANT_LOCATION=./data/qdrant` — persistent, no server.
- **Server:** `docker compose up -d`, then `QDRANT_LOCATION=http://localhost:6333`.

Embeddings run **locally** via [fastembed](https://github.com/qdrant/fastembed)
(`BAAI/bge-small-en-v1.5`) — no embeddings API bill.

## Tests

```bash
PYTHONPATH=. .venv/bin/python -m pytest    # tools, schema, indexer, vector search — no API key needed
```

## Tech stack

FastAPI · SQLAlchemy · Instructor · Pydantic v2 · Qdrant · fastembed ·
OpenAI-compatible LLMs (Gemini / Qwen / GPT / Claude via KKU IntelSphere) ·
JWT auth · uv · pytest

---

*The `savvy-front/` folder is the Next.js frontend and has its own README.*
