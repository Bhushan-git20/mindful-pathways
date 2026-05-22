---
name: deploy-check
description: Pre-deployment checklist
---

Run full pre-deploy check:

1. Run all tests — pytest tests/ -v
2. Check .env.example updated with any new vars
3. Check requirements.txt / package.json up to date
4. Build Docker image — docker build -t app .
5. Run Docker container locally — verify health endpoint
6. Check no console.log / print debug statements in production code
7. Check no hardcoded values that should be env vars
8. Summarize: ready / blocked (list blockers)
