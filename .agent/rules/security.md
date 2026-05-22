---
trigger: always_on
description: Security rules — never break these
---

- NEVER hardcode secrets, keys, tokens, passwords
- All user input validated with Pydantic before processing
- SQL: use ORM always — no string concatenation in queries
- File uploads: validate extension AND mime type
- CORS: whitelist specific origins — never allow *
- Log errors but never log user data or tokens
