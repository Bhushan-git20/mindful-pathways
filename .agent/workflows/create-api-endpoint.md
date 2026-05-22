---
name: create-api-endpoint
description: Scaffold a new FastAPI endpoint with full structure
---

Create a new FastAPI endpoint following our patterns:

1. Add Pydantic request/response models in schemas/
2. Add route handler in routers/<domain>.py
3. Add business logic in services/<domain>.py
4. Add DB query in repositories/<domain>.py
5. Add error handling with proper HTTP status codes
6. Register router in main.py if new domain
7. Add pytest test covering happy path + 400/404/500 cases

Follow existing patterns in the codebase — check existing files first.
