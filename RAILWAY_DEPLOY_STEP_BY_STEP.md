# 🚀 วิธีการ Deploy บน Railway - ขั้นตอนละเอียด

**ภาษาไทย - Step by Step Guide**

---

## 🎯 ตอนนี้คุณมี Images 2 อัน พร้อมใช้งาน:

```
✓ Backend:  ratthaphongsar/kvc-backend:latest
✓ Frontend: ratthaphongsar/kvc-frontend:latest
```

---

## ✅ ขั้นตอนที่ 1: ไปที่ Railway.app

1. เปิด **https://railway.app**
2. คลิก **"Sign up"** (ใช้ GitHub account)
3. Authorize Railway ให้เข้าถึง GitHub
4. จะเข้าไปยัง Dashboard

---

## ✅ ขั้นตอนที่ 2: สร้าง New Project

1. ที่ Dashboard คลิก **"New Project"** (ปุ่มสีน้ำเงิน)
2. เลือก **"Deploy from Docker Image"**

---

## ✅ ขั้นตอนที่ 3: ใส่ Docker Image สำหรับ Backend

### ฟอร์มจะแสดง "Docker Image" ที่ว่างเปล่า

ให้ **ลบ placeholder text แล้วใส่:**

```
ratthaphongsar/kvc-backend:latest
```

⚠️ ตรวจสอบให้แน่ใจ:
- ✓ Username: `ratthaphongsar`
- ✓ Repository: `kvc-backend`
- ✓ Tag: `latest`
- ✓ **ไม่มี `http://` หรือ `https://` นำหน้า**

### หลังจาก Deploy Backend

1. Railway จะเริ่มสร้าง container
2. เมื่อเสร็จ จะมี URL แบบนี้:
   ```
   https://kvc-backend-prod-xxx.railway.app
   ```
3. **บันทึก URL นี้ไว้** - จะใช้ต่อไป

---

## ✅ ขั้นตอนที่ 4: เพิ่มฐานข้อมูล PostgreSQL

1. ใน Project Dashboard คลิก **"New"** (ปุ่มบวก)
2. เลือก **"Database"** → **"PostgreSQL"**
3. Railway จะสร้าง Database อัตโนมัติ
4. ไปยัง Variables/Environment tab
5. **Copy** ค่า `DATABASE_URL` ที่ Railway สร้าง

---

## ✅ ขั้นตอนที่ 5: ตั้ง Environment Variables สำหรับ Backend

1. ใน Backend Service คลิก **"Variables"**
2. เพิ่มตัวแปรต่อไปนี้:

| Key | Value | หมายเหตุ |
|-----|-------|---------|
| `NODE_ENV` | `production` | ตั้งค่า environment |
| `PORT` | `4001` | Backend port |
| `DATABASE_URL` | (paste จาก PostgreSQL) | Database connection string |
| `CORS_ORIGIN` | `*` | (จะปรับเมื่อ deploy frontend) |
| `JWT_ACCESS_SECRET` | `your-secret-key-here` | สร้าง random string |
| `JWT_REFRESH_SECRET` | `your-refresh-key` | สร้าง random string |

### ✓ ทำให้ Backend ใช้ port 4001:

ใน Backend service ให้:
1. ไปที่ **Settings** → **Port**
2. ตั้ง **External Port: 4001**

---

## ✅ ขั้นตอนที่ 6: ใส่ Docker Image สำหรับ Frontend

1. ใน Project คลิก **"New"** เพิ่มเติม
2. เลือก **"Deploy from Docker Image"**
3. ใส่:

```
ratthaphongsar/kvc-frontend:latest
```

### ตั้ง Port สำหรับ Frontend:

1. ไปที่ **Settings** → **Port**
2. ตั้ง **External Port: 3000**

---

## ✅ ขั้นตอนที่ 7: ตั้ง Environment Variables สำหรับ Frontend

1. ใน Frontend Service คลิก **"Variables"**
2. เพิ่มตัวแปร:

| Key | Value | หมายเหตุ |
|-----|-------|---------|
| `VITE_BACKEND_URL` | `https://kvc-backend-prod-xxx.railway.app` | Backend URL ที่ copy มา |
| `VITE_API_BASE` | `https://kvc-backend-prod-xxx.railway.app/api` | API endpoint |

