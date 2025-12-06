# 📋 ขั้นตอนที่ 4-5: เพิ่ม Database และ Environment Variables

**Visual Step-by-Step Guide - Railway.app**

---

## ✅ ขั้นตอนที่ 4: เพิ่ม PostgreSQL Database

### 4.1 ไปยัง Project Dashboard

หลังจากที่ Backend deploy สำเร็จแล้ว:

```
คุณจะเห็นหน้า Railway Dashboard
ที่มี Backend service ที่ทำงานอยู่
```

### 4.2 คลิกปุ่ม "New" (ปุ่มบวก +)

```
ที่ด้านบนของ Project Dashboard
มีปุ่ม "New" สีน้ำเงิน
→ คลิกปุ่มนี้
```

### 4.3 เลือก "Database"

```
จะแสดง menu:
  ☐ GitHub Repo
  ☐ Docker Image
  ☑ Database ← เลือกนี่
  ☐ Empty Service
```

### 4.4 เลือก "PostgreSQL"

```
จะแสดงเลือก database type:
  ☐ MySQL
  ☑ PostgreSQL ← เลือกนี่
  ☐ MongoDB
```

### 4.5 Railway สร้าง PostgreSQL อัตโนมัติ

```
✓ PostgreSQL service จะถูกสร้าง
✓ Database connections จะเตรียมพร้อม
✓ ใน Variables จะมี DATABASE_URL ปรากฏขึ้น
```

### 4.6 Copy DATABASE_URL

1. ไปที่ **PostgreSQL service**
2. คลิกแท็บ **"Variables"**
3. คุณจะเห็น:
   ```
   DATABASE_URL = postgresql://user:password@host:5432/dbname
   ```
4. **คลิกปุ่ม Copy** (ไอคอนสี่เหลี่ยม) ข้างๆ DATABASE_URL
5. **บันทึกค่านี้ไว้** - จะใช้ตอนตั้ง Backend variables

---

## ✅ ขั้นตอนที่ 5: ตั้ง Backend Environment Variables

### 5.1 ไปที่ Backend Service

1. ใน Project Dashboard
2. คลิกที่ **Backend service** (ที่ deploy ไปแล้ว)

### 5.2 ไปที่แท็บ "Variables"

```
คุณจะเห็นแท็บ:
  ☐ Overview
  ☑ Variables ← คลิกนี่
  ☐ Logs
  ☐ Settings
```

### 5.3 เพิ่ม Environment Variables

ในหน้า Variables จะมีช่องให้ใส่:

```
┌─────────────────────────────────────────┐
│ Raw Editor                              │
└─────────────────────────────────────────┘

หรือ

┌──────────────┬──────────────────────────┐
│ Variable     │ Value                    │
├──────────────┼──────────────────────────┤
│ NODE_ENV     │ production               │
├──────────────┼──────────────────────────┤
│ PORT         │ 4001                     │
└──────────────┴──────────────────────────┘
```

### 5.4 ใส่ตัวแปรแต่ละตัว

**วิธีที่ 1: ใส่ทีละบรรทัด (ง่าย)**

คลิก **"Add Variable"** แล้วใส่:

#### 1️⃣ NODE_ENV
```
Key:   NODE_ENV
Value: production
```
คลิก ✓ เพื่อบันทึก

#### 2️⃣ PORT
```
Key:   PORT
Value: 4001
```
คลิก ✓

#### 3️⃣ DATABASE_URL
```
Key:   DATABASE_URL
Value: (paste ที่ copy จากขั้นตอน 4.6)

ตัวอย่าง:
postgresql://postgres:mPxxxxxx@containers-us-west-xxx.railway.internal:5432/railway
```
คลิก ✓

#### 4️⃣ CORS_ORIGIN
```
Key:   CORS_ORIGIN
Value: *

(จะปรับให้เป็น Frontend URL ทีหลัง)
```
คลิก ✓

#### 5️⃣ JWT_ACCESS_SECRET
```
Key:   JWT_ACCESS_SECRET
Value: sk-access-super-secret-key-2025-kvc

(หรือค่าใดๆ ที่ยาว random)
```
คลิก ✓

