# Railway Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Code pushed to GitHub branch `meeting-schedule-system`
- [x] `railway.json` config created
- [x] `.railwayignore` created
- [x] `docker-compose.yml` ready
- [x] Dockerfiles for backend & frontend exist
- [ ] GitHub repo connected to Railway

---

## 🚀 Step-by-Step Deployment

### **Step 1: Sign Up to Railway**

1. Go to https://railway.app
2. Click **"Start for free"**
3. Sign in with **GitHub**
4. Authorize Railway to access your repos

---

### **Step 2: Create New Project**

1. Click **"New Project"**
2. Select **"Deploy from GitHub"**
3. Search for `kscv-flow-dev-proj`
4. Select **`meeting-schedule-system`** branch
5. Click **"Deploy"**

Railway will:
- ✅ Detect `docker-compose.yml`
- ✅ Build Docker images
- ✅ Deploy services
- ✅ Generate public URLs

---

### **Step 3: Configure Services**

#### **Service 1: PostgreSQL**
- Railway auto-provisions this
- Environment variables auto-set:
  - `DATABASE_URL` 
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`

#### **Service 2: Backend**
- Runs on **internal:4001**
- Environment variables needed:
  ```
  NODE_ENV=production
  CORS_ORIGIN=*
  JWT_ACCESS_SECRET=your-secret-key
  JWT_REFRESH_SECRET=your-secret-key
  OPENAI_API_KEY=sk-***
  ```

#### **Service 3: Frontend**
- Runs on **public:3000**
- Proxy to backend via environment:
  ```
  VITE_BACKEND_URL=https://[backend-url].railway.app
  ```

---

### **Step 4: Set Environment Variables**

In Railway Dashboard:

1. Go to **Backend Service** → **Variables**
2. Add:
   ```
   NODE_ENV=production
   PORT=4001
   CORS_ORIGIN=*
   ```

3. Go to **Frontend Service** → **Variables**
4. Add:
   ```
   VITE_BACKEND_URL=https://[auto-generated-backend-url].railway.app
   ```

---

### **Step 5: Monitor Deployment**

1. Go to **Deployments** tab
2. Watch for:
   - ✅ Build logs (should show "Built successfully")
   - ✅ Service health (all green)
   - ✅ Running status

3. Get your public URLs:
   - Frontend: `https://[project]-frontend-[random].railway.app`
   - Backend: `https://[project]-backend-[random].railway.app` (internal)

---

## 🔗 Access Your Deployed App

After successful deployment:

- **Frontend:** Open `https://[frontend-url].railway.app` in browser
- **Backend API:** Available at `https://[backend-url].railway.app`

---

## 🔄 Continuous Deployment

### **Auto-Deploy on Git Push**

Railway automatically redeploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "feat: your change"
git push origin meeting-schedule-system

# Railway detects push → rebuilds & redeploys (2-5 minutes)
```

### **Manual Redeploy**

If needed, in Railway Dashboard:
1. Go to **Deployments**
2. Click **"Redeploy"** on latest deployment

---

## 🚨 Troubleshooting

### **Build fails with npm errors**

**Solution:**
```bash
# Locally verify build works
npm run build
npm run dev

# Then push to GitHub
git push
```

### **Frontend can't reach backend**

**Issue:** `VITE_BACKEND_URL` is wrong

**Solution:**
1. Get correct backend URL from Railway dashboard
2. Update Frontend service variables:
   ```
   VITE_BACKEND_URL=https://[exact-backend-url]
   ```
3. Redeploy frontend

### **Database migrations failing**

**Issue:** PostgreSQL not initialized

**Solution:**
1. SSH into Railway service
2. Run manually:
   ```bash
   npm run migrate
   npm run seed
   ```

### **Port conflicts**

Railway handles port mapping automatically. Don't worry about this.

---

## 📊 Monitoring

In Railway Dashboard:

1. **Logs** tab - View real-time logs
2. **Metrics** tab - CPU, memory, network usage
3. **Network** tab - View public URLs & exposed ports

---

## 💰 Costs

**Free tier includes:**
- ✅ $5/month free credits
- ✅ Shared CPU & RAM
- ✅ Unlimited deployments
- ✅ PostgreSQL & Redis

**Paid tier (if needed):**
- Dedicated resources
- More storage

---

## 🔐 Security Notes

1. **Never commit secrets** - Use Railway environment variables
2. **CORS_ORIGIN** - Set to specific domain in production:
   ```
   CORS_ORIGIN=https://[your-frontend-url]
   ```
3. **Database passwords** - Railway auto-generates strong ones

---

## ✨ After Deployment

1. ✅ Test frontend at public URL
2. ✅ Check API endpoints respond
3. ✅ Verify WebSocket connection (chat)
4. ✅ Test login/authentication
5. ✅ Check database queries work

---

## 📞 Support

- Railway Docs: https://docs.railway.app
- Chat support available in Railway dashboard
- Community: https://railway.app/community

---

**Status:** ✅ Ready to Deploy
**Last Updated:** December 6, 2025
