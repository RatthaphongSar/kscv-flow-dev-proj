# 🚀 KVC App - Self-Hosted Deployment Guide

## Architecture

Your deployment will have:

```
┌─────────────────────────────────────────────┐
│ Your Windows Machine                        │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ Docker Desktop (running containers) │    │
│ │                                     │    │
│ │ ┌──────────┬──────────┬──────────┐  │    │
│ │ │ Nginx    │ Frontend │ Backend  │  │    │
│ │ │ (port80) │(port3000)│(port4001)│  │    │
│ │ └──────────┴──────────┴──────────┘  │    │
│ │                                     │    │
│ │ ┌──────────┬──────────────────┐    │    │
│ │ │PostgreSQL│ Redis Cache      │    │    │
│ │ │(port5432)│ (port6379)       │    │    │
│ │ └──────────┴──────────────────┘    │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Browser: http://localhost                  │
│ Other devices on LAN: http://YOUR_PC_IP    │
└─────────────────────────────────────────────┘
```

## Prerequisites

- **Windows 10/11** with Administrator access
- **Docker Desktop** installed and running
- **Node.js LTS** (v18+)
- **Git**

### Check Prerequisites

```powershell
# Check Docker
docker --version
docker compose version

# Check Node
node --version
npm --version
```

---

## Step-by-Step Deployment from Zero

### Step 1: Clean Up & Prepare

Move old deployment files (optional but recommended):

```powershell
cd C:\Users\PC\Downloads\kvc-fullstack

# Create archive folder
mkdir _old-deploy-scripts

# Move old files
Move-Item cleanup-old-deploy.ps1 _old-deploy-scripts/ -Force
Move-Item deploy*.* _old-deploy-scripts/ -Force
Move-Item generate-cert.js _old-deploy-scripts/ -Force
```

### Step 2: Configure Environment Variables

Copy `.env.production` and fill in your secrets:

```powershell
# View the template
cat .env.production
```

**Edit `.env.production` and change these values:**

```
POSTGRES_PASSWORD=MySecurePassword123!
REDIS_PASSWORD=MyRedisPassword456!
JWT_SECRET=GenerateRandomString$(date +%s)abc123def456ghi789
JWT_REFRESH_SECRET=AnotherRandomString$(date +%s)xyz789abc456def123
FRONTEND_URL=http://localhost  # Change if accessing from specific IP
```

**How to generate random passwords:**

```powershell
# Generate random string
-join ((33..126) | Get-Random -Count 32 | % {[char]$_})
```

### Step 3: Build Frontend

The frontend must be built BEFORE running Docker Compose:

**Option A: Using PowerShell script**

```powershell
# Make script executable
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser -Force

# Run build
.\infra\scripts\build.ps1
```

**Option B: Manual build**

```powershell
cd frontend
npm install
npm run build
cd ..
```

**Verify build succeeded:**

```powershell
# Check dist folder exists and has files
dir frontend\dist

# You should see: index.html, assets folder, etc.
```

### Step 4: Update docker-compose.self-hosted.yml Reference in nginx.conf

Nginx reads from mounted volume. Make sure docker-compose is pointing to correct nginx config:

Already configured in `docker-compose.self-hosted.yml`:

```yaml
nginx:
  volumes:
    - ./infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./frontend/dist:/usr/share/nginx/html:ro
```

✅ **This is already correct**

### Step 5: Start the Application

```powershell
# Make sure Docker Desktop is running!

# Start all services
docker compose -f docker-compose.self-hosted.yml --env-file .env.production up -d

# Or use the helper script
.\infra\scripts\ops.ps1 -Action start
```

Wait 10-15 seconds for services to initialize...

### Step 6: Verify Services Are Running

```powershell
# Check container status
docker compose -f docker-compose.self-hosted.yml ps

# You should see:
# NAME              STATUS
# kvc-postgres      Up (healthy)
# kvc-redis         Up (healthy)
# kvc-backend       Up (healthy)
# kvc-frontend      Up (healthy)
# kvc-nginx         Up (healthy)
```

### Step 7: Test the App

```powershell
# Test Nginx (frontend proxy)
Invoke-WebRequest http://localhost/ -UseBasicParsing

# Test Backend API
Invoke-WebRequest http://localhost/api -UseBasicParsing

# Open in browser
Start-Process "http://localhost"
```

**You should see:**
- Frontend: React app loads in browser
- ✅ No console errors
- ✅ Can interact with the app

---

## Accessing from Another Device on LAN

Find your machine IP:

```powershell
# Find your PC IP address
ipconfig | Select-String "IPv4"

# Look for something like: 192.168.x.x or 10.0.x.x
```

From another device on the same network, open:

```
http://YOUR_PC_IP:80
```

For example: `http://192.168.1.100`

**Windows Firewall Note:**
If other devices can't access, you may need to allow port 80:

```powershell
# Allow port 80 (HTTP)
New-NetFirewallRule -DisplayName "Allow HTTP for KVC" `
  -Direction Inbound -Action Allow -Protocol TCP -LocalPort 80
```

---

## Common Operations

### Check Logs

```powershell
# All services
docker compose -f docker-compose.self-hosted.yml logs -f

# Specific service
docker compose -f docker-compose.self-hosted.yml logs -f backend
docker compose -f docker-compose.self-hosted.yml logs -f frontend
docker compose -f docker-compose.self-hosted.yml logs -f nginx

