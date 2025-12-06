# KVC Self-Hosted Setup Guide
## Running Your Full Stack Web App on Your Windows PC

This guide explains how to run the KVC web application entirely on your Windows machine as a production server, accessible from other devices on your local network.

---

## 📋 Prerequisites

Before starting, ensure you have installed:

- **Docker Desktop for Windows**: https://www.docker.com/products/docker-desktop
  - Includes Docker Engine and docker-compose
  - Requires Windows 10/11 with Hyper-V enabled
  
- **Git** (optional, for version control)

- **Windows Firewall**: May need to allow Docker/nginx on port 80

**Verification:**
```powershell
docker --version
docker-compose --version
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Configure Environment

1. Open `.env.local` in the project root
2. **Update these critical values:**
   ```env
   # Change database password to something strong
   POSTGRES_PASSWORD=your-super-secure-password-12345
   
   # Change JWT secrets (generate random strings)
   JWT_ACCESS_SECRET=your-random-access-secret-here
   JWT_REFRESH_SECRET=your-random-refresh-secret-here
   COOKIE_SECRET=your-random-cookie-secret-here
   ```

### Step 2: Build and Start Services

Open PowerShell in the project root folder:

```powershell
# Start all services (builds Docker images on first run)
docker-compose -f docker-compose.local.yml --env-file .env.local up -d

# Wait 30-60 seconds for services to fully start
# (PostgreSQL needs time to initialize)
Start-Sleep -Seconds 45
```

**Expected output:**
```
[+] Running 4/4
 ✓ postgres    Healthy
 ✓ backend     Healthy  
 ✓ frontend    Healthy
 ✓ nginx       Healthy
```

### Step 3: Access the Website

**From your Windows PC:**
```
http://localhost
```

**From another device on your LAN:**
```
http://<your-pc-ip>
```
(Replace `<your-pc-ip>` with your machine's local IP, e.g., `http://192.168.1.100`)

### Step 4: Stop Services (When Done)

```powershell
docker-compose -f docker-compose.local.yml down
```

---

## 🌐 Finding Your Windows PC's LAN IP Address

You need this to access the site from other devices.

### Method 1: PowerShell (Recommended)

```powershell
ipconfig
```

Look for "IPv4 Address" under your active network adapter. Typically:
- `192.168.x.x` (home/office router)
- `10.0.x.x` (corporate)

Example output:
```
Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . . : 192.168.1.100
```

**Use:** `http://192.168.1.100`

### Method 2: Command Prompt

```cmd
ipconfig | findstr /R "IPv4"
```

### Method 3: Windows Settings

- Settings → Network & Internet → WiFi (or Ethernet)
- Look for "IPv4 address"

---

## 🔥 Windows Firewall Configuration

If you can't access from another device on your LAN, you may need to allow Docker/nginx through Windows Firewall.

### Option 1: Allow Port 80 (Nginx)

**PowerShell (Run as Administrator):**

```powershell
# Create inbound rule for port 80
New-NetFirewallRule -DisplayName "KVC HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
```

**To view/remove the rule:**
```powershell
Get-NetFirewallRule -DisplayName "KVC HTTP"
Remove-NetFirewallRule -DisplayName "KVC HTTP"
```

### Option 2: Using Windows Firewall GUI

1. Open **Windows Defender Firewall** → **Allow an app through firewall**
2. Click **Change settings**
3. Click **Allow another app** → Browse to Docker Desktop executable
4. Ensure "Private" is checked
5. Click **Add**

### Option 3: Temporarily Disable Firewall (Testing Only)

