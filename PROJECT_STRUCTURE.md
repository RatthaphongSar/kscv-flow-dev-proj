# KVC Fullstack Project Structure

## 📁 Directory Layout

```
kvc-fullstack/
├── backend/                      # Node.js/Express API Server
│   ├── src/
│   │   ├── server.js            # Main entry point
│   │   ├── controllers/         # Route controllers
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Auth, validation, error handling
│   │   ├── services/            # Business logic
│   │   ├── models/              # Data models (Prisma)
│   │   ├── db.js                # Database connection
│   │   └── socket.js            # WebSocket setup
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # DB migrations
│   ├── package.json
│   ├── Dockerfile
│   └── .env                     # (Local development only)
│
├── frontend/                     # React/Vite SPA
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Root component
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   │   ├── ui/              # Radix UI component wrappers
│   │   │   ├── AssistantWidget.jsx
│   │   │   └── ChatWidget.jsx
│   │   ├── context/             # React Context (Auth, Chat)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API & WebSocket clients
│   │   ├── routes.jsx           # React Router config
│   │   └── styles/              # Tailwind CSS
│   ├── dist/                    # Production build (ignored in git)
│   ├── public/                  # Static assets
│   ├── server.js                # Express server for dist/
│   ├── package.json
│   ├── Dockerfile
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env                     # Vite env vars
│
├── docs/                         # API documentation
│   ├── openapi.yaml             # REST API spec
│   └── [other docs]
│
├── docker-compose.yml           # Local development
├── railway.json                 # Railway deployment config
├── .railwayignore               # Files to ignore on Railway
├── nginx.conf                   # Nginx reverse proxy (optional)
├── DOCUMENTATION_INDEX.md       # Project docs index
├── README.md                    # Project overview
└── .gitignore

```

---

## 🚀 Quick Commands

### **Local Development**
```bash
# Start all services
docker-compose up

# Or run locally
cd backend && npm run dev     # Terminal 1
cd frontend && npm run dev    # Terminal 2
```

### **Build for Production**
```bash
# Frontend
cd frontend && npm run build  # Creates dist/

# Backend
# Already production-ready
```

### **Deploy to Railway**
```bash
# Push code to GitHub
git push origin meeting-schedule-system

# Railway auto-deploys on push
```

---

## 📊 Service Dependencies

```
Railway (Docker Compose)
├── PostgreSQL 16 (Database)
├── Redis 7 (Cache/Session)
├── Backend API (Node.js:4001)
│   ├── Uses: PostgreSQL, Redis, OpenAI
│   └── Exposes: REST API, WebSocket
└── Frontend (Node.js:3000)
    ├── Serves: React SPA (dist/)
    ├── Proxy: /api → Backend
    └── Proxy: /socket.io → Backend WebSocket
```

---

## 🌍 Environment Variables

### **Backend (.env)**
```
NODE_ENV=production
PORT=4001
DATABASE_URL=postgresql://user:pass@host/dbname
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=***
JWT_REFRESH_SECRET=***
COOKIE_SECRET=***
CORS_ORIGIN=*
OPENAI_API_KEY=sk-***
```

### **Frontend (.env)**
```
VITE_API_BASE=http://backend:4001/api
VITE_BACKEND_URL=http://backend:4001
```

---

## 📦 Key Dependencies

**Backend:**
- Express 4.21 - Web framework
- Prisma 6.16 - ORM
- PostgreSQL 16 - Database
- Redis 7 - Caching
- Socket.io - WebSocket
- OpenAI - AI integration

**Frontend:**
- React 18.3 - UI library
- Vite 5.4 - Build tool
- React Router 6.26 - Routing
- Tailwind CSS - Styling
- Radix UI - Component library
- Socket.io-client - WebSocket

---

## 🔗 API Endpoints

See `docs/openapi.yaml` for complete API specification

### **Key Endpoints:**
- `POST /api/auth/login` - User login
- `GET /api/users` - Get users
- `POST /api/classes` - Create class
- `WS /socket.io` - WebSocket connection

---

## 🐛 Troubleshooting

### **Database Issues**
```bash
# Check migrations
cd backend && npm run migrate

# Reset database
docker-compose down -v
docker-compose up
```

### **Frontend Build Issues**
```bash
# Clear cache
rm -rf frontend/dist frontend/node_modules/.vite

# Rebuild
cd frontend && npm run build
```

---

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes & commit
git add .
git commit -m "feat: description"

# Push to GitHub
git push origin feature/your-feature

# Create Pull Request
# → Merge to meeting-schedule-system
# → Railway auto-deploys!
```

---

## ✅ Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Docker images build successfully
- [ ] Environment variables configured on Railway
- [ ] Database migrations run
- [ ] Frontend build passes
- [ ] Backend API health check passes
- [ ] WebSocket connection works
- [ ] Frontend can reach backend API

---

**Last Updated:** December 6, 2025
