# ✅ KVC Helper Commands Setup Complete

**Status**: 🟢 FULLY OPERATIONAL  
**Date**: December 6, 2025

---

## What's Ready

You now have easy-to-use commands for managing your KVC deployment:

```
kvc-start       kvc-stop        kvc-restart     kvc-status
kvc-logs        kvc-test        kvc-ip          kvc-help
```

These commands are **automatically loaded** when you open PowerShell.

---

## Quick Start (New PowerShell Window)

```powershell
# These work immediately - no setup needed!
kvc-status      # Check if services are running
kvc-start       # Start all services
kvc-test        # Test everything is working
```

---

## Your IP Addresses

From the test above, your machine has these IPs:

- **LAN (Main)**: `192.168.1.101` ← **Use this for LAN access**
- **Ethernet**: `169.254.139.244`
- **VPN**: `26.203.83.129`

### Access KVC:
- **Local Machine**: http://localhost
- **From LAN**: http://192.168.1.101
- **Backend API**: http://192.168.1.101:4001

---

## All Available Commands

| Command | What It Does |
|---------|-------------|
| `kvc-help` | Show all commands with detailed help |
| `kvc-start` | Start all services (postgres, backend, frontend, nginx) |
| `kvc-stop` | Stop all services |
| `kvc-restart` | Stop then start (with 3s pause) |
| `kvc-status` | Show running services and their health |
| `kvc-logs` | Show last 50 lines of all logs |
| `kvc-logs backend` | Show backend logs |
| `kvc-logs frontend` | Show frontend logs |
| `kvc-logs nginx` | Show nginx (reverse proxy) logs |
| `kvc-logs postgres` | Show database logs |
| `kvc-logs all 100` | Show all logs, last 100 lines |
| `kvc-test` | Test frontend, backend, and database connectivity |
| `kvc-ip` | Show your PC's IP addresses |
| `kvc-shell` | Enter backend container shell |
| `kvc-shell postgres` | Enter database container shell |

---

## How It Works

### Automatic Loading
1. PowerShell starts
2. Loads your profile (`C:\Users\PC\OneDrive\เอกสาร\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`)
3. Profile loads `C:\Users\PC\Downloads\kvc-fullstack\kvc-simple.ps1`
4. All commands available immediately

### Manual Loading (if needed)
```powershell
. C:\Users\PC\Downloads\kvc-fullstack\kvc-simple.ps1
```

---

## Typical Daily Workflow

### Morning - Start Development
```powershell
kvc-start     # Start all services
kvc-test      # Verify everything works
# Open http://localhost in browser
```

### During Development
```powershell
kvc-logs backend      # Check for errors
kvc-status            # Verify services running
```

### Evening - Stop
```powershell
kvc-stop      # Clean shutdown
```

---

## Troubleshooting

### "Commands not found" after restarting PowerShell
- Close all PowerShell windows
- Open a NEW PowerShell window
- Commands should work immediately

### "Cannot connect to localhost"
```powershell
kvc-test      # This will show what's working/broken
kvc-logs      # Check for errors
kvc-status    # Verify services are running
```

### Need to manually start services
```powershell
cd C:\Users\PC\Downloads\kvc-fullstack
docker-compose -f docker-compose.local.yml up -d
```

---

## Key Files

| File | Purpose |
|------|---------|
| `kvc-simple.ps1` | The helper script with all commands |
| `docker-compose.local.yml` | Main Docker configuration |
| `.env.local` | Environment variables (SECRET - keep safe!) |
| `docker/nginx/default.conf` | Nginx reverse proxy config |

---

## Environment Setup Status

✅ **Required Configuration**: Done
✅ **Services**: Running
✅ **Access**: Working (local + LAN)
✅ **Helper Commands**: Installed + Functional
⚠️ **Next Step**: Configure `.env.local` with your own secrets (POSTGRES_PASSWORD, JWT keys, etc.)

---

## Testing Status

```
✅ Frontend (http://localhost)............ OK (200)
✅ Backend (http://localhost:4001)........ OK (200)  
✅ Database (postgres:5432).............. OK (healthy)
✅ Nginx Reverse Proxy................... OK (healthy)
✅ PostgreSQL Service.................... OK (healthy)
⚠️  Redis (orphan - not in compose)....... OK (running but ignore)
```

---

## Next Steps

1. **Open Browser**: http://localhost to see the website
2. **Test from LAN**: http://192.168.1.101 from another device
3. **Configure Secrets**: Edit `.env.local` for production
4. **Run Migrations**: If database needs setup
5. **Create Account**: Test the application

---

## Files Created/Modified

| File | Status |
|------|--------|
| `kvc-simple.ps1` | ✅ Created (simplified, working helper) |
| `kvc-helper.ps1` | ⚠️ Fixed (emoji issue, still in use) |
| `$PROFILE` | ✅ Updated (auto-load helper on startup) |
| `HELPER_COMMANDS_QUICK_REFERENCE.md` | ✅ Created (this guide) |
| `DEPLOYMENT_VERIFICATION_COMPLETE.md` | ✅ Created (earlier verification) |

---

## System Information

**Deployment Type**: Self-Hosted Docker on Windows  
**Main Compose File**: `docker-compose.local.yml`  
**Services Count**: 4 (postgres, backend, frontend, nginx) + 1 orphan (redis)  
**Primary Network**: WLAN (`192.168.1.101`)  
**Access**: Local + LAN working  
**Helper Script**: Automatically loaded in PowerShell  

---

## Quick Links

- 📍 **Local**: http://localhost
- 🌐 **LAN**: http://192.168.1.101
- 📄 **Full Setup Guide**: `START_HERE.md`
- 📋 **Command Reference**: `HELPER_COMMANDS_QUICK_REFERENCE.md`
- ✅ **Deployment Status**: `DEPLOYMENT_VERIFICATION_COMPLETE.md`

---

**Ready to use! Open a new PowerShell window and type `kvc-help` to get started.**

*Setup completed: December 6, 2025*
