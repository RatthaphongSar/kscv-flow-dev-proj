# 🚀 Cloudflare Integration Guide for KVC WebApp

**Date**: December 6, 2025  
**Domain**: kvc.cf (Cloudflare Nameserver)  
**Status**: Setup Instructions

---

## 📋 Table of Contents

1. [Cloudflare vs Direct DNS](#cloudflare-vs-direct-dns)
2. [Proxy Setup (Recommended)](#proxy-setup-recommended)
3. [DNS Only Setup](#dns-only-setup)
4. [WebSocket Configuration](#websocket-configuration)
5. [SSL/TLS Setup](#ssltls-setup)
6. [CDN & Cache Settings](#cdn--cache-settings)
7. [Firewall & Rate Limiting](#firewall--rate-limiting)
8. [Performance Tuning](#performance-tuning)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Troubleshooting](#troubleshooting)

---

## 🔄 Cloudflare vs Direct DNS

### Proxy Enabled (Recommended) ✅

```
User Request
    ↓
Cloudflare Proxy (HTTPS)
    ↓
Hidden IP Server
    ↓
KVC WebApp
```

**Benefits**:
- ✅ SSL/TLS automatically managed (free)
- ✅ IP address hidden from public
- ✅ DDoS protection included
- ✅ Global CDN for faster delivery
- ✅ Firewall & rate limiting
- ✅ WebSocket fully supported
- ✅ Automatic HTTPS redirect
- ✅ Browser cache enabled
- ✅ Gzip compression
- ✅ Rocket Loader (JavaScript optimization)

**Settings**: Orange Cloud (Proxied)

---

### DNS Only (Not Recommended) ❌

```
User Request
    ↓
Direct to IP Address
    ↓
KVC WebApp (No Protection)
```

**Limitations**:
- ❌ Must manually manage SSL certificates
- ❌ IP address exposed to attackers
- ❌ No built-in DDoS protection
- ❌ No CDN caching
- ❌ WebSocket requires manual port opening
- ❌ No automatic security features
- ❌ Higher server load
- ❌ Slower content delivery

**Settings**: Gray Cloud (DNS Only)

---

## ✅ Proxy Setup (Recommended)

### Step 1: Transfer Domain to Cloudflare

#### Option A: Transfer Existing Domain

```bash
# If domain is registered elsewhere (GoDaddy, Namecheap, etc.)
1. Go to Cloudflare Dashboard
2. Click "+ Add Site"
3. Enter domain: kvc.cf
4. Select plan: Free (includes everything we need)
5. Copy Cloudflare Nameservers:
   - ns1.cloudflare.com
   - ns2.cloudflare.com
   - (or specific nameservers shown)
```

#### In Your Domain Registrar:
```
Update Nameservers to:
  ns1.cloudflare.com
  ns2.cloudflare.com
  ns3.cloudflare.com
  ns4.cloudflare.com
```

**Wait**: DNS propagation (5 minutes to 24 hours)

#### Option B: Register Domain with Cloudflare

```
1. Cloudflare Dashboard → Registrar
2. Search for kvc.cf
3. Add to cart & register
4. Automatic integration complete
```

---

### Step 2: Configure DNS Records (Proxied)

#### In Cloudflare Dashboard:
```
DNS → Records → Add Record
```

**Add These Records** (with Orange Cloud = Proxied):

| Type | Name | Content | TTL | Proxy Status |
|------|------|---------|-----|--------------|
| A | kvc.cf | YOUR.SERVER.IP | Auto | 🟠 Proxied |
| A | www | YOUR.SERVER.IP | Auto | 🟠 Proxied |
| CNAME | api | kvc.cf | Auto | 🟠 Proxied |
| CNAME | mail | YOUR.EMAIL.HOST | Auto | 🔘 DNS Only |

**Example with IP 192.168.1.100**:
```
kvc.cf        A     192.168.1.100    Proxied (Orange)
www           CNAME kvc.cf           Proxied (Orange)
api           CNAME kvc.cf           Proxied (Orange)
```

✅ **Result**: Orange cloud icon = Proxied through Cloudflare

---

### Step 3: Configure SSL/TLS

#### In Cloudflare:
```
SSL/TLS → Overview → Encryption Mode
```

**Select**: Full (Strict) - RECOMMENDED

```
Full (Strict) Setup:
1. Generate SSL Certificate on Server
2. Configure Nginx to use certificate
3. Cloudflare verifies server certificate
4. End-to-end encryption
```

**Alternative**: Full (not strict)
```
- Use self-signed certificate on server
- Less secure but faster to setup
```

---

### Step 4: Enable HTTP to HTTPS Redirect

#### In Cloudflare:
```
SSL/TLS → Edge Certificates
```

Enable:
- ✅ Always Use HTTPS
- ✅ Automatic HTTPS Rewrites
- ✅ Opportunistic Encryption

**Result**: http://kvc.cf → https://kvc.cf (automatic)

---

### Step 5: Configure Nginx for Cloudflare

#### Update `nginx.conf`:

```nginx
# Accept connections from Cloudflare
server {
    listen 80;
    listen 443 ssl http2;
    server_name kvc.cf www.kvc.cf api.kvc.cf;

    # SSL Certificates (generated on server)
    ssl_certificate /path/to/certs/server.crt;
    ssl_certificate_key /path/to/certs/server.key;

    # Cloudflare SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Accept Cloudflare IPs
    # (Cloudflare will handle HTTPS from client)
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2a06:98c0::/29;
    set_real_ip_from 2c0f:f248::/32;
    real_ip_header CF-Connecting-IP;

    # Upstream services
    upstream backend {
        server localhost:4001;
        keepalive 32;
    }

    upstream frontend {
        server localhost:3000;
        keepalive 32;
    }

    # API requests → Backend
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files → Frontend
    location ~ \.(js|css|png|jpg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend;
        proxy_cache_valid 200 30d;
        proxy_cache_bypass $http_pragma $http_authorization;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }

    # Default → Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔌 WebSocket Configuration

### Enable WebSocket in Cloudflare

#### Cloudflare Dashboard:
```
Network → WebSockets: ENABLED (Free Plan)
```

### Backend Configuration (Node.js + Socket.io)

```javascript
// backend/src/server.js
const io = require('socket.io')(server, {
    cors: {
        origin: "https://kvc.cf",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'], // WebSocket first
    upgrade: false, // Force WebSocket (don't fall back to polling)
    pingInterval: 25000,
    pingTimeout: 60000,
});

// Cloudflare headers
app.use((req, res, next) => {
    req.ip = req.headers['cf-connecting-ip'] || req.ip;
    next();
});
```

### Frontend Configuration (React)

```javascript
// frontend/src/services/socket.js
import io from 'socket.io-client';

const socket = io('https://kvc.cf', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
});

export default socket;
```

### Nginx WebSocket Headers

```nginx
location /socket.io {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    
    # WebSocket upgrade
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # Cloudflare compatibility
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;
    
    # Timeouts for long-lived connections
    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
}
```

---

## 🔒 SSL/TLS Setup

### Option A: Full (Strict) - RECOMMENDED

#### Step 1: Generate Server Certificate

```bash
# On your server, generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout /certs/server.key \
  -out /certs/server.crt -days 365 -nodes \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=KVC/CN=kvc.cf"
```

#### Step 2: Configure Nginx

```nginx
ssl_certificate /certs/server.crt;
ssl_certificate_key /certs/server.key;
```

#### Step 3: Cloudflare SSL/TLS Setting

```
SSL/TLS → Overview → Encryption Mode
Select: Full (Strict)
```

**Flow**:
```
Client (HTTPS)
    ↓
Cloudflare (HTTPS)
    ↓
Server (HTTPS with self-signed cert)
```

---

### Option B: Full (Not Strict)

```
SSL/TLS → Encryption Mode → Full (not strict)

Allows self-signed certs on server
Slightly less secure but easier setup
```

---

### Option C: Flexible (Not Recommended)

```
SSL/TLS → Encryption Mode → Flexible

Client → Cloudflare (HTTPS)
Cloudflare → Server (HTTP only)

Security risk! Don't use for sensitive data.
```

---

## 🚀 CDN & Cache Settings

### Enable Caching

#### Cloudflare Dashboard:
```
Caching → Cache Level: Cache Everything
```

### Cache Rules by File Type

```
Static Files (images, CSS, JS):
  Cache TTL: 30 days
  
API Responses:
  Cache TTL: 5 minutes (or disable)
  
HTML Pages:
  Cache TTL: 1 hour
```

#### Create Cache Rule in Cloudflare:

```
Caching → Cache Rules → Create Rule

Rule 1: Static Assets
  Path matches: (\.js|\.css|\.png|\.jpg|\.gif|\.ico)$
  Cache Level: Cache Everything
  Browser Cache TTL: 1 month

Rule 2: API (No Cache)
  Path matches: /api/*
  Cache Level: Bypass
  
Rule 3: WebSocket (No Cache)
  Path matches: /socket.io/*
  Cache Level: Bypass
```

### Purge Cache

```bash
# Purge all cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "X-Auth-Email: your-email@example.com" \
  -H "X-Auth-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'

# Purge specific files
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "X-Auth-Email: your-email@example.com" \
  -H "X-Auth-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"files":["https://kvc.cf/index.html"]}'
```

---

## 🛡️ Firewall & Rate Limiting

### Enable WAF (Web Application Firewall)

#### Cloudflare Dashboard:
```
Security → WAF → Enable OWASP Rule Set
```

### Rate Limiting

#### Create Rate Limit Rules:

```
Security → Rate Limiting → Create Rule

Rule 1: API Rate Limit
  Request Path contains: /api
  Rate: 120 requests per 10 seconds
  Action: Challenge
  
Rule 2: Login Attempts
  Request Path: /api/auth/login
  Rate: 5 requests per minute
  Action: Block
  
Rule 3: File Upload
  Request Path: /api/upload
  Rate: 10 requests per minute
  Action: Block
```

### Firewall Rules

```
Security → Firewall Rules → Create Rule

Rule 1: Block Suspicious Bots
  Expression: (cf.bot_management.score < 30)
  Action: Block
  
Rule 2: Block High Threat
  Expression: (cf.threat_score > 50)
  Action: Challenge
  
Rule 3: Allow Known Good
  Expression: (cf.country in {"TH"} and cf.threat_score < 10)
  Action: Allow
```

### DDoS Protection

```
Security → DDoS Protection → Standard (Enabled)
  Sensitivity: High
  
Cloudflare automatically mitigates:
  - Layer 7 DDoS
  - Bot attacks
  - Malicious traffic
```

---

## ⚡ Performance Tuning

### Image Optimization

#### Cloudflare Dashboard:
```
Speed → Optimization → Image Optimization
```

Enable:
- ✅ Polish (WebP conversion)
- ✅ Mirage (image acceleration)
- ✅ Lazy loading

### JavaScript Optimization

```
Speed → Optimization
  ✅ Rocket Loader (YES)
  ✅ Minify CSS (YES)
  ✅ Minify JavaScript (YES)
  ✅ Minify HTML (YES)
```

### HTTP/2 & HTTP/3

```
Network → HTTP/2 → ENABLED
Network → HTTP/3 → ENABLED
```

### Brotli Compression

```
Speed → Optimization
  ✅ Brotli Compression (YES)
```

---

## 📊 Monitoring & Analytics

### View Performance Metrics

#### Cloudflare Dashboard:
```
Analytics & Logs → Overview

Shows:
  - Requests/day
  - Bandwidth saved by cache
  - Threats blocked
  - Page load time
  - Uptime
```

### Monitor Backend Health

```javascript
// Create health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

#### Cloudflare Health Check:

```
Reliability → Health Checks → Create

Endpoint: https://kvc.cf/api/health
Type: HTTP
Interval: 60 seconds
Timeout: 5 seconds
Retries: 2
```

### Enable Page Rules for Monitoring

```
Page Rules → Create Rule

Rule: https://kvc.cf/api/*
  Cache Level: Bypass
  Browser Integrity Check: OFF (for API)
  
Rule: https://kvc.cf/*
  Browser Cache TTL: 30 minutes
```

---

## 🔧 Troubleshooting

### Issue 1: SSL Certificate Mismatch

**Error**: `SSL: CERTIFICATE_VERIFY_FAILED`

**Solution**:
```bash
# Regenerate certificate
openssl req -x509 -newkey rsa:4096 \
  -keyout /certs/server.key \
  -out /certs/server.crt \
  -days 365 -nodes \
  -subj "/CN=kvc.cf"

# Restart Nginx
nginx -s reload
```

Change Cloudflare setting:
```
SSL/TLS → Full (not strict)
```

---

### Issue 2: WebSocket Connection Fails

**Error**: `WebSocket handshake failed`

**Solution**:

```
1. Verify Cloudflare Network settings:
   Network → WebSockets: ENABLED
   
2. Check Nginx WebSocket headers:
   Proxy headers must include:
     Upgrade: websocket
     Connection: upgrade
     
3. Check firewall rules:
   Don't block WebSocket traffic
   
4. Verify backend is receiving connections:
   netstat -an | grep ESTABLISHED
```

---

### Issue 3: High Latency

**Cause**: Cloudflare proxy adding delay

**Solution**:

```
1. Enable Argo Smart Routing (Paid):
   Speed → Argo Smart Routing
   
2. Use closest Cloudflare datacenter:
   Check Analytics → requests by colo
   
3. Enable page cache:
   Caching → Cache Level: Cache Everything
   
4. Reduce origin load:
   Enable Polish, Minify, Compression
```

---

### Issue 4: CORS Issues with Cloudflare

**Error**: `No 'Access-Control-Allow-Origin' header`

**Solution**:

Add header in Nginx:
```nginx
location /api {
    add_header 'Access-Control-Allow-Origin' 'https://kvc.cf';
    add_header 'Access-Control-Allow-Credentials' 'true';
    
    proxy_pass http://backend;
}
```

---

### Issue 5: Cache Not Working

**Error**: Pages not being cached

**Solution**:

```
1. Check Cloudflare cache status:
   View page source → Look for:
   cf-cache-status: HIT (cached)
   cf-cache-status: MISS (not cached)
   
2. Verify cache rules:
   Caching → Cache Rules → Review all rules
   
3. Check browser cache headers:
   Backend must send correct headers
   
3. Purge cache if recently changed:
   Caching → Purge Cache → Purge All
```

---

## 📋 Complete Deployment Checklist

### Pre-Deployment

- [ ] Domain registered (kvc.cf)
- [ ] Nameservers updated to Cloudflare
- [ ] DNS propagation verified
- [ ] SSL certificates generated
- [ ] Nginx configured with Cloudflare IPs
- [ ] Backend WebSocket support enabled
- [ ] Frontend Socket.io client configured

### Cloudflare Configuration

- [ ] DNS records created (A records proxied)
- [ ] SSL/TLS set to Full (Strict)
- [ ] HTTPS redirect enabled
- [ ] WebSocket enabled in Network settings
- [ ] Cache rules configured
- [ ] WAF and rate limiting enabled
- [ ] DDoS protection active
- [ ] Page rules created

### Testing

- [ ] https://kvc.cf loads successfully
- [ ] WebSocket connects (chat working)
- [ ] API responses working
- [ ] Cache status showing HIT
- [ ] No SSL certificate errors
- [ ] Rate limiting working
- [ ] CDN serving content
- [ ] Performance metrics good

### Post-Deployment

- [ ] Monitor Analytics dashboard
- [ ] Check firewall logs
- [ ] Monitor uptime
- [ ] Verify backup to real IP working
- [ ] Test rollback procedure
- [ ] Document all settings

---

## 🎯 Summary: Proxy vs DNS Only

| Feature | Proxy (Recommended) | DNS Only |
|---------|-------------------|----------|
| SSL/TLS | ✅ Free, Auto | ❌ Manual |
| IP Hidden | ✅ Yes | ❌ Exposed |
| CDN | ✅ Global | ❌ No |
| Firewall | ✅ Free | ❌ No |
| Rate Limit | ✅ Free | ❌ Manual |
| DDoS | ✅ Protected | ❌ Vulnerable |
| WebSocket | ✅ Supported | ⚠️ Manual |
| Setup Time | ~30 mins | ~1 hour |
| Cost | Free | Free |

---

## 🚀 Final Setup Summary

```
1. Transfer Domain to Cloudflare
   └─ kvc.cf → Cloudflare Nameservers

2. Enable Proxy (Orange Cloud)
   └─ DNS records proxied through Cloudflare

3. Configure SSL/TLS
   └─ Full (Strict) with self-signed cert on server

4. Setup WebSocket Support
   └─ Enable in Cloudflare + Configure Nginx

5. Enable Cache & CDN
   └─ Cache Rules + Polish + Rocket Loader

6. Configure Security
   └─ WAF + Rate Limiting + Firewall Rules

7. Deploy & Monitor
   └─ Test all features + Monitor analytics
```

---

## 📞 Support Resources

- **Cloudflare Docs**: https://developers.cloudflare.com
- **Nginx Cloudflare**: https://support.cloudflare.com/hc/en-us/articles/200169156
- **Socket.io Cloudflare**: https://socket.io/docs/v4/socket-io-behind-a-reverse-proxy/
- **SSL Testing**: https://www.sslshopper.com/ssl-checker.html

---

**Status**: ✅ Ready to Configure Cloudflare  
**Estimated Time**: 30-60 minutes  
**Next Step**: Follow Step 1-7 above  

**🌍 Your KVC WebApp will be live on https://kvc.cf with enterprise-grade security & performance!**
