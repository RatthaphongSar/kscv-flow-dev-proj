# KVC Self-Hosted - Quick Reference Card

## 🚀 START HERE

```powershell
# 1. Open PowerShell in project root
cd c:\Users\PC\Downloads\kvc-fullstack

# 2. Edit .env.local with your passwords
notepad .env.local

# 3. Start all services
docker-compose -f docker-compose.local.yml --env-file .env.local up -d

# 4. Wait for services to be healthy (30-60 seconds)
docker-compose -f docker-compose.local.yml ps

# 5. Access from your PC
# http://localhost

# 6. Access from another device
# Find your IP: ipconfig
# Then visit: http://192.168.x.x
```

---

## 📁 File Structure

```
kvc-fullstack/
├── docker-compose.local.yml ........... USE THIS (not docker-compose.yml)
├── .env.local ........................ EDIT THIS with secure passwords
├── docker/
│   └── nginx/
│       └── default.conf .............. Nginx routing config
├── backend/
│   ├── Dockerfile .................... (referenced by docker-compose)
│   └── src/
├── frontend/
│   ├── Dockerfile .................... (referenced by docker-compose)
│   └── src/
└── docs/
    ├── SELF_HOSTED_SETUP_GUIDE.md .... DETAILED instructions
    └── MIGRATION_GUIDE.md ............ What changed & cleanup
```

---

## 🔑 Critical Configuration

### `.env.local` - MUST BE CHANGED

```env
# Database password (change to strong password)
POSTGRES_PASSWORD=your-secure-password-here

# JWT secrets (generate random strings)
JWT_ACCESS_SECRET=random-string-1
JWT_REFRESH_SECRET=random-string-2
COOKIE_SECRET=random-string-3

# API URL (use your PC's IP or localhost)
VITE_API_BASE=http://localhost/api
VITE_BACKEND_URL=http://localhost/api
```

---

## 🎮 Common Commands

| Command | Purpose |
|---------|---------|
| `docker-compose -f docker-compose.local.yml --env-file .env.local up -d` | Start all services |
| `docker-compose -f docker-compose.local.yml down` | Stop all services |
| `docker-compose -f docker-compose.local.yml ps` | View running services |
| `docker-compose -f docker-compose.local.yml logs -f nginx` | View nginx logs |
| `docker-compose -f docker-compose.local.yml restart backend` | Restart backend |
| `docker-compose -f docker-compose.local.yml build --no-cache` | Rebuild images |

---

## 🌐 Access Points

| Device | URL |
|--------|-----|
| **From your PC** | `http://localhost` |
| **From your PC (backend)** | `http://localhost:4001/api/health` |
| **From another device** | `http://192.168.1.100` |
| **Using custom port** | `http://192.168.1.100:8080` |

---

## 🔍 Troubleshooting

### "Port 80 already in use"
→ Change nginx port in `docker-compose.local.yml`: `"8080:80"`

### "Connection refused from another device"
→ Run: `ipconfig` (find your IPv4)
→ Check firewall: Allow port 80 or 8080

### "Backend not responding"
→ Check logs: `docker-compose logs backend`
→ Verify DATABASE_URL in .env.local

### "502 Bad Gateway"
→ Check if backend is running: `docker-compose ps`
→ Rebuild: `docker-compose build --no-cache`

---

## 🎯 Architecture

```
Your Windows PC
├─ Port 80 (nginx reverse proxy)
│  ├─ / → frontend (port 3000)
│  └─ /api → backend (port 4001)
├─ PostgreSQL (port 5432, internal only)
└─ Redis (optional, internal)
```

---

## 📝 Find Your PC's IP Address

```powershell
ipconfig
```

Look for **IPv4 Address** under your network adapter:
```
IPv4 Address. . . . . . . . . . : 192.168.1.100
```

---

## 🛡️ Windows Firewall

Allow port 80:
```powershell
New-NetFirewallRule -DisplayName "KVC HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
```

---

## 💾 Data Backup

```powershell
# Backup database
docker exec kvc-postgres-local pg_dump -U postgres kvcdb > backup.sql

# Restore from backup
cat backup.sql | docker exec -i kvc-postgres-local psql -U postgres kvcdb
```

---

## ⚠️ DO NOT USE

- ❌ Railway deployment
- ❌ Cloudflare configuration
- ❌ Old deploy scripts
- ❌ docker-compose.yml (use docker-compose.local.yml)

---

## ✅ ALWAYS USE

- ✅ `docker-compose.local.yml`
- ✅ `.env.local`
- ✅ `docker/nginx/default.conf`
- ✅ `SELF_HOSTED_SETUP_GUIDE.md`

---

**See `SELF_HOSTED_SETUP_GUIDE.md` for detailed instructions**
