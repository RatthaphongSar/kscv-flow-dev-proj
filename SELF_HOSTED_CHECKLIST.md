# ✅ KVC Self-Hosted Deployment Checklist

## Pre-Deployment

- [ ] Docker Desktop installed and running
- [ ] Node.js v18+ installed
- [ ] Administrator access on Windows
- [ ] 10+ GB free disk space

## Setup

- [ ] Create `.env.production` with custom secrets:
  ```powershell
  # Copy template
  cat .env.production
  ```
  
- [ ] Generate secure random values:
  ```powershell
  -join ((33..126) | Get-Random -Count 32 | % {[char]$_})
  ```
  
- [ ] Fill in `.env.production`:
  ```
  POSTGRES_PASSWORD=<strong-random-password>
  REDIS_PASSWORD=<strong-random-password>
  JWT_SECRET=<long-random-string>
  JWT_REFRESH_SECRET=<long-random-string>
  ```

## Build

- [ ] Run build script:
  ```powershell
  .\infra\scripts\build.ps1
  ```

- [ ] Verify `frontend/dist` folder exists and contains files

## Deploy

- [ ] Start Docker services:
  ```powershell
  docker compose -f docker-compose.self-hosted.yml --env-file .env.production up -d
  ```

- [ ] Wait 10-15 seconds for services to initialize

- [ ] Check all services are healthy:
  ```powershell
  docker compose -f docker-compose.self-hosted.yml ps
  ```
  
  Expected status: **All "Up (healthy)"**

## Verify

- [ ] Test frontend loads:
  ```powershell
  Invoke-WebRequest http://localhost/ -UseBasicParsing
  ```

- [ ] Test API works:
  ```powershell
  Invoke-WebRequest http://localhost/api -UseBasicParsing
  ```

- [ ] Open browser: http://localhost
  - [ ] Page loads without errors
  - [ ] No red console errors (F12)
  - [ ] Can navigate pages
  - [ ] Can login/register

- [ ] Test from another device on LAN:
  ```
  http://<your-pc-ip>
  ```
  (Example: http://192.168.1.100)

## Troubleshooting Checklist

If something doesn't work:

1. [ ] Check Docker is running: `docker ps`
2. [ ] Check service status: `docker compose -f docker-compose.self-hosted.yml ps`
3. [ ] Check logs: `docker compose -f docker-compose.self-hosted.yml logs -f`
4. [ ] Check port 80 is free: `netstat -ano | findstr :80`
5. [ ] Verify .env.production exists and is in project root
6. [ ] Check frontend/dist exists and has files
7. [ ] Restart services: `docker compose -f docker-compose.self-hosted.yml restart`
8. [ ] Check Windows Firewall allows port 80

## Files You Need

✅ **New/Updated Files:**

- `docker-compose.self-hosted.yml` - Main deployment config
- `.env.production` - Your environment variables (must fill in!)
- `infra/nginx/nginx.conf` - Reverse proxy configuration
- `infra/scripts/build.ps1` - Build script
- `infra/scripts/ops.ps1` - Operation helper
- `DEPLOYMENT_SELF_HOSTED.md` - This comprehensive guide

✅ **Already Exist:**

- `frontend/Dockerfile` - Frontend container
- `backend/Dockerfile` - Backend container
- `frontend/package.json` - Frontend build config
- `backend/package.json` - Backend config

## Important Notes

⚠️ **Security:**
- Don't commit `.env.production` to Git (already in .gitignore)
- Use strong random passwords/secrets
- Change JWT secrets from defaults

⚠️ **Storage:**
- Database data stored in Docker volumes
- Persists even if containers stop
- Back up volumes regularly if production

⚠️ **Performance:**
- First boot may take 1-2 minutes
- Database migrations run automatically
- WebSocket connections pooled

## Command Reference

```powershell
# Quick start
.\infra\scripts\build.ps1
docker compose -f docker-compose.self-hosted.yml --env-file .env.production up -d

# Operations
.\infra\scripts\ops.ps1 -Action start      # Start services
.\infra\scripts\ops.ps1 -Action stop       # Stop services
.\infra\scripts\ops.ps1 -Action logs       # View logs
.\infra\scripts\ops.ps1 -Action status     # Check status
.\infra\scripts\ops.ps1 -Action clean      # Delete everything (⚠️ careful!)

# Manual operations
docker compose -f docker-compose.self-hosted.yml logs -f
docker compose -f docker-compose.self-hosted.yml restart backend
docker compose -f docker-compose.self-hosted.yml ps
```

## Success Criteria

You're done when:

✅ `http://localhost` loads your app  
✅ All services show "healthy"  
✅ Can login and use features  
✅ No console errors in browser  
✅ Can access from another device on LAN  
✅ `.env.production` has custom secrets  

## Next Steps (Optional)

- [ ] Set up HTTPS/SSL certificates
- [ ] Configure automatic backups
- [ ] Set up monitoring/alerts
- [ ] Document your custom configuration
- [ ] Create restore/backup procedures

---

**Good luck! Your app is ready to run! 🚀**
