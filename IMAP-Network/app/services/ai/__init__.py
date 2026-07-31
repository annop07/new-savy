"""AI layer for Savy (Week 2-3 overhaul).

Turns the old regex-based receipt reader into a real AI Financial Agent:

  - vision_extractor / text_extractor : LLM structured extraction (Instructor)
  - vectorstore / indexer            : embed spending history into Qdrant (RAG)
  - tools / agent                    : tool-calling agentic financial advisor
"""
