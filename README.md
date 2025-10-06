
# Kalasin Vocational College WebApp (KVC)

Stack:
- Frontend: React + Vite + Tailwind CSS (blue/white theme), React Router
- Backend: Node.js + Express (REST API), express-validator, helmet, rate limiting
- Auth: Login-only (accounts created by admins). JWT wiring prepared (no DB yet).
- Chat: "watch-app"-style layout; supports groups + auto-rooms by Year & Major (to be backed by DB later).
- Leave System: Sick 30 days (doctor certificate if >2 days), Personal 7 days, Ordination 60 days, Others.

> **Note**: This scaffold intentionally has **no mock data** and **no database** yet.
> All endpoints return 501 Not Implemented with strict request/response contracts documented in JSDoc and in `docs/openapi.yaml`.

## Getting Started

### Backend
```bash
cd backend
cp .env.example .env   # adjust JWT secret, CORS origin, etc.
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Structure

```
kvc-fullstack/
  backend/
    src/
      app.js
      server.js
      routes/...
      controllers/...
      middleware/...
      validators/...
      utils/...
    .env.example
    package.json
  frontend/
    index.html
    src/
      main.jsx
      App.jsx
      routes.jsx
      components/...
      pages/...
      styles/...
    tailwind.config.js
    postcss.config.js
    package.json
  docs/
    openapi.yaml
  README.md
```

## Color & UX
- Primary: `#0A4DAD` (blue), Secondary: `#F5F9FF` (near-white). Clean, airy, responsive.
- Accessible contrast. Keyboard-navigable menus. ARIA labels where appropriate.

