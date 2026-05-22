# Code Conventions — Mind-Mate Wellness Chatbot

## Python patterns we use
- FastAPI dependency injection: Depends() for DB sessions
- Pydantic v2: model_config = ConfigDict(from_attributes=True)
- Async DB: async with AsyncSession() as session
- Response pattern: return {"status": "success", "data": result}

## TypeScript patterns we use
- React components: functional only, hooks for state
- API calls: axios with interceptors in api/client.ts
- Types: always in types/ folder, exported from types/index.ts
- Error handling: try/catch in every async component

## UI & Design Aesthetics (Premium & Sleek)
- Style System: Vanilla CSS with clean glassmorphism overlays
- Color Palette: Curated deep purple & sage green tailored gradients (`hsl` base)
- Animations: Micro-interactions and smooth transitions using Framer Motion
- UI Library: Tailwind CSS (standard configuration) combined with Radix UI headless components
- Iconography: Lucide-react/lucide for precise, modern stroke-style symbols

## Naming conventions
- Python files: snake_case
- TS/React files: PascalCase for components, camelCase for utils
- API routes: /api/v1/<resource> (plural nouns)
- DB tables: plural nouns (users, documents, sessions)
- Env vars: UPPER_SNAKE_CASE

## What we never do
- Mix sync and async DB calls
- Use class components in React
- Skip error boundaries on main page components
- Use any in TypeScript
