# 🚀 KVC Self-Hosted Setup - Complete Package Documentation

## 📍 YOU ARE HERE: Main Entry Point

Welcome! Your KVC web application has been completely reset from **Railway/Cloudflare cloud deployment** to **production-ready self-hosting on your Windows PC**.

---

## ⚡ QUICK START (5 MINUTES)

**Already configured? Just run:**

```powershell
cd c:\Users\PC\Downloads\kvc-fullstack
docker-compose -f docker-compose.local.yml --env-file .env.local up -d
```

Access at: **`http://localhost`**

---

## 📚 DOCUMENTATION INDEX

### 🎯 **For First-Time Setup**
1. **`QUICK_START.md`** ← Start here!
   - 5-minute quick start
   - Essential commands
   - Quick reference card

2. **`SELF_HOSTED_SETUP_GUIDE.md`** (Detailed)
   - Complete step-by-step instructions
   - Windows Firewall configuration
   - Find your PC's IP address
   - Troubleshooting section
   - Development workflows

### 📖 **Understanding the Changes**
3. **`MIGRATION_GUIDE.md`** (For context)
   - What changed from Railway/Cloudflare
   - Old files to delete/archive
   - New architecture overview
   - Migration steps

4. **`COMPLETE_SETUP_SUMMARY.md`** (Complete reference)
   - Comprehensive system overview
   - Architecture diagram
   - All important details
   - Security checklist

### 🛠️ **Getting Things Done**
5. **`kvc-helper.ps1`** (Automation)
   - PowerShell helper script
   - Commands: `kvc-start`, `kvc-stop`, `kvc-logs`, `kvc-test`, `kvc-ip`
   - Load with: `. .\kvc-helper.ps1`

6. **`cleanup-old-deploy.ps1`** (One-time cleanup)
   - Automatically delete old Railway/Cloudflare configs
   - Run once: `powershell -ExecutionPolicy Bypass -File cleanup-old-deploy.ps1`

---

## 🎮 CHOOSE YOUR WORKFLOW

### ✅ **Option 1: I just want to start the system**

```powershell
# 1. Edit configuration
notepad .env.local

# 2. Start services
docker-compose -f docker-compose.local.yml --env-file .env.local up -d

# 3. Access website
# http://localhost
```

**Read:** `QUICK_START.md` (2 min)

---

### ✅ **Option 2: I want detailed step-by-step instructions**

1. Read: `SELF_HOSTED_SETUP_GUIDE.md` (15 min)
2. Follow all sections carefully
3. Test from another device on your LAN

**Read:** `SELF_HOSTED_SETUP_GUIDE.md` (full)

---

### ✅ **Option 3: I want to understand what changed**

1. Read: `MIGRATION_GUIDE.md` (understand context)
2. Run cleanup script to remove old configs
3. Follow Quick Start instructions

**Read:** `MIGRATION_GUIDE.md` + `QUICK_START.md`

---

### ✅ **Option 4: I want complete reference documentation**

Read: `COMPLETE_SETUP_SUMMARY.md` (comprehensive overview with everything)

**Read:** `COMPLETE_SETUP_SUMMARY.md` (30 min)

---

## 🔧 KEY CONFIGURATION FILES

### Must Edit Before First Run
- **`.env.local`** - Database password, JWT secrets, API URLs
  - Copy template: No, it already exists
  - Edit it: `notepad .env.local`
  - REQUIRED: Change POSTGRES_PASSWORD and JWT secrets

### Main Orchestration
- **`docker-compose.local.yml`** - Docker Compose configuration
  - Defines: nginx, backend, frontend, postgres
  - Networks: kvc-network (internal)
  - Volumes: postgres_data (persistent)
  - Do NOT edit unless you know what you're doing

### Nginx Reverse Proxy
- **`docker/nginx/default.conf`** - Nginx routing configuration
  - Routes `/` to frontend (port 3000)
  - Routes `/api` to backend (port 4001)
  - Handles gzip compression, caching