```powershell
# Disable (WARNING: Not recommended for production)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Re-enable
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

---

## 📦 Service Architecture

Your system runs 4 Docker containers:

```
┌─────────────────────────────────────────────────────┐
│  Your Windows PC (0.0.0.0)                          │
│                                                     │
│  Port 80 (HTTP)                                     │
│     ↓                                               │
│  ┌───────────────────────────────────────────────┐ │
│  │ NGINX Reverse Proxy (nginx)                   │ │
│  │ - Listens on 0.0.0.0:80                       │ │
│  │ - Routes / → frontend:3000                    │ │
│  │ - Routes /api → backend:4001                  │ │
│  └───────────────────────────────────────────────┘ │
│     ↓                              ↓               │
│  ┌────────────────────────┐  ┌─────────────────┐  │
│  │ Frontend (frontend)    │  │ Backend (backend)│  │
│  │ - React app in dist/   │  │ - Express API   │  │
│  │ - Listens on :3000     │  │ - Listens on    │  │
│  │ - Served via Express   │  │   :4001         │  │
│  └────────────────────────┘  └─────────────────┘  │
│                                   ↓               │
│                            ┌──────────────────┐   │
│                            │ Database         │   │
│                            │ (postgres)       │   │
│                            │ Port 5432        │   │
│                            │ kvcdb            │   │
│                            └──────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Port Mapping:**
| Container | Internal Port | Purpose |
|-----------|--------------|---------|
| nginx | 80 | Entry point - accessible from LAN on port 80 |
| frontend | 3000 | React app server |
| backend | 4001 | Express API server |
| postgres | 5432 | PostgreSQL database |

---

## 🔧 Common Tasks & Troubleshooting

### View Running Containers

```powershell
docker ps
```

### View Logs

```powershell
# All services
docker-compose -f docker-compose.local.yml logs -f

# Specific service
docker-compose -f docker-compose.local.yml logs -f nginx
docker-compose -f docker-compose.local.yml logs -f backend
docker-compose -f docker-compose.local.yml logs -f frontend
docker-compose -f docker-compose.local.yml logs -f postgres
```

### Check Service Health

```powershell
# Health status
docker-compose -f docker-compose.local.yml ps

# Manual health check
docker exec kvc-backend-local curl http://localhost:4001/api/health
docker exec kvc-frontend-local wget -q -O- http://localhost:3000
```

### Restart a Specific Service

```powershell
docker-compose -f docker-compose.local.yml restart backend
```

### Rebuild Docker Images (If Code Changed)

```powershell
docker-compose -f docker-compose.local.yml build --no-cache
docker-compose -f docker-compose.local.yml up -d
```

### Access Database Directly

```powershell
# Connect to PostgreSQL from host machine
# (Requires PostgreSQL client tools, e.g., pgAdmin)
# Host: localhost
# Port: 5432
# User: postgres
# Password: (whatever you set in .env.local)
# Database: kvcdb
```

### Change HTTP Port (If Port 80 Is Busy)

Edit `docker-compose.local.yml`, find the nginx section:

```yaml
ports:
  - "8080:80"  # Changed from "80:80"
```

Then restart:
```powershell
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d
```

Access at: `http://localhost:8080` or `http://192.168.1.100:8080`

---

## 🛡️ Security Considerations (Production Use)

If you plan to expose this publicly or in a production environment:

1. **Use HTTPS (SSL/TLS)**
   - Add SSL certificates to nginx config
   - Use Let's Encrypt (certbot) for free certificates

2. **Strengthen Secrets**
   ```powershell
   # Generate secure random strings
   [System.Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
   ```

3. **Database Security**
   - Use a strong PostgreSQL password
   - Limit database port exposure (5432 only internal)
   - Regular backups

4. **API Rate Limiting**
   - Already configured in `docker-compose.local.yml`
   - Adjust `RATE_LIMIT_MAX` as needed

5. **Monitor Logs**
   - Keep an eye on error logs for suspicious activity
   - Use `docker-compose logs` regularly

---

## 📊 Data Persistence

Your data is stored in Docker volumes:

```powershell
# View volumes
docker volume ls

# Backup database
docker exec kvc-postgres-local pg_dump -U postgres kvcdb > backup.sql

# Restore database
cat backup.sql | docker exec -i kvc-postgres-local psql -U postgres -d kvcdb
```

Volumes are preserved when containers restart or stop, but are deleted if you run:
```powershell
docker-compose -f docker-compose.local.yml down -v
```

---