# Or use helper script
.\infra\scripts\ops.ps1 -Action logs
```

### Restart Services

```powershell
# Restart all
docker compose -f docker-compose.self-hosted.yml restart

# Restart one service
docker compose -f docker-compose.self-hosted.yml restart backend

# Or use helper script
.\infra\scripts\ops.ps1 -Action restart
```

### Stop Services

```powershell
# Stop all (keeps data)
docker compose -f docker-compose.self-hosted.yml stop

# Or use helper script
.\infra\scripts\ops.ps1 -Action stop
```

### Rebuild After Code Changes

If you modify code:

```powershell
# 1. Stop services
docker compose -f docker-compose.self-hosted.yml stop

# 2. Rebuild frontend
cd frontend
npm run build
cd ..

# 3. Rebuild Docker images
docker compose -f docker-compose.self-hosted.yml build

# 4. Start services
docker compose -f docker-compose.self-hosted.yml --env-file .env.production up -d
```

### Clean Everything (Delete Database)

⚠️ **WARNING: This deletes all data!**

```powershell
docker compose -f docker-compose.self-hosted.yml down -v

# Or use helper script
.\infra\scripts\ops.ps1 -Action clean
```

---

## Troubleshooting

### Problem: "docker compose: command not found"

Docker Compose not installed or not in PATH.

**Solution:** Update Docker Desktop to latest version

### Problem: Services won't start / crash immediately

```powershell
# Check logs
docker compose -f docker-compose.self-hosted.yml logs -f

# Common causes:
# 1. Port already in use
# 2. Missing .env.production file
# 3. Frontend dist folder missing (need to run build)
```

### Problem: Backend can't connect to database

```powershell
# Check if postgres is healthy
docker compose -f docker-compose.self-hosted.yml logs postgres

# Check DATABASE_URL in .env.production
# Should be: postgresql://postgres:PASSWORD@postgres:5432/kvcdb

# Restart postgres
docker compose -f docker-compose.self-hosted.yml restart postgres
```

### Problem: Browser shows blank page / errors

```powershell
# 1. Check browser console (F12) for errors
# 2. Check backend API is reachable
Invoke-WebRequest http://localhost/api -UseBasicParsing

# 3. Check nginx logs
docker logs kvc-nginx

# 4. Rebuild frontend
cd frontend
npm run build
cd ..

# 5. Restart services
docker compose -f docker-compose.self-hosted.yml restart
```

### Problem: Port 80 already in use

```powershell
# Find what's using port 80
netstat -ano | findstr :80

# If you want to use different port, edit docker-compose.self-hosted.yml:
# Change:   - "80:80"
# To:       - "8080:80"

# Then access via: http://localhost:8080
```

---

## Production Checklist

Before deploying to production, ensure:

- ✅ `.env.production` has strong random secrets (not defaults)
- ✅ Windows Firewall allows port 80
- ✅ Docker Desktop is set to start on boot
- ✅ All services show "healthy" status
- ✅ App loads without errors in browser
- ✅ API calls work (check Network tab in browser DevTools)
- ✅ Chat/WebSocket works (Socket.io test)
- ✅ Database is backed up regularly
- ✅ Logs are monitored

---

## Quick Reference Commands

```powershell
# Helper scripts
.\infra\scripts\build.ps1              # Build frontend
.\infra\scripts\ops.ps1 -Action start  # Start services
.\infra\scripts\ops.ps1 -Action stop   # Stop services
.\infra\scripts\ops.ps1 -Action logs   # View logs
.\infra\scripts\ops.ps1 -Action status # Check status

# Docker commands
docker compose -f docker-compose.self-hosted.yml ps                                    # List services
docker compose -f docker-compose.self-hosted.yml logs -f                              # View logs
docker compose -f docker-compose.self-hosted.yml restart backend                      # Restart backend
docker compose -f docker-compose.self-hosted.yml exec backend npx prisma db push      # Run migrations
docker compose -f docker-compose.self-hosted.yml exec postgres psql -U postgres -d kvcdb # Connect to DB

# Development
cd frontend && npm run build           # Build frontend for production
cd backend && npm install              # Install backend dependencies
```

---

## File Structure

```
kvc-fullstack/
├── infra/                           # 🆕 Infrastructure configs
│   ├── nginx/
│   │   └── nginx.conf              # Reverse proxy config
│   └── scripts/
│       ├── build.ps1               # Build script (Windows)
│       ├── build.sh                # Build script (Linux)
│       └── ops.ps1                 # Operations script (Windows)
│
├── frontend/
│   ├── dist/                       # Built React app (created by npm run build)
│   ├── src/
│   ├── package.json
│   ├── Dockerfile                  # Frontend container
│   └── server.js                   # Express server for serving built app
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── Dockerfile                  # Backend container
│
├── docker-compose.self-hosted.yml  # 🆕 Main deployment config
├── .env.production                 # 🆕 Environment variables (create & fill these!)
└── ...
```

---

## Next Steps

1. ✅ Run `.\infra\scripts\build.ps1`
2. ✅ Fill in `.env.production` with secrets
3. ✅ Run `docker compose -f docker-compose.self-hosted.yml --env-file .env.production up -d`
4. ✅ Visit `http://localhost`
5. ✅ Test from another device: `http://<your-pc-ip>`

---

## Support

**Something broken?** Check:

1. `docker compose logs` - see actual error messages
2. This troubleshooting section
3. File permissions (if running as non-admin)
4. Disk space (Docker needs 10+ GB free)

Good luck! 🚀
