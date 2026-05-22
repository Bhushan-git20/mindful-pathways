---
trigger: always_on
description: Python code style rules
---

- PEP 8 strictly enforced
- Type hints on ALL function signatures
- Google-style docstrings on all public functions
- Max function length: 50 lines — split if longer
- Use pathlib.Path not os.path
- Use dataclasses or Pydantic for data containers — never plain dicts
