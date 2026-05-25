
# MindCare — Agent Rules

## Stack
React | TypeScript | FastAPI | PostgreSQL | Supabase | Gemini API | Docker | AWS

## Architecture
Frontend (React/TS) -> FastAPI backend -> PostgreSQL (Supabase) -> Gemini API

## Rules
- All API endpoints: Pydantic v2 models for request/response validation
- Auth: JWT tokens via python-jose, refresh token pattern
- DB queries: SQLAlchemy 2.0 async (no raw SQL except migrations)
- Frontend: Tailwind CSS only — no inline styles except dynamic values
- API errors: always return {detail: string, code: string} shape

## Supabase MCP
Use Supabase MCP to check schema before writing any query.
Never guess column names.