## 🚀 Using Alternative Ports (If Port 80 Is Unavailable)

If port 80 is already in use (e.g., IIS, another web server), use port 8080:

### Option A: Change docker-compose.local.yml

```yaml
services:
  nginx:
    ports:
      - "8080:80"  # Access via http://localhost:8080
```

### Option B: Change Environment Variable (Recommended)

Create `.env.local.alt`:
```env
NGINX_PORT=8080
```

Then run:
```powershell
docker-compose -f docker-compose.local.yml --env-file .env.local.alt up -d
```

---

## 🔄 Development Workflow (If You're Developing)

### Option 1: Use dev docker-compose (Keep dev/prod separate)

```powershell
# Use original docker-compose.yml for development
docker-compose up -d

# This mounts source code for hot-reload
# Changes to backend/frontend code rebuild automatically
```

### Option 2: Run Locally (Without Docker)

```powershell
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Terminal 3: Database (Docker only)
docker run -d --name postgres -e POSTGRES_PASSWORD=test postgres:16-alpine
```

### Option 3: Hybrid (Docker DB, Local Code)

```powershell
# Start only database
docker-compose -f docker-compose.local.yml up -d postgres

# Run backend locally
cd backend
npm install
DATABASE_URL=postgresql://postgres:test@localhost:5432/kvcdb npm run dev

# Run frontend locally
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing API Endpoints

### Using curl (PowerShell)

```powershell
# Health check
curl http://localhost/api/health

# From another device
curl http://192.168.1.100/api/health
```

### Using Postman

1. Open Postman
2. Create new request
3. Enter: `http://localhost/api/health` or `http://192.168.1.100/api/health`
4. Click **Send**

### Using frontend directly

Visit `http://localhost` and check browser console for any errors.

---

## 📝 Key Files Reference

| File | Purpose |
|------|---------|
| `docker-compose.local.yml` | Main Docker Compose config for self-hosting |
| `.env.local` | Environment variables (COPY THIS FROM .env.local template) |
| `docker/nginx/default.conf` | Nginx reverse proxy configuration |
| `docker/backend/Dockerfile.prod` | Backend production Dockerfile |
| `docker/frontend/Dockerfile.prod` | Frontend production Dockerfile |
| `backend/Dockerfile` | Original backend Dockerfile (keep for reference) |
| `frontend/Dockerfile` | Original frontend Dockerfile (keep for reference) |

---

## ⚠️ Common Issues

### Issue: "Port 80 is already in use"

**Solution:** Use port 8080 instead (see "Using Alternative Ports" section)

### Issue: "Connection refused" from another device

**Solution:**
1. Check your PC's IP: `ipconfig`
2. Check firewall allows port 80: New-NetFirewallRule (see above)
3. Ensure you're on the same network
4. Try `http://<ip>:3000` (direct to frontend, skipping nginx)

### Issue: "Cannot connect to backend" from frontend

**Solution:**
1. Check backend logs: `docker-compose logs backend`
2. Ensure DATABASE_URL is correct in .env.local
3. Check postgres is healthy: `docker-compose ps`

### Issue: "502 Bad Gateway" error

**Solution:**
1. Check nginx logs: `docker-compose logs nginx`
2. Check backend is running: `docker-compose ps`
3. Rebuild: `docker-compose build --no-cache`

---

## 🎯 Next Steps

1. ✅ Configure `.env.local` with secure passwords
2. ✅ Start services: `docker-compose -f docker-compose.local.yml --env-file .env.local up -d`
3. ✅ Find your PC's IP: `ipconfig`
4. ✅ Access from another device: `http://<your-ip>`
5. ✅ Check Windows Firewall if access fails
6. ✅ Monitor logs: `docker-compose logs -f`

---

## 📞 Support

For issues:
1. Check logs: `docker-compose logs -f <service-name>`
2. Verify environment: `.env.local` is correctly configured
3. Restart services: `docker-compose down && docker-compose up -d`
4. Check docker: `docker ps` and `docker-compose ps`

---

**Happy self-hosting! 🚀**
