# 🔥 Firebase Console Setup - Email Authentication

## ⚠️ **สำคัญ! ต้องทำก่อนทดสอบ**

กรุณาทำตามขั้นตอนนี้ใน Firebase Console เพื่อเปิดใช้งาน Email Authentication:

---

## 📝 ขั้นตอนการตั้งค่า

### 1️⃣ เปิด Firebase Console

```
https://console.firebase.google.com/project/ecertonline-29a67/authentication/providers
```

หรือ:
1. ไปที่ https://console.firebase.google.com/
2. เลือก Project: **ecertonline-29a67**
3. คลิก **Authentication** (เมนูซ้าย)
4. คลิกแท็บ **Sign-in method**

---

### 2️⃣ เปิดใช้งาน Email/Password

1. ในหน้า **Sign-in method**
2. หา **Email/Password** ในรายการ
3. คลิกที่ **Email/Password**
4. เปิด toggle **Enable** (ให้เป็นสีเขียว)
5. ✅ **เปิดใช้งาน "Email/Password"**
6. ✅ **เปิดใช้งาน "Email link (passwordless sign-in)"** ด้วย
7. คลิก **Save**

**ภาพประกอบ**:
```
┌─────────────────────────────────────┐
│ Email/Password                      │
├─────────────────────────────────────┤
│ ☑ Enable                            │
│   Email/Password                    │
│                                     │
│ ☑ Email link                        │
│   (passwordless sign-in)            │
│                                     │
│ [Cancel]  [Save]                    │
└─────────────────────────────────────┘
```

---

### 3️⃣ ตรวจสอบ Authorized Domains

1. ในหน้า **Authentication**
2. คลิกแท็บ **Settings**
3. เลื่อนลงไปที่ **Authorized domains**
4. ตรวจสอบว่ามี domain เหล่านี้:
   - ✅ `localhost`
   - ✅ `ecertonline-29a67.web.app`
   - ✅ `ecertonline-29a67.firebaseapp.com`

**ถ้าไม่มี**:
- คลิก **Add domain**
- กรอก domain ที่ขาด
- คลิก **Add**

---

### 4️⃣ (Optional) Customize Email Template

1. ในหน้า **Authentication**
2. คลิกแท็บ **Templates**
3. เลือก **Email link sign-in**
4. แก้ไข:
   - **Sender name**: `ระบบจัดการเอกสาร`
   - **Subject**: `🔗 Link สำหรับเข้าสู่ระบบ`
   - **Email body**: (แก้ไขตามต้องการ)
5. คลิก **Save**

---

## ✅ ตรวจสอบว่าตั้งค่าสำเร็จ

หลังจากตั้งค่าเสร็จ ควรเห็น:

### ในหน้า Sign-in method:
```
Provider              Status
────────────────────  ────────
Google                ✅ Enabled
Phone                 ✅ Enabled
Email/Password        ✅ Enabled  ← ใหม่!
```

### ในหน้า Settings → Authorized domains:
```
Domain
──────────────────────────────────
localhost
ecertonline-29a67.web.app
ecertonline-29a67.firebaseapp.com
```

---

## 🧪 ทดสอบระบบ

หลังจากตั้งค่าเสร็จแล้ว ให้ทดสอบ:

### Test 1: Email/Password Login

1. เปิด: https://ecertonline-29a67.web.app
2. คลิกแท็บ **Email/Password**
3. คลิก "สมัครสมาชิก"
4. กรอก:
   - Email: `test@example.com`
   - Password: `test123`
5. คลิก "สมัครสมาชิก"
6. ✅ ควร Login สำเร็จ

### Test 2: Email Link Login

1. เปิด: https://ecertonline-29a67.web.app
2. คลิกแท็บ **Email Link**
3. กรอกอีเมลจริงของคุณ
4. คลิก "📧 ส่ง Link ไปยังอีเมล"
5. เปิดอีเมล → คลิก link
6. ✅ ควร Login สำเร็จ

### Test 3: ตรวจสอบใน Firebase Console

1. ไปที่ **Authentication** → **Users**
2. ✅ ควรเห็นผู้ใช้ที่สมัครใหม่
3. คอลัมน์ **Providers** จะแสดง `password`

---

## 🚨 Troubleshooting

### ❌ Error: "auth/operation-not-allowed"

**สาเหตุ**: ยังไม่เปิดใช้งาน Email/Password ใน Firebase Console

**วิธีแก้**: ทำขั้นตอนที่ 2 ใหม่

---

### ❌ Error: "auth/unauthorized-domain"

**สาเหตุ**: Domain ไม่อยู่ใน Authorized domains

**วิธีแก้**: ทำขั้นตอนที่ 3 ใหม่

---

### ❌ ไม่ได้รับอีเมล (Email Link)

**สาเหตุ**: อีเมลอาจไปอยู่ในโฟลเดอร์ Spam

**วิธีแก้**:
1. ตรวจสอบโฟลเดอร์ Spam
2. ลองส่งใหม่อีกครั้ง
3. ตรวจสอบว่าอีเมลถูกต้อง

---

## 📚 เอกสารเพิ่มเติม

- [EMAIL_AUTH_GUIDE.md](./EMAIL_AUTH_GUIDE.md) - คู่มือการใช้งานแบบละเอียด
- [Firebase Email/Password Docs](https://firebase.google.com/docs/auth/web/password-auth)
- [Firebase Email Link Docs](https://firebase.google.com/docs/auth/web/email-link-auth)

---

**หมายเหตุ**: การตั้งค่านี้จะมีผลทันที ไม่ต้อง deploy ใหม่

