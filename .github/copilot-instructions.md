# Copilot Instructions for KVC WebApp

## Project Overview
- **Monorepo**: Contains `backend` (Node.js/Express) and `frontend` (React/Vite/Tailwind) apps. See root `README.md` for stack and structure.
- **Backend**: REST API with strict contracts (see `docs/openapi.yaml`). Uses Express, Prisma, and OpenAI integration for assistant features. JWT auth is scaffolded but not fully implemented.
- **Frontend**: React app with modular pages/components. Uses React Router and Tailwind for styling. Assistant widget integrates with backend via REST.

## Key Workflows
- **Backend dev**: `cd backend; npm install; npm run dev` (uses `.env` for config)
- **Frontend dev**: `cd frontend; npm install; npm run dev`
- **Assistant integration**: Backend: see `assistant.module.js` and `assistant.controller.js`. Frontend: see `AssistantWidget.jsx` and `services/assistant.js`.
- **API contracts**: All endpoints documented in `docs/openapi.yaml` and JSDoc. Most return 501 unless implemented.
- **Prisma**: DB schema in `backend/prisma/schema.prisma`. Migrations in `backend/prisma/migrations/`.

## Patterns & Conventions
- **Controllers/Routes**: Each resource has a controller (`src/controllers/`) and route (`src/routes/`). Route files wire up controller methods.
- **Middleware**: Auth, validation, and error handling in `src/middleware/`.
- **Services**: Business logic and integrations in `src/services/`.
- **Frontend**: Pages in `src/pages/`, components in `src/components/`, context in `src/context/`, hooks in `src/hooks/`.
- **Styling**: Tailwind config in `frontend/tailwind.config.js`. Use blue/white theme (`#0A4DAD`, `#F5F9FF`).

## Integration Points
- **OpenAI**: Backend assistant uses OpenAI API (see `.env` and `assistant.module.js`).
- **Socket.io**: Real-time chat via `src/socket.js` and `services/chatSocket.js`.
- **Prisma**: DB access via `src/db.js` and `prisma/`.

## Examples
- Add a new API: Create controller in `src/controllers/`, add route in `src/routes/`, document in `openapi.yaml`.
- Add a frontend page: Create in `src/pages/`, add route in `routes.jsx`.

## References
- See `backend/README.md` and `frontend/src/README.md` for assistant-specific usage.
- API contracts: `docs/openapi.yaml`
- Main entrypoints: `backend/src/server.js`, `frontend/src/main.jsx`

---
For questions, check the relevant `README.md` or ask a maintainer.
