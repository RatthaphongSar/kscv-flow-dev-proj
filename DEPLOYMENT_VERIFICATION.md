# 🚀 KVC App - Deployment Verification & Guide

**ตรวจสอบสถานะและวิธีการ Deploy**

---

## 📋 Current Status Summary

### ✅ Build Status
```
✓ Docker Images Built Successfully
  - kvc-fullstack-backend:latest    (619MB) - Built ~1 min ago
  - kvc-fullstack-frontend:latest   (441MB) - Built ~29 sec ago
```

### ✓ Running Services
```
Container Status:
  ✓ kvc-postgres      (HEALTHY)      - Port 5432
  ✓ kvc-redis         (HEALTHY)      - Port 6379
  ✓ kvc-backend       (UP)           - Port 4001
  ✓ kvc-frontend      (UP)           - Port 3000
  ⚠ kvc-nginx         (RESTARTING)   - Certificate issue (not critical for deployment)
```

---

## 🔍 Step 1: Verify Local Setup

### Check Docker Installation
```powershell
docker --version
docker-compose --version
# Expected: Both should show versions (e.g., Docker 25.0.0, Docker Compose 2.20.0)
```

### Verify Services Are Running
```powershell
# Test Backend API
curl http://localhost:4001/api -v

# Test Frontend
curl http://localhost:3000 -v

# Expected response: 200 OK
```

### Test Local LAN Access
```powershell
# From another computer on your network, test:
curl http://192.168.1.101:3000 -v
curl http://192.168.1.101:4001/api -v
# Expected: Both should respond with 200 OK
```

---

## 🐳 Step 2: Prepare Docker Hub Account

### Prerequisites (One-time setup)
1. **Create Docker Hub Account** at https://hub.docker.com
   - Sign up with email address
   - Create username (e.g., `rattapong101`)
   - Create password (save securely)

2. **Login to Docker Hub locally**
```powershell
docker login
# Enter your Docker Hub username and password
```

---

## 📤 Step 3: Build & Push Images to Docker Hub

### Option A: Using Deploy Script (Recommended)
```powershell
cd C:\Users\PC\Downloads\kvc-fullstack
.\deploy.ps1

# When prompted:
# 1. Enter Docker Hub username: [your-username]
# 2. Enter Docker Hub password: [your-password]

# Script will automatically:
# - Login to Docker Hub
# - Build both images
# - Tag them as: username/kvc-backend:latest and username/kvc-frontend:latest
# - Push to Docker Hub

# Expected time: 5-10 minutes
```

### Option B: Manual Push (Advanced)
```powershell
# 1. Login to Docker Hub
docker login

# 2. Build images
docker-compose build

# 3. Tag images
docker tag kvc-fullstack-backend:latest {USERNAME}/kvc-backend:latest
docker tag kvc-fullstack-frontend:latest {USERNAME}/kvc-frontend:latest

# 4. Push images
docker push {USERNAME}/kvc-backend:latest
docker push {USERNAME}/kvc-frontend:latest

# Replace {USERNAME} with your Docker Hub username
```

### Verify Upload Success
```powershell
# Visit https://hub.docker.com and login
# You should see two new repositories:
# - {username}/kvc-backend
# - {username}/kvc-frontend
```

---

## 🚀 Step 4: Deploy to Railway

### Create Railway Account (if new)
1. Visit https://railway.app
2. Sign in with GitHub or create account
3. Create new project

### Deploy Services

#### Option A: From Docker Hub Images (Recommended)
1. In Railway Dashboard:
   - Click "New" → "Deploy from Docker Hub"
   - For **Backend Service**:
     ```
     Image: {username}/kvc-backend:latest
     Port: 4001
     ```
   - For **Frontend Service**:
     ```
     Image: {username}/kvc-frontend:latest
     Port: 3000
     ```

2. Set Environment Variables:
   ```
   Backend:
   - NODE_ENV: production
   - PORT: 4001
   - DATABASE_URL: [Railway-generated PostgreSQL URL]
   - CORS_ORIGIN: https://{your-railway-frontend-url}
   - JWT_ACCESS_SECRET: [generate strong random string]
   - JWT_REFRESH_SECRET: [generate strong random string]
   ```

3. Add PostgreSQL Database:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically inject DATABASE_URL

#### Option B: From Docker Compose (Advanced)
1. Deploy docker-compose.yml directly
2. Wait for Railpack detection

---

## 🔧 Environment Variables for Production

