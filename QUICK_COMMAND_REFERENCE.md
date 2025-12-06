# KVC WebApp - Quick Command Reference
**Quick access to all essential commands for development and deployment**

---

## 🚀 Quick Start

### Start Everything
```powershell
# Using helper command
kvc-start

# Or manually
cd c:\Users\PC\Downloads\kvc-fullstack
docker-compose -f docker-compose.local.yml up -d
```

### Stop Everything
```powershell
# Using helper command
kvc-stop

# Or manually
docker-compose -f docker-compose.local.yml down
```

### Test Services
```powershell
kvc-test
```

---

## 🔧 Development Commands

### Frontend Development
```bash
# In frontend directory
cd frontend
npm install           # Install dependencies
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Backend Development
```bash
# In backend directory
cd backend
npm install           # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
```

### Database Commands
```bash
# In backend directory
npx prisma migrate dev --name <migration_name>   # Create new migration
npx prisma studio                                 # Open Prisma Studio (GUI)
npx prisma db push                               # Apply migrations
npx prisma generate                              # Generate Prisma client
```

---

## 🐳 Docker Commands

### Container Management
```powershell
# View all running containers
docker-compose -f docker-compose.local.yml ps

# View container logs
docker logs kvc-frontend-local
docker logs kvc-backend-local
docker logs kvc-postgres-local

# Rebuild containers
docker-compose -f docker-compose.local.yml build

# Restart specific service
docker-compose -f docker-compose.local.yml restart frontend

# Execute command in container
docker exec kvc-backend-local npm run build
docker exec kvc-postgres-local psql -U postgres -d kvc_db
```

### Container Cleanup
```powershell
# Stop all containers
docker-compose -f docker-compose.local.yml stop

# Remove stopped containers
docker-compose -f docker-compose.local.yml rm

# Complete cleanup (including volumes)
docker-compose -f docker-compose.local.yml down -v

# Remove all dangling images
docker image prune -f
```

---

## 🧪 Testing & Debugging

### Test API Endpoints
```powershell
# Frontend health check
curl http://localhost:3000 -o nul -w "Status: %{http_code}"

# Backend health check
curl http://localhost:4001 -o nul -w "Status: %{http_code}"

# Through Nginx proxy
curl http://localhost/ -o nul -w "Status: %{http_code}"
```

### View Service Logs
```powershell
# Frontend logs
docker logs -f kvc-frontend-local

# Backend logs
docker logs -f kvc-backend-local

# Nginx logs
docker logs -f kvc-nginx-local

# PostgreSQL logs
docker logs -f kvc-postgres-local

# Redis logs
docker logs -f kvc-redis
```

### Database Access
```powershell
# Connect to PostgreSQL
docker exec -it kvc-postgres-local psql -U postgres -d kvc_db

# Common queries
SELECT * FROM "User";
SELECT * FROM "Class";
SELECT * FROM "Attendance";
```

### Redis Access
```powershell
# Connect to Redis
docker exec -it kvc-redis redis-cli -a redis2025!

# Common commands
KEYS *              # List all keys
GET <key>           # Get value
SET <key> <value>   # Set value
FLUSHALL            # Clear all data
```

---

## 🌐 Access Points

| Service | URL | Port | Purpose |
|---------|-----|------|---------|
| Frontend | http://localhost:3000 | 3000 | React dev server |
| Frontend (Nginx) | http://localhost/ | 80 | Production proxy |
| Backend API | http://localhost:4001 | 4001 | REST API |
| Prisma Studio | http://localhost:5555 | 5555 | Database GUI |
| PostgreSQL | localhost:5432 | 5432 | Database |
| Redis | localhost:6379 | 6379 | Cache |

---

## 📦 Build & Deployment

### Build Frontend for Production
```powershell
cd frontend
npm run build
# Output: dist/ folder (12.22 MB)
```

### Build Backend for Production
```powershell
cd backend
npm run build
```

### Docker Build
```powershell
# Build all images
docker-compose -f docker-compose.yml build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Deploy to Production
```powershell
# Using docker-compose.yml (production)
docker-compose -f docker-compose.yml up -d

# Or with custom environment
docker-compose -f docker-compose.yml up -d --env-file .env.production
```

---

## 🔍 Troubleshooting

### Frontend Error: Cannot read properties of undefined
```powershell
# Check TypeScript compilation
cd frontend
npx tsc --noEmit

# Rebuild frontend
npm run build

# Restart container
docker-compose restart frontend
```

