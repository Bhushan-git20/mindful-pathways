# Mind-Mate Wellness Chatbot — Agent Rules

## Stack
Python 3.11 | LangChain 0.3+ | ChromaDB | FAISS | HuggingFace Embeddings
Gemini 2.5 Flash | Streamlit | Docker | Supabase

## File map
app.py                  — Streamlit UI entry
rag_pipeline.py         — ConversationalRetrievalChain logic
vector_store.py         — ChromaDB + FAISS indexing
document_loader.py      — PDF ingestion (PyMuPDF)
config.py               — env vars, constants only (no logic)

## Coding rules
- All LangChain chains: add error handling + fallback model
- Embedding calls: always batch — never loop single docs
- Chat history: session_state only (no DB for MVP)
- Source attribution: shown in EVERY response
- New feature = new file. Never add to existing files unless fixing a bug.

## Test requirements
- Test with minimum 3 different PDFs before committing
- Cover: single PDF, multi-PDF, PDF with tables, PDF with images
- Run: `pytest tests/ -v` before any push

## MCP to use
- Filesystem MCP: read/write project files
- Context7 MCP: get latest LangChain API docs when stuck
- GitHub MCP: commit + push after stable milestones

## What NOT to do
- Do not use deprecated LangChain v0.1 API (no `ConversationalRetrievalChain.from_llm`)
- Do not store API keys in code
- Do not use pickle for ChromaDB — use native persist()
- Do not auto-run tests — wait for my signal