---

## ✅ ขั้นตอนที่ 8: Update Backend CORS_ORIGIN

กลับไปที่ Backend Service:

1. คลิก **"Variables"**
2. หา `CORS_ORIGIN`
3. เปลี่ยนจาก `*` เป็น:

```
https://kvc-frontend-prod-yyy.railway.app
```

(เปลี่ยน `yyy` เป็น Frontend URL จริง)

---

## 📋 สรุป Environment Variables

### Backend:
```
NODE_ENV=production
PORT=4001
DATABASE_URL=postgresql://user:pass@host:5432/db
CORS_ORIGIN=https://kvc-frontend-prod-xxx.railway.app
JWT_ACCESS_SECRET=random-secret-key
JWT_REFRESH_SECRET=random-refresh-key
```

### Frontend:
```
VITE_BACKEND_URL=https://kvc-backend-prod-xxx.railway.app
VITE_API_BASE=https://kvc-backend-prod-xxx.railway.app/api
```

---

## ✅ ขั้นตอนที่ 9: ทดสอบการ Deploy

### 1. ตรวจสอบ Logs

ใน Railway Dashboard:
1. เลือก Service (Backend หรือ Frontend)
2. คลิก **"Logs"**
3. ตรวจหา errors

**สำเร็จ = ไม่มี error messages**

### 2. ทดสอบ Backend API

เปิด URL ของ Backend:
```
https://kvc-backend-prod-xxx.railway.app/api
```

ควรได้ response (ไม่ใช่ 404 error)

### 3. ทดสอบ Frontend

เปิด URL ของ Frontend:
```
https://kvc-frontend-prod-yyy.railway.app
```

ควรเห็น:
- ✓ หน้าเว็บโหลดได้
- ✓ ไม่มี blank page
- ✓ ไม่มี error ใน Console (F12)

### 4. ทดสอบ API Connection

ใน Frontend:
1. เปิด DevTools (F12)
2. ไปที่ **Network** tab
3. ลองใช้งานแอป (login, submit form เป็นต้น)
4. ตรวจสอบ API requests ว่าเชื่อมต่อกับ backend ได้

---

## 🐛 Troubleshooting

### ❌ Frontend shows blank page

**ตรวจสอบ:**
- VITE_BACKEND_URL ตั้งถูกหรือไม่?
- Backend URL สิ้นสุดด้วย `/api` หรือไม่?
- Backend service running หรือไม่? (ดู logs)

**แก้:** Update environment variables แล้วรอให้ restart

### ❌ API returns 500 error

**ตรวจสอบ:**
- DATABASE_URL ถูกต้องหรือไม่?
- PostgreSQL service running หรือไม่?

**แก้:** ดูใน Backend logs ว่า error อะไร

### ❌ Cannot connect to database

**ตรวจสอบ:**
- DATABASE_URL ถูก copy มาจาก Railway PostgreSQL หรือไม่?

**แก้:** Delete DATABASE_URL variable แล้ว add ใหม่จากโอเคเค PostgreSQL service

### ❌ CORS error

**ตรวจสอบ:**
- CORS_ORIGIN ตั้งเป็น Frontend URL หรือไม่?

**แก้:** อัปเดต Backend CORS_ORIGIN เป็น Frontend URL ที่ถูก

---

## 🎯 เสร็จสิ้น!

เมื่อทั้งหมดเสร็จแล้ว:

✅ Frontend accessible ที่ `https://kvc-frontend-prod-xxx.railway.app`
✅ Backend accessible ที่ `https://kvc-backend-prod-xxx.railway.app`
✅ Database connected และ running
✅ Environment variables set correctly
✅ การใช้งาน API ทำงานปกติ

---

## 💡 บันทึกเพิ่มเติม

- **ค่าใช้สอย:** Railway ให้ $5/month credit ฟรี (เพียงพอสำหรับ development)
- **Logs:** ใน Railway Dashboard สามารถเห็น real-time logs ของแต่ละ service
- **Scaling:** ถ้าต้องการความเร็ว คลิก Service → Settings → Scale ขึ้น
- **Custom Domain:** Railway รองรับการ connect custom domain

---

**ต้องการช่วยตรงไหนอีกหรือไม่?** 👇