#### 6️⃣ JWT_REFRESH_SECRET
```
Key:   JWT_REFRESH_SECRET
Value: sk-refresh-super-secret-key-2025-kvc

(หรือค่าใดๆ ที่ยาว random)
```
คลิก ✓

---

## 📊 ตัวอย่างภาพตัวแปร

```
┌────────────────────────────────────────────────────────────┐
│ Variables                                                  │
├──────────────────────┬──────────────────────────────────┤
│ NODE_ENV             │ production              [Copy]   │
├──────────────────────┼──────────────────────────────────┤
│ PORT                 │ 4001                    [Copy]   │
├──────────────────────┼──────────────────────────────────┤
│ DATABASE_URL         │ postgresql://postgres:m... [Copy]│
├──────────────────────┼──────────────────────────────────┤
│ CORS_ORIGIN          │ *                       [Copy]   │
├──────────────────────┼──────────────────────────────────┤
│ JWT_ACCESS_SECRET    │ sk-access-...           [Copy]   │
├──────────────────────┼──────────────────────────────────┤
│ JWT_REFRESH_SECRET   │ sk-refresh-...          [Copy]   │
└──────────────────────┴──────────────────────────────────┘

[Add Variable] [Raw Editor]
```

---

## ✅ ยืนยันว่าตั้งเสร็จแล้ว

หลังจากใส่ทุกตัวแปร:

1. **Railway จะ auto-restart** Backend service
2. ดูที่ **Status** ว่ากลับมา **Running** หรือไม่
3. คลิกแท็บ **"Logs"** เพื่อดูว่า error เกิดขึ้นหรือไม่

✓ ถ้า Status = **Running** → สำเร็จ! ✓
✗ ถ้า Status = **Crashed** → ดู Logs หาปัญหา

---

## 🎯 สรุป ขั้นตอนที่ 4-5

```
ขั้นตอนที่ 4:
  ✓ คลิก "New" → "Database" → "PostgreSQL"
  ✓ Copy DATABASE_URL จาก PostgreSQL service

ขั้นตอนที่ 5:
  ✓ ไปที่ Backend service → Variables
  ✓ เพิ่ม 6 ตัวแปร (NODE_ENV, PORT, DATABASE_URL, ...)
  ✓ รอให้ Backend restart
  ✓ ตรวจสอบ Status = Running
```

---

## 📝 Checklist - ทำครบไหม?

- [ ] PostgreSQL service สร้างขึ้นแล้ว
- [ ] Copy DATABASE_URL สำเร็จ
- [ ] Backend service ไปยัง Variables tab
- [ ] ใส่ NODE_ENV = production ✓
- [ ] ใส่ PORT = 4001 ✓
- [ ] ใส่ DATABASE_URL ✓
- [ ] ใส่ CORS_ORIGIN = * ✓
- [ ] ใส่ JWT_ACCESS_SECRET ✓
- [ ] ใส่ JWT_REFRESH_SECRET ✓
- [ ] Backend Status = Running ✓

ถ้าครบทั้งหมด → พร้อมไป **ขั้นตอนที่ 6: เพิ่ม Frontend Image**

---

## ⚠️ Troubleshooting

### ❌ DATABASE_URL ไม่ปรากฏ

**ทำยังไง:**
1. ตรวจสอบว่า PostgreSQL service ถูกสร้างแล้ว
2. ไปที่ PostgreSQL service → Variables tab
3. ถ้าเห็น DATABASE_URL → copy ใหม่

### ❌ Backend Status = Crashed

**ทำยังไง:**
1. ไปที่ Backend → Logs tab
2. ดูข้อความ error ล่าสุด
3. ปัญหาที่พบบ่อย:
   - DATABASE_URL ผิด → copy ใหม่
   - PORT ไม่ใช่ 4001 → แก้เป็น 4001
   - JWT_SECRET ว่าง → ใส่ค่า

### ❌ ไม่สามารถ Add Variable

**ทำยังไง:**
1. Refresh หน้า (Ctrl+R)
2. ลองใหม่
3. ใช้ "Raw Editor" แทนการ Add ทีละตัว

---

**ต่อไป:** ขั้นตอนที่ 6 - เพิ่ม Frontend Image
