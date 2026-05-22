---
name: rag-debug
description: Debug LangChain RAG pipeline issues
---

Debug the RAG pipeline systematically:

1. Check PDF loading — print chunk count and first 3 chunks
2. Check embeddings — verify shape and non-zero values
3. Check retrieval — run test query, print top 3 retrieved chunks with scores
4. Check prompt template — print full prompt sent to LLM
5. Check response — verify source attribution included
6. Check ChromaDB persistence — verify collection exists after restart

Report findings for each step. Fix the first failing step found.
