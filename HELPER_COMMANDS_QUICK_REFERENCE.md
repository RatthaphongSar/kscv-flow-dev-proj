# KVC Helper Commands - Quick Reference

## After Starting PowerShell

The helper commands are **automatically loaded** on PowerShell startup. You can immediately use:

```powershell
kvc-help      # Show all commands
kvc-start     # Start all services
kvc-stop      # Stop all services
kvc-status    # Show service status
```

## Service Management

### Start Services
```powershell
kvc-start
```
Starts all 4 services (PostgreSQL, Backend, Frontend, Nginx) and shows status after 5 seconds.

### Stop Services
```powershell
kvc-stop
```
Stops all services cleanly.

### Restart Services
```powershell
kvc-restart
```
Equivalent to `kvc-stop` + `kvc-start` with 3-second delay.

### Check Status
```powershell
kvc-status
```
Shows current status of all running services.

---

## Monitoring & Logs

### View All Logs (last 50 lines)
```powershell
kvc-logs
```

### View Specific Service Logs
```powershell
kvc-logs backend        # Backend API logs
kvc-logs frontend       # Frontend server logs
kvc-logs nginx          # Nginx reverse proxy logs
kvc-logs postgres       # Database logs
```

### View More Lines
```powershell
kvc-logs all 100        # Last 100 lines from all services
kvc-logs backend 200    # Last 200 lines from backend
```

---

## Network & Access

### Find Your IP Address
```powershell
kvc-ip
```
Shows all your Windows PC IP addresses. Use to access from other devices.

**Example output:**
```
Your Windows PC IP Addresses:

  WLAN : 192.168.1.101
  ...

Access from other devices on LAN:
  http://192.168.1.101 (or your local IP)
```

### Test All Services
```powershell
kvc-test
```
Tests connectivity to:
- Frontend (http://localhost)
- Backend (http://localhost:4001)
- Database (postgres:5432)

**Example output:**
```
Frontend (http://localhost)... ✅ OK (200)
Backend (http://localhost:4001)... ✅ OK (200)
Database (postgres:5432)... ✅ OK
```

---

## Advanced Commands

### Enter Container Shell
```powershell
kvc-shell              # Enter backend container
kvc-shell postgres     # Enter database container
```

---

## Common Workflows

### 1. Start Development Session
```powershell
kvc-start
kvc-test
kvc-logs   # See if everything is healthy
```

### 2. Check if Services are Running
```powershell
kvc-status
```

### 3. Access Website
- **Local**: Open browser to `http://localhost`
- **From another device**: Open browser to `http://192.168.1.101` (replace with your IP from `kvc-ip`)

### 4. Debug a Service
```powershell
kvc-logs backend      # Check backend logs
kvc-logs nginx        # Check nginx routing
kvc-logs postgres     # Check database connection
```

### 5. Stop Everything
```powershell
kvc-stop
```

---

## Access Points

| What | URL |
|------|-----|
| Frontend (Local) | http://localhost |
| Backend API (Local) | http://localhost:4001 |
| Frontend (LAN) | http://192.168.1.101 |
| Backend API (LAN) | http://192.168.1.101:4001 |
| Database (Internal) | postgres:5432 |

---

## Help

Type `kvc-help` anytime to see the full command reference.

---

## Troubleshooting

### "Command not found" error
Make sure you've started a new PowerShell window after the profile was updated. Close and reopen PowerShell.

### Services not responding
```powershell
kvc-logs     # Check for errors
kvc-test     # Test connectivity
```

### Need to reload helper script
```powershell
. C:\Users\PC\Downloads\kvc-fullstack\kvc-simple.ps1
```

---

## File Locations

- **Helper Script**: `C:\Users\PC\Downloads\kvc-fullstack\kvc-simple.ps1`
- **Compose File**: `C:\Users\PC\Downloads\kvc-fullstack\docker-compose.local.yml`
- **Environment**: `C:\Users\PC\Downloads\kvc-fullstack\.env.local`
- **Root Dir**: `C:\Users\PC\Downloads\kvc-fullstack`

---

*Generated: December 6, 2025*
*KVC Self-Hosted Deployment*