| Variable | Backend | Frontend | Example |
|----------|---------|----------|---------|
| `NODE_ENV` | ✓ | - | `production` |
| `PORT` | ✓ | - | `4001` |
| `DATABASE_URL` | ✓ | - | `postgresql://user:pass@host:5432/db` |
| `CORS_ORIGIN` | ✓ | - | `https://kvc-frontend-xxx.railway.app` |
| `VITE_BACKEND_URL` | - | ✓ | `https://kvc-backend-xxx.railway.app` |
| `VITE_API_BASE` | - | ✓ | `https://kvc-backend-xxx.railway.app/api` |
| `JWT_ACCESS_SECRET` | ✓ | - | [Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` ] |
| `JWT_REFRESH_SECRET` | ✓ | - | [Generate strong random string] |

---

## ✅ Step 5: Verify Deployment

### Test Frontend Access
```
1. Copy the Railway frontend URL (e.g., https://kvc-frontend-xxx.railway.app)
2. Open in browser
3. Check console (F12) for errors
4. Verify frontend loads without blank page
```

### Test Backend Access
```
1. Copy the Railway backend URL (e.g., https://kvc-backend-xxx.railway.app)
2. Test API endpoint: https://kvc-backend-xxx.railway.app/api
3. Expected: Should return API response or error (not 404)
```

### Test Features
- [ ] Login page loads
- [ ] API requests work (check DevTools Network tab)
- [ ] WebSocket connects (check Console)
- [ ] Chat functionality works
- [ ] Database queries succeed (no 500 errors)

---

## 🐛 Troubleshooting

### "Docker login failed"
```
Solution:
1. Verify username/password at https://hub.docker.com
2. Ensure Docker Desktop is running
3. Try: docker logout && docker login
```

### "Build failed during docker-compose build"
```
Solution:
1. Check Docker has enough disk space (need ~2GB)
2. Verify Node.js dependencies: 
   - cd backend && npm ci
   - cd frontend && npm ci
3. Try: docker system prune -a (removes unused images)
```

### "Images not found in Docker Hub after push"
```
Solution:
1. Verify: docker push command output shows "pushed"
2. Check Docker Hub dashboard after 5 minutes (sync delay)
3. Try: docker pull {username}/kvc-backend:latest
```

### "Railway build failed"
```
Solution:
1. Ensure images are in Docker Hub (visible in dashboard)
2. Set EXPOSE port correctly (3000 for frontend, 4001 for backend)
3. Check environment variables are set before deploy
4. View Railway logs: Dashboard → Project → Deployment logs
```

### "Frontend shows blank page after deploy"
```
Solution:
1. Check VITE_BACKEND_URL in frontend env vars
2. Verify backend service is running (check health)
3. Check CORS_ORIGIN in backend matches frontend URL
4. View browser console (F12) for errors
```

### "Database connection error"
```
Solution:
1. Ensure PostgreSQL service is running in Railway
2. Copy DATABASE_URL from PostgreSQL service to Backend env
3. Run migrations: In Railway shell → npm run prisma:migrate
4. Check credentials: user/password in DATABASE_URL match
```

---

## 📊 Quick Command Reference

```powershell
# Local development
docker-compose up                    # Start all services
docker-compose down                  # Stop all services
docker-compose logs -f               # View logs
docker-compose build                 # Rebuild images

# Docker Hub operations
docker login                         # Login to Docker Hub
docker images                        # List all images
docker push {username}/kvc-*:latest  # Push to Docker Hub

# Verification
curl http://localhost:3000           # Test frontend
curl http://localhost:4001/api       # Test backend
docker ps                            # Show running containers
docker exec -it kvc-backend sh       # Shell into backend container
```

---

## 🎯 Deployment Timeline

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Verify local setup | 5 min | ✓ Complete |
| 2 | Create Docker Hub account | 5 min | ⏳ Pending |
| 3 | Build & push images | 10 min | ⏳ Pending |
| 4 | Create Railway account | 3 min | ⏳ Pending |
| 5 | Deploy to Railway | 15 min | ⏳ Pending |
| 6 | Configure env variables | 5 min | ⏳ Pending |
| 7 | Verify deployment | 10 min | ⏳ Pending |
| **Total** | **All steps** | **~50 min** | **In Progress** |

---

## 📞 Next Steps

1. **Immediately:**
   - [ ] Create Docker Hub account
   - [ ] Run `.\deploy.ps1`
   - [ ] Wait for upload to complete

2. **After images are in Docker Hub:**
   - [ ] Create Railway account
   - [ ] Deploy services from Docker Hub images
   - [ ] Set environment variables

3. **After Railway deployment:**
   - [ ] Test frontend and backend URLs
   - [ ] Verify database connection
   - [ ] Test features (login, chat, etc.)

---

**Generated:** December 6, 2025
**Status:** Ready for deployment
**Version:** 1.0