### Backend Not Responding
```powershell
# Check backend logs
docker logs kvc-backend-local

# Verify environment variables
docker exec kvc-backend-local env | grep DATABASE_URL

# Restart backend
docker-compose restart backend
```

### Database Connection Issues
```powershell
# Check PostgreSQL status
docker exec kvc-postgres-local pg_isready

# View PostgreSQL logs
docker logs kvc-postgres-local

# Restart PostgreSQL
docker-compose restart postgres
```

### Nginx Not Proxying Correctly
```powershell
# Check Nginx configuration
docker exec kvc-nginx-local nginx -t

# View Nginx logs
docker logs -f kvc-nginx-local

# Restart Nginx
docker-compose restart nginx
```

### Clear Cache and Rebuild
```powershell
# Complete system cleanup and restart
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up -d

# Or individual service
docker-compose -f docker-compose.local.yml down kvc-frontend-local
docker-compose -f docker-compose.local.yml up -d kvc-frontend-local
```

---

## 📝 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kvc_db
REDIS_URL=redis://:redis2025!@redis:6379
OPENAI_API_KEY=your_key_here
JWT_SECRET=your_secret_here
NODE_ENV=development
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:4001
VITE_SOCKET_URL=http://localhost:80
```

---

## 🎯 Common Workflows

### Full Development Cycle
```powershell
# 1. Start services
kvc-start

# 2. Make frontend changes
# Edit frontend/src/...

# 3. Rebuild frontend
cd frontend
npm run build

# 4. Restart frontend container
docker-compose restart frontend

# 5. Test in browser
Start-Process http://localhost

# 6. When done
kvc-stop
```

### Add New Database Migration
```powershell
cd backend

# Create migration
npx prisma migrate dev --name add_new_feature

# Or manually
npx prisma db push

# View schema
npx prisma studio
```

### Deploy to Production
```powershell
# 1. Build frontend
cd frontend
npm run build

# 2. Build backend
cd ../backend
npm run build

# 3. Build Docker images
docker-compose build

# 4. Deploy
docker-compose -f docker-compose.yml up -d

# 5. Verify
curl http://production-url/
```

---

## 🔗 Helper Commands (Windows PowerShell)

These commands are loaded automatically if you source `kvc-simple.ps1`:

```powershell
# Start all services
kvc-start

# Stop all services
kvc-stop

# Test all services
kvc-test

# View service status
kvc-status

# View logs
kvc-logs

# Clean up everything
kvc-clean

# Run TypeScript check
kvc-check

# Rebuild frontend
kvc-build
```

---

## 📊 Performance Monitoring

### Check Memory Usage
```powershell
docker stats kvc-backend-local kvc-frontend-local
```

### Check Disk Usage
```powershell
docker system df
```

### Monitor Network
```powershell
docker exec kvc-nginx-local cat /var/log/nginx/access.log | tail -20
```

---

## 🚨 Emergency Recovery

### Complete Reset
```powershell
# WARNING: This will delete all data!
docker-compose -f docker-compose.local.yml down -v
docker system prune -af
docker volume prune -f

# Rebuild from scratch
docker-compose -f docker-compose.local.yml up -d
```

### Restart Everything
```powershell
docker-compose -f docker-compose.local.yml restart
```

### View Detailed Status
```powershell
docker-compose -f docker-compose.local.yml ps --no-trunc
docker system events --since 10m
```

---

## 📚 Documentation

- **Full Status Report**: `SYSTEM_STATUS_FINAL.md`
- **Nginx Configuration**: `NGINX_CONFIGURATION_GUIDE.md`
- **Project Structure**: `PROJECT_STRUCTURE.md`
- **API Documentation**: `docs/openapi.yaml`
- **Frontend Guide**: `frontend/src/README.md`
- **Backend Guide**: `backend/README.md`

---

## ✨ Key Facts

- **Frontend**: React 18.3.1, Vite 5.4.2, 3186 modules, 12.22 MB
- **Backend**: Node.js/Express, 9 Prisma migrations
- **Database**: PostgreSQL 16-Alpine
- **Cache**: Redis 7-Alpine
- **Proxy**: Nginx Alpine with production configuration
- **Status**: ✅ All services running and healthy

---

*Last Updated: December 6, 2025*
*Quick reference for KVC WebApp development and deployment*
