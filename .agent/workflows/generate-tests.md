---
name: generate-tests
description: Generate comprehensive tests for a module
---

Generate tests for the specified file/function.

Requirements:
- pytest for Python, Jest for TypeScript
- Prefix test files with test_
- Cover: happy path, edge cases, error/exception cases
- Use fixtures for DB and external API calls
- Mock all external services
- Assert both return values and side effects
- Add docstring to each test explaining what it verifies
