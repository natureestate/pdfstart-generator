# Email Authentication Guide

คู่มือการตั้งค่าและใช้งาน **Email/Password** และ **Passwordless Email Link** Authentication

---

## 📋 สารบัญ

1. [ภาพรวม](#ภาพรวม)
2. [การตั้งค่า Firebase Console](#การตั้งค่า-firebase-console)
3. [วิธีใช้งาน](#วิธีใช้งาน)
4. [การทดสอบ](#การทดสอบ)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 ภาพรวม

ระบบรองรับการ Login แบบ:

### 1. **Email/Password Authentication**
- Login แบบปกติด้วยอีเมลและรหัสผ่าน
- รองรับการสมัครสมาชิก (Sign Up)
- รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร

### 2. **Passwordless Email Link Authentication**
- Login ไม่ต้องจำรหัสผ่าน
- ส่ง link ไปยังอีเมล คลิกเพื่อ login
- ปลอดภัยและสะดวก

---

## ⚙️ การตั้งค่า Firebase Console

### ขั้นตอนที่ 1: เปิดใช้งาน Email/Password

1. เปิด [Firebase Console](https://console.firebase.google.com/)
2. เลือก Project: **ecertonline-29a67**
3. ไปที่ **Authentication** → **Sign-in method**
4. คลิก **Email/Password**
5. เปิดใช้งาน **Email/Password** (toggle เป็นสีเขียว)
6. **ไม่ต้อง**เปิด "Email link (passwordless sign-in)" ในหน้านี้ (เราจะตั้งค่าแยก)
7. คลิก **Save**

### ขั้นตอนที่ 2: เปิดใช้งาน Email Link

1. ในหน้าเดียวกัน (**Sign-in method**)
2. คลิก **Email/Password** อีกครั้ง
3. เปิดใช้งาน **Email link (passwordless sign-in)** (toggle เป็นสีเขียว)
4. คลิก **Save**

### ขั้นตอนที่ 3: ตั้งค่า Authorized Domains

1. ไปที่ **Authentication** → **Settings** → **Authorized domains**
2. ตรวจสอบว่ามี domain ต่อไปนี้:
   - `localhost` (สำหรับ development)
   - `ecertonline-29a67.web.app` (Firebase Hosting)
   - `ecertonline-29a67.firebaseapp.com` (Firebase Hosting)
3. ถ้าไม่มี ให้เพิ่มด้วยปุ่ม **Add domain**

### ขั้นตอนที่ 4: Customize Email Templates (Optional)

1. ไปที่ **Authentication** → **Templates**
2. เลือก **Email link sign-in**
3. แก้ไข:
   - **Sender name**: ชื่อบริษัท/แอปของคุณ
   - **Subject**: หัวข้ออีเมล
   - **Email body**: เนื้อหาอีเมล (รองรับภาษาไทย)

---

## 🚀 วิธีใช้งาน

### สำหรับผู้ใช้

#### 1. Login ด้วย Email/Password

1. เปิดแอป → หน้า Login
2. คลิกแท็บ **Email/Password**
3. **สมัครสมาชิก**:
   - คลิก "สมัครสมาชิก"
   - กรอกอีเมลและรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
   - คลิก "สมัครสมาชิก"
4. **เข้าสู่ระบบ**:
   - กรอกอีเมลและรหัสผ่าน
   - คลิก "เข้าสู่ระบบ"

#### 2. Login ด้วย Email Link (Passwordless)

1. เปิดแอป → หน้า Login
2. คลิกแท็บ **Email Link**
3. กรอกอีเมล
4. คลิก "📧 ส่ง Link ไปยังอีเมล"
5. เปิดอีเมลของคุณ
6. คลิก link ในอีเมล
7. Login สำเร็จ! 🎉

**หมายเหตุ**:
- Link จะหมดอายุภายใน **1 ชั่วโมง**
- ตรวจสอบโฟลเดอร์ Spam ถ้าไม่เห็นอีเมล

---

## 🧪 การทดสอบ

### ทดสอบ Email/Password

```bash
# 1. เปิดแอป
npm run dev

# 2. ไปที่หน้า Login
# 3. คลิกแท็บ "Email/Password"
# 4. ทดสอบสมัครสมาชิก:
#    - Email: test@example.com
#    - Password: test123
# 5. ทดสอบ Login
```

### ทดสอบ Email Link

```bash
# 1. เปิดแอป
npm run dev

# 2. ไปที่หน้า Login
# 3. คลิกแท็บ "Email Link"
# 4. กรอกอีเมลจริงของคุณ
# 5. คลิก "ส่ง Link"
# 6. เปิดอีเมล → คลิก link
# 7. ควร redirect กลับมาแอปและ login สำเร็จ
```

### ตรวจสอบใน Firebase Console

1. ไปที่ **Authentication** → **Users**
2. ควรเห็นผู้ใช้ที่สมัครใหม่
3. คอลัมน์ **Providers** จะแสดง:
   - `password` สำหรับ Email/Password
   - `password` สำหรับ Email Link (เหมือนกัน)

---

## 🔧 Troubleshooting

### ปัญหา: ส่ง Email Link ไม่สำเร็จ

**สาเหตุ**:
- ยังไม่เปิดใช้งาน Email Link ใน Firebase Console
- Domain ไม่อยู่ใน Authorized domains

**วิธีแก้**:
1. ตรวจสอบ Firebase Console → Authentication → Sign-in method
2. ตรวจสอบ Authorized domains

### ปัญหา: คลิก Link แล้วไม่ Login

**สาเหตุ**:
- Link หมดอายุ (เกิน 1 ชั่วโมง)
- เปิด link ในเบราว์เซอร์อื่น (ไม่มี localStorage)

**วิธีแก้**:
1. ขอ link ใหม่
2. เปิด link ในเบราว์เซอร์เดียวกับที่ขอ link
3. ถ้าเปิดในเบราว์เซอร์อื่น → กรอกอีเมลอีกครั้ง

### ปัญหา: รหัสผ่านไม่ถูกต้อง

**สาเหตุ**:
- พิมพ์ผิด
- รหัสผ่านสั้นเกินไป (ต้องมีอย่างน้อย 6 ตัวอักษร)

**วิธีแก้**:
1. ตรวจสอบรหัสผ่าน
2. ถ้าลืมรหัสผ่าน → ใช้ Email Link แทน (ไม่ต้องใช้รหัสผ่าน)

### ปัญหา: อีเมลถูกใช้งานแล้ว

**สาเหตุ**:
- อีเมลนี้สมัครสมาชิกไปแล้ว

**วิธีแก้**:
1. ใช้ Login แทน Sign Up
2. หรือใช้อีเมลอื่น

### ปัญหา: ไม่ได้รับอีเมล

**สาเหตุ**:
- อีเมลไปอยู่ในโฟลเดอร์ Spam
- อีเมลไม่ถูกต้อง
- Firebase ส่งอีเมลล้มเหลว

**วิธีแก้**:
1. ตรวจสอบโฟลเดอร์ Spam
2. ตรวจสอบอีเมลว่าถูกต้อง
3. ลองส่งใหม่อีกครั้ง
4. ตรวจสอบ Firebase Console → Authentication → Templates

---

## 📊 ข้อมูลเพิ่มเติม

### ความปลอดภัย

- **Email/Password**: รหัสผ่านถูกเข้ารหัสด้วย bcrypt
- **Email Link**: ใช้ one-time link ที่หมดอายุภายใน 1 ชั่วโมง
- **reCAPTCHA v3**: ป้องกัน bot attacks

### ข้อจำกัด

- **Email/Password**: 
  - รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
  - ไม่มีการ reset password (ใช้ Email Link แทน)
- **Email Link**:
  - Link หมดอายุภายใน 1 ชั่วโมง
  - ต้องเปิดในเบราว์เซอร์เดียวกัน (หรือกรอกอีเมลอีกครั้ง)

### API Reference

#### Email/Password

```typescript
// Sign Up
import { signUpWithEmailPassword } from './services/auth';
await signUpWithEmailPassword(email, password);

// Login
import { signInWithEmailPassword } from './services/auth';
await signInWithEmailPassword(email, password);
```

#### Email Link

```typescript
// ส่ง Email Link
import { sendEmailLoginLink } from './services/auth';
await sendEmailLoginLink(email);

// ตรวจสอบว่าเป็น Email Link หรือไม่
import { checkIsEmailLink } from './services/auth';
if (checkIsEmailLink()) {
  // เป็น email link
}

// Login ด้วย Email Link
import { signInWithEmailLinkAuth } from './services/auth';
await signInWithEmailLinkAuth(email); // email optional
```

---

## 📚 เอกสารอ้างอิง

- [Firebase Email/Password Authentication](https://firebase.google.com/docs/auth/web/password-auth)
- [Firebase Email Link Authentication](https://firebase.google.com/docs/auth/web/email-link-auth)
- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/best-practices)

---

**อัปเดตล่าสุด**: 30 ตุลาคม 2025

