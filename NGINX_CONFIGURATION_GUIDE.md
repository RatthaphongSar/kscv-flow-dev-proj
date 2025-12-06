# 🚀 Nginx Configuration Guide

**Project**: KVC WebApp  
**Date**: December 6, 2025  
**Version**: 1.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Configuration Comparison](#configuration-comparison)
3. [Docker vs Windows Setup](#docker-vs-windows-setup)
4. [Detailed Configuration Sections](#detailed-configuration-sections)
5. [Performance Optimization](#performance-optimization)
6. [Security Features](#security-features)
7. [Troubleshooting](#troubleshooting)
8. [Deployment Options](#deployment-options)

---

## Overview

This guide documents the Nginx configuration for KVC WebApp, which can run in two modes:

- **Docker Mode** (Production): Uses containerized Nginx with Docker Compose
- **Windows Mode** (Development): Uses standalone Nginx on Windows with Docker containers for backend

### Current Setup

Your current deployment uses **Docker Mode** which is production-ready:
- ✅ Proper container orchestration
- ✅ Inter-container networking
- ✅ SSL/HTTPS support
- ✅ Advanced security headers
- ✅ Rate limiting and compression

---

## Configuration Comparison

### Architecture Differences

| Aspect | Docker Mode | Windows Mode |
|--------|------------|--------------|
| **Nginx** | Containerized | Standalone Windows binary |
| **Networking** | Docker bridge network | Windows localhost + Docker ports |
| **Backend** | `backend:4001` (container) | `127.0.0.1:4001` (Docker on Windows) |
| **Frontend** | `frontend:3000` (container) | `127.0.0.1:3000` (Docker on Windows) |
| **SSL/HTTPS** | Built-in with certs | Can add certificates |
| **Deployment** | Full containerization | Mixed environment |

### When to Use Each

**Use Docker Mode if:**
- ✅ Production deployment
- ✅ Cloud platforms (AWS, Azure, Railway, etc.)
- ✅ Consistent environment needed
- ✅ Horizontal scaling planned
- ✅ Full containerization required

**Use Windows Mode if:**
- ✅ Local development on Windows
- ✅ Testing without Docker Compose
- ✅ Running backend in Docker but need local Nginx
- ✅ Troubleshooting container issues

---

## Docker vs Windows Setup

### Docker Setup (Current - Production)

**File**: `kvc-fullstack/nginx.conf`

```yaml
Services:
├─ nginx (port 80, 443)
├─ backend (port 4001)
├─ frontend (port 3000)
├─ postgres (port 5432)
└─ redis (port 6379)
```

**Networking**: All services communicate via Docker bridge (`kvc-network`)

**Configuration**:
- Uses `upstream backend { server backend:4001; }`
- Uses `upstream frontend { server frontend:3000; }`
- Full SSL/HTTPS support
- Production security headers included

### Windows Setup (Standalone)

**File**: `c:\nginx-1.29.3\nginx-1.29.3\conf\nginx.conf`

```
Nginx (Windows) ──┬─→ Backend (Docker on Windows port 4001)
                  ├─→ Frontend (Docker on Windows port 3000)
                  └─→ Static files (C:/nginx-1.29.3/.../html)
```

**Networking**: 
- Nginx on Windows uses `127.0.0.1:4001` and `127.0.0.1:3000`
- Connects to Docker containers via Windows port forwarding

**Configuration**:
- Uses `upstream backend { server 127.0.0.1:4001; }`
- Uses `upstream frontend { server 127.0.0.1:3000; }`
- Can optionally add SSL
- All modern security headers included (updated version)

---

## Detailed Configuration Sections

### 1. Worker Configuration

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}
```

**What it does**: 
- `worker_processes`: Number of worker processes. Set to `1` for development, use `auto` for production
- `worker_connections`: Maximum concurrent connections per worker

**Production Recommendation**:
```nginx
worker_processes auto;
events {
    worker_connections 2048;
}
```

---

### 2. Performance Optimization

```nginx
sendfile        on;       # Enable efficient file transfer
tcp_nopush      on;       # Send headers in one packet
tcp_nodelay     on;       # Reduce latency for small packets
keepalive_timeout 65;     # Connection persistence
types_hash_max_size 2048; # Hash table size for MIME types
client_max_body_size 20M; # Max upload size
```

**Impact**:
- Faster static file serving
- Reduced bandwidth usage
- Better handling of concurrent connections
- Supports larger file uploads (20MB)

---

### 3. Gzip Compression

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript 
            application/json application/javascript 
            application/xml+rss font/truetype application/vnd.ms-fontobject;
```

**Benefits**:
- Reduces file size by 70-90% for text/JSON
- Faster page loads
- Lower bandwidth usage
- Automatic based on client support

**Performance**: ~6 is optimal (0-9 range, higher = slower compression but better ratio)

---

### 4. Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;
```

**What it does**:
- `api_limit`: Max 10 requests/second per IP for `/api/`
- `general_limit`: Max 30 requests/second per IP for frontend
- Prevents abuse and DDoS attacks
- `10m` memory zone holds 10 minutes of data

**Usage in locations**:
```nginx
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    # ... rest of config
}
```

---

### 5. Upstream Backends (Docker Mode)

```nginx
upstream backend {
    server backend:4001;  # Docker DNS name
    keepalive 32;         # Connection pooling
}

upstream frontend {
    server frontend:3000;
    keepalive 32;
}
```

**Docker DNS**: `backend` and `frontend` resolve automatically within the Docker network

**Connection Pooling**: `keepalive 32` maintains 32 persistent connections to reduce overhead

---

### 6. Upstream Backends (Windows Mode)

```nginx
upstream backend {
    server 127.0.0.1:4001;  # Windows localhost
    keepalive 32;
}

upstream frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}
```

**Localhost**: `127.0.0.1` connects to Docker containers forwarded to Windows

**Note**: Works because Docker Desktop on Windows forwards container ports to `127.0.0.1`

---

### 7. API Proxy Configuration

```nginx
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass         http://backend;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade $http_upgrade;
    proxy_set_header   Connection "upgrade";
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Buffering
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
}
```

**Key Settings**:
- **rate limiting**: Prevents API abuse
- **proxy_pass**: Routes to backend
- **Upgrade headers**: Required for WebSockets
- **X-Real-IP**: Passes client IP to backend
- **X-Forwarded-***: Headers for proxy awareness
- **Timeouts**: 60s for slow requests
- **Buffering**: Stores response in memory (8 × 4KB = 32KB)

---

### 8. Socket.io Configuration

```nginx
location /socket.io/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass         http://backend/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade $http_upgrade;
    proxy_set_header   Connection "upgrade";
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```

**Special Handling**:
- Extended timeouts (3600s = 1 hour) for persistent connections
- Upgrade headers for WebSocket protocol
- Rate limiting with burst handling
- Connection pooling for efficiency

---

### 9. SPA Routing (React Router)

```nginx
location / {
    limit_req zone=general_limit burst=50 nodelay;
    
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "public, max-age=3600" always;
}
```

**How it works**:
1. Request `/dashboard` → looks for `/dashboard` file
2. Not found → looks for `/dashboard/` directory
3. Not found → serves `/index.html` (SPA entry point)
4. React Router handles the path client-side

**Cache Control**: 1 hour for HTML (short cache for updates)

---

### 10. Static Asset Caching

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$ {
    expires 1y;
    add_header Cache-Control "public, immutable, max-age=31536000" always;
}
```

**Strategy**:
- Cache for 1 year (31,536,000 seconds)
- Vite adds content hash to filenames (e.g., `app-abc123.js`)
- New versions get new filenames automatically
- Browsers cache aggressively

---

### 11. Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

**Headers Explained**:

| Header | Purpose |
|--------|---------|
| `X-Frame-Options` | Prevents clickjacking (only same-site framing) |
| `X-Content-Type-Options` | Prevents MIME sniffing attacks |
| `X-XSS-Protection` | Enables browser XSS protection |
| `Referrer-Policy` | Controls referrer information leaking |
| `Permissions-Policy` | Restricts browser APIs (geo, microphone, camera) |

---

## Performance Optimization

### Current Optimizations

✅ **Gzip compression**: ~75% bandwidth reduction for text  
✅ **Static asset caching**: 1-year cache with content hashing  
✅ **Connection pooling**: 32 persistent connections upstream  
✅ **Proxy buffering**: 32KB memory buffer reduces roundtrips  
✅ **Rate limiting**: Prevents resource exhaustion  

### Recommended Production Improvements

```nginx
# Enable HTTP/2 for multiplexing (requires SSL)
listen 443 ssl http2;

# Enable caching module
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=cache:10m;

# Response caching
location /api/ {
    proxy_cache cache;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    proxy_cache_valid 200 1m;  # Cache successful responses for 1 minute
    add_header X-Cache-Status $upstream_cache_status;
}

# Real IP detection behind proxy
set_real_ip_from 10.0.0.0/8;

# Connection limit per IP
limit_conn addr 10;
```

---

## Security Features

### Current Security Implementation

✅ **Security headers**: Prevents common web attacks  
✅ **Rate limiting**: Prevents brute force and DDoS  
✅ **File upload limit**: 20MB max to prevent abuse  
✅ **Dotfile blocking**: Denies access to `.git`, `.env`, etc.  
✅ **Proxy headers**: Prevents header injection  

### Additional Security (For Production)

```nginx
# SSL/TLS configuration (if using HTTPS)
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;

# HSTS (force HTTPS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# CSP (Content Security Policy)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;

# CORS headers (if needed)
add_header Access-Control-Allow-Origin "*" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;

# Deny dangerous HTTP methods
if ($request_method !~ ^(GET|HEAD|POST|PUT|DELETE|OPTIONS)$) {
    return 405;
}
```

---

## Troubleshooting

### Issue: Backend Returns 502 Bad Gateway

**Cause**: Backend service unavailable

**Solution**:
```bash
# Docker mode
docker-compose logs backend

# Windows mode  
docker logs <backend-container-id>
```

**Check upstream**:
```nginx
# Docker: Make sure DNS name is correct
upstream backend { server backend:4001; }

# Windows: Make sure port is correct
upstream backend { server 127.0.0.1:4001; }
```

---

### Issue: WebSocket Connection Fails

**Cause**: Missing `Upgrade` headers

**Solution**: Verify socket.io location has:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_read_timeout 3600s;  # Long timeout for persistent connections
```

---

### Issue: Static Files Not Loading

**Cause**: Incorrect root path or caching

**Solutions**:

For Windows:
```nginx
root C:/nginx-1.29.3/nginx-1.29.3/html;
```

For Docker:
```nginx
# Static files served by frontend container
location ~* \.(js|css|png)$ {
    proxy_pass http://frontend;
}
```

Clear browser cache: `Ctrl+Shift+Delete`

---

### Issue: High CPU Usage

**Cause**: Too many worker processes or gzip level

**Solution**:
```nginx
worker_processes 1;  # Reduced from auto
gzip_comp_level 6;   # Reduced from 9 (5-6 optimal)
```

---

### Issue: Timeouts on API Calls

**Cause**: Backend too slow or connection drops

**Solution**:
```nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 120s;  # Increased for slow operations
```

---

## Deployment Options

### Option 1: Docker Mode (Current - Recommended)

```bash
# Start all services
docker-compose -f docker-compose.local.yml up -d

# Check Nginx
docker logs kvc-nginx-local

# Test
curl http://localhost/
curl http://localhost/api/health
```

**Pros**: ✅ Production-ready, ✅ Scalable, ✅ Consistent  
**Cons**: ❌ Requires Docker, ❌ More memory

---

### Option 2: Windows Nginx + Docker Backend

```bash
# 1. Start Docker backend
docker-compose -f docker-compose.local.yml up -d backend postgres redis

# 2. Start Windows Nginx
nginx.exe

# 3. Test
curl http://localhost/
curl http://localhost/api/health
```

**Pros**: ✅ Lightweight, ✅ Local debugging  
**Cons**: ❌ Mixed environment, ❌ Not production-ready

---

### Option 3: Production on AWS/Railway/etc

```yaml
# Use docker-compose.yml or Dockerfile
# Update nginx.conf with:
# - HTTPS/SSL certificates
# - Production domain
# - Advanced caching
```

---

## Monitoring & Logs

### Docker Mode Logs

```bash
# Nginx logs
docker-compose logs nginx

# Real-time logs
docker-compose logs -f nginx

# Backend logs
docker-compose logs -f backend

# All services
docker-compose logs -f
```

### Windows Mode Logs

```bash
# Error log
cat C:/nginx-1.29.3/nginx-1.29.3/logs/error.log

# Access log
cat C:/nginx-1.29.3/nginx-1.29.3/logs/access.log

# Reload config
nginx.exe -s reload

# Stop
nginx.exe -s stop
```

---

## Quick Commands

```bash
# Docker
kvc-start      # Start all services
kvc-stop       # Stop all services
kvc-test       # Test all services
kvc-logs       # View logs
kvc-restart    # Restart all

# Windows Nginx
nginx -v       # Version
nginx -t       # Test config
nginx -s reload # Reload config
nginx -s stop  # Stop server
```

---

## Summary

| Feature | Docker | Windows | Status |
|---------|--------|---------|--------|
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Both optimized |
| Security | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Both hardened |
| Scalability | ⭐⭐⭐⭐⭐ | ⭐⭐ | ✅ Docker recommended |
| Production | ✅ Ready | ⚠️ Partial | ✅ Use Docker for prod |
| Development | ✅ Ideal | ✅ Simpler | ✅ Both work |

---

**Last Updated**: December 6, 2025  
**Nginx Version**: 1.29.3  
**Configuration Version**: 1.0
