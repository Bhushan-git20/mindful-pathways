---
trigger: when_writing_tests
description: Testing standards
---

- pytest for Python, Jest for JS/TS
- File naming: test_<module>.py or <module>.test.ts
- Cover: happy path + edge cases + error cases
- Use fixtures for external deps (DB, API calls)
- Mock external APIs — never call real APIs in tests
- Assert return values AND side effects
