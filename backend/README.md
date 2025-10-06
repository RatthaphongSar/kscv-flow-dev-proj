# KVC Assistant (Backend Module)

## Install

```
npm i openai compression express-validator
```

## Usage

```js
import { mountAssistant } from './assistant.module.js'
import { prisma } from './db.js'

// in your server bootstrap (after createApp / before listen):
mountAssistant({ app, basePath: '/api/assistant', prisma, io }) // io is optional
```

### Env
```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Optional RAG
VECTOR_PROVIDER=pgvector|weaviate|pinecone
```

### Endpoints
- POST /api/assistant/chat  { message, roomId?, userId? }
- GET  /api/assistant/status