---

## 📊 CURRENT SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│  Your Windows PC (0.0.0.0 / 192.168.x.x)           │
│                                                     │
│  Port 80 (HTTP) - Public Entry Point                │
│    ↓                                                │
│  ┌─────────────────────────────────────────────┐  │
│  │ NGINX Reverse Proxy                         │  │
│  │ - Listens on 0.0.0.0:80                     │  │
│  │ - Routes / → frontend:3000                  │  │
│  │ - Routes /api → backend:4001                │  │
│  └─────────────────────────────────────────────┘  │
│    ↙                           ↘                   │
│  Frontend (React)          Backend (Node.js)      │
│  Port 3000                 Port 4001               │
│  ↓                         ↓                       │
│  Serves dist/              Express API             │
│  Built React               /api/* routes           │
│                            ↓                       │
│                            PostgreSQL (5432)       │
│                            Database: kvcdb         │
│                            Persistent volumes      │
└─────────────────────────────────────────────────────┘

Access from LAN:
- Other Device → http://192.168.1.100 (your PC's IP)
```

---

## 🚀 LAUNCHING THE SYSTEM

### Step 1: Configure
```powershell
notepad .env.local
# Edit: POSTGRES_PASSWORD, JWT_*_SECRET values
```

### Step 2: Start
```powershell
docker-compose -f docker-compose.local.yml --env-file .env.local up -d
```

### Step 3: Verify
```powershell
docker-compose -f docker-compose.local.yml ps
# All services should show as "Healthy"
```

### Step 4: Access
- Local: `http://localhost`
- LAN: `http://192.168.1.100` (use your PC's IP)

---

## 🎯 COMMON TASKS

### Find Your PC's IP Address
```powershell
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

### View Service Logs
```powershell
# All logs
docker-compose -f docker-compose.local.yml logs -f

# Specific service
docker-compose -f docker-compose.local.yml logs -f backend
```

### Restart a Service
```powershell
docker-compose -f docker-compose.local.yml restart backend
```

### Test API
```powershell
curl http://localhost/api/health
```

### Use Helper Script
```powershell
# Load helper script
. .\kvc-helper.ps1

# Use commands
kvc-start
kvc-stop
kvc-restart
kvc-status
kvc-logs
kvc-test
kvc-ip
```

---

## 📋 BEFORE YOU START

### Prerequisites ✅
- [ ] Docker Desktop installed and running
- [ ] Windows 10/11
- [ ] At least 4GB RAM
- [ ] Port 80 available (or willing to use port 8080)

### Configuration ✅
- [ ] `.env.local` edited with secure passwords
- [ ] JWT secrets changed to random values
- [ ] Database password is NOT default

### Network ✅
- [ ] Connected to local network (router)
- [ ] Windows Firewall allows port 80 (or configured for alternate port)
- [ ] Other devices are on same network

---

## 🆘 NEED HELP?

### Quick Issues

| Problem | Solution |
|---------|----------|
| Can't access from another device | Read "Windows Firewall Configuration" in SELF_HOSTED_SETUP_GUIDE.md |
| Port 80 is in use | Change docker-compose.local.yml: `"8080:80"` |
| Database not connecting | Check `.env.local` POSTGRES_PASSWORD matches |
| "502 Bad Gateway" | Rebuild: `docker-compose build --no-cache` |
| Services won't start | Check logs: `docker-compose logs` |

### Get Detailed Help
- **Full Setup Guide:** `SELF_HOSTED_SETUP_GUIDE.md`
- **Reference Info:** `COMPLETE_SETUP_SUMMARY.md`
- **Quick Commands:** `QUICK_START.md`
- **What Changed:** `MIGRATION_GUIDE.md`

---

## 📁 NEW FILES CREATED FOR YOU

### Configuration (Edit These)
- `docker-compose.local.yml` - Main Docker Compose file
- `.env.local` - Environment configuration template
- `docker/nginx/default.conf` - Nginx reverse proxy config

### Documentation (Read These)
- `QUICK_START.md` - 5-minute quick start
- `SELF_HOSTED_SETUP_GUIDE.md` - Detailed instructions
- `MIGRATION_GUIDE.md` - What changed
- `COMPLETE_SETUP_SUMMARY.md` - Complete reference
- This file: `README-SELF-HOSTED.md`

### Scripts (Run These)
- `kvc-helper.ps1` - PowerShell helper script
- `cleanup-old-deploy.ps1` - Clean up old Railway/Cloudflare configs

---

## 🗑️ OLD CONFIGS CLEANED UP

The following files are no longer used:

### Deleted
- `.railwayignore`, `Procfile`, `generate-cert.js`, etc.
- Old deploy scripts (`deploy.ps1`, `deploy.sh`, etc.)

### Archived (moved to `_archive/`)
- `RAILWAY_*.md` - Railway deployment guides
- `CLOUDFLARE_*.md` - Cloudflare deployment guides
- Old deployment documentation

**To clean up automatically:**
```powershell
powershell -ExecutionPolicy Bypass -File cleanup-old-deploy.ps1
```

---

## ✅ SUCCESS CHECKLIST

Your setup is working when:

- [ ] Services are running: `docker-compose ps` shows all "Healthy"
- [ ] You can access: `http://localhost` from your PC
- [ ] You can access: `http://192.168.x.x` from another device
- [ ] API health check works: `curl http://localhost/api/health`
- [ ] No errors in logs: `docker-compose logs`
- [ ] Database is connected: Backend logs show successful connection

---

## 🚀 NOW WHAT?

### **First Time?**
1. Read: `QUICK_START.md` (5 min)
2. Edit: `.env.local` with secure passwords
3. Run: `docker-compose -f docker-compose.local.yml --env-file .env.local up -d`
4. Access: `http://localhost`

### **Need Details?**
Read: `SELF_HOSTED_SETUP_GUIDE.md` (detailed instructions)

### **Understanding Changes?**
Read: `MIGRATION_GUIDE.md` (what changed from Railway)

### **Using Helper Scripts?**
Load: `. .\kvc-helper.ps1` then use `kvc-start`, `kvc-stop`, etc.

---

## 🎯 IMPORTANT NOTES

### NOT Cloud Deployment
❌ This is NOT for Railway, Heroku, AWS, or Cloudflare  
✅ This is for self-hosting on your Windows PC

### NOT Development Mode
❌ This is NOT for `npm run dev`  
✅ This is production-ready with built/compiled apps

### For Single Machine
❌ This is NOT distributed across multiple servers  
✅ This is all services on your one Windows PC

---

## 📞 DOCUMENTATION REFERENCE

| Document | Purpose | Read Time |
|----------|---------|-----------|
| `QUICK_START.md` | Quick 5-minute setup | 5 min |
| `SELF_HOSTED_SETUP_GUIDE.md` | Detailed complete guide | 20 min |
| `MIGRATION_GUIDE.md` | Understanding what changed | 10 min |
| `COMPLETE_SETUP_SUMMARY.md` | Complete reference | 30 min |
| `kvc-helper.ps1` | Automation helpers | Ongoing |
| `cleanup-old-deploy.ps1` | Cleanup script | 1 min |

---

## 🎉 YOU'RE READY TO GO!

**Next step:** Open `QUICK_START.md` and follow the 3 quick steps to launch your system!

---

**Status:** ✅ Complete and Ready for Self-Hosting  
**Deployment Type:** Docker Compose on Windows PC  
**Setup Date:** December 6, 2025  
**System:** Production-Ready  

---

**Questions?** Start with `QUICK_START.md` → `SELF_HOSTED_SETUP_GUIDE.md`

**Happy hosting!** 🚀
