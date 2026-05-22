# Mind-Mate Local Overrides

## Local Project Priority Settings
- DB Schema Check: Always fetch schema from Supabase or check Migrations folder before designing database objects.
- Environment Loading: Prioritize `.env` file reading using standard python-dotenv.
- Local Server Port: Development server runs on port 8501 (Streamlit standard).

## Extended Developer Conventions
- Follow standard PEP 8 coding style for any helper scripts.
- Use explicit logging over prints for RAG execution tracking.
