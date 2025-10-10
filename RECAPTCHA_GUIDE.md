# 🔒 คู่มือ reCAPTCHA v3 Integration

## ภาพรวม

ระบบนี้ใช้ **Google reCAPTCHA v3** เพื่อป้องกัน bot และ automated attacks บนหน้า Login

### ✨ คุณสมบัติ

- ✅ reCAPTCHA v3 (Invisible - ไม่มี checkbox)
- ✅ Score-based verification (0.0-1.0)
- ✅ ป้องกันหน้า Login
- ✅ Firebase Cloud Function สำหรับ verify token
- ✅ Threshold = 0.5 (ปรับได้)

---

## 📋 สิ่งที่ต้องตั้งค่า

### 1. ตั้งค่า reCAPTCHA Secret Key

คุณต้องตั้งค่า Secret Key ใน Firebase Functions config:

```bash
firebase functions:config:set recaptcha.secret_key="YOUR_SECRET_KEY_HERE"
```

**วิธีหา Secret Key:**
1. ไปที่ [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. เลือก site ของคุณ
3. คัดลอก **Secret Key** (ไม่ใช่ Site Key)
4. รันคำสั่งด้านบน

**ตรวจสอบว่าตั้งค่าสำเร็จ:**
```bash
firebase functions:config:get
```

ควรเห็น:
```json
{
  "recaptcha": {
    "secret_key": "YOUR_SECRET_KEY"
  }
}
```

### 2. Deploy Functions อีกครั้ง (หลังตั้งค่า Secret Key)

```bash
firebase deploy --only functions
```

---

## 🏗️ โครงสร้างโค้ด

### ไฟล์ที่เพิ่ม/แก้ไข

```
index.html                      # เพิ่ม reCAPTCHA script
services/
  └── recaptcha.ts              # 🆕 reCAPTCHA Service
components/
  └── LoginPage.tsx             # แก้ไข - เพิ่ม reCAPTCHA verification
firebase.config.ts              # แก้ไข - เพิ่ม functions
firebase.json                   # แก้ไข - เพิ่ม functions config
functions/                      # 🆕 Firebase Cloud Functions
  ├── package.json
  ├── tsconfig.json
  └── src/
      └── index.ts              # verifyRecaptcha function
```

---

## 🔧 วิธีการทำงาน

### 1. Flow การ Login พร้อม reCAPTCHA

```
User คลิก "Sign in with Google"
    ↓
Execute reCAPTCHA (client-side)
    ↓
รับ token จาก Google
    ↓
ส่ง token ไป Firebase Cloud Function
    ↓
Cloud Function verify token กับ Google
    ↓
รับ score (0.0-1.0)
    ↓
    ├─→ score >= 0.5 → ดำเนินการ Login ต่อ
    │
    └─→ score < 0.5 → บล็อก + แสดง error
```

### 2. reCAPTCHA Score

| Score Range | ความหมาย | การจัดการ |
|-------------|----------|-----------|
| 0.9 - 1.0 | มนุษย์แน่นอน | ✅ ผ่าน |
| 0.7 - 0.8 | น่าจะเป็นมนุษย์ | ✅ ผ่าน |
| 0.5 - 0.6 | ไม่แน่ใจ | ✅ ผ่าน (ขอบเขต) |
| 0.3 - 0.4 | น่าสงสัย | ❌ บล็อก |
| 0.0 - 0.2 | Bot แน่นอน | ❌ บล็อก |

**Default Threshold: 0.5**

---

## 📝 API Reference

### Client-Side (services/recaptcha.ts)

#### `executeRecaptcha(action: string): Promise<string>`
Execute reCAPTCHA และรับ token

```typescript
const token = await executeRecaptcha('login');
```

#### `verifyRecaptchaToken(token: string, action: string): Promise<RecaptchaVerifyResult>`
Verify token กับ Firebase Cloud Function

```typescript
const result = await verifyRecaptchaToken(token, 'login');
console.log(result.score); // 0.0-1.0
```

#### `executeAndVerifyRecaptcha(action: string): Promise<RecaptchaVerifyResult>`
Execute และ Verify ในขั้นตอนเดียว (แนะนำ)

```typescript
const result = await executeAndVerifyRecaptcha('login');
if (result.success && result.score >= 0.5) {
    // ดำเนินการต่อ
}
```

#### `isRecaptchaScoreValid(score: number): boolean`
ตรวจสอบว่า score ผ่านเกณฑ์หรือไม่

```typescript
if (isRecaptchaScoreValid(result.score)) {
    // ผ่าน
}
```

#### `getRecaptchaErrorMessage(score: number): string`
ดึงข้อความ error ตาม score

```typescript
const errorMsg = getRecaptchaErrorMessage(0.3);
// "ตรวจพบกิจกรรมผิดปกติ ไม่สามารถดำเนินการได้"
```

### Server-Side (functions/src/index.ts)

#### `verifyRecaptcha(data: { token: string, action: string })`
Firebase Cloud Function สำหรับ verify token

**Request:**
```json
{
  "token": "03AGdBq...",
  "action": "login"
}
```

**Response:**
```json
{
  "success": true,
  "score": 0.9,
  "action": "login",
  "message": "ผ่านการตรวจสอบ"
}
```

---

## 🧪 การทดสอบ

### ทดสอบ Login ปกติ (มนุษย์)

1. เปิด https://ecertonline-29a67.web.app
2. คลิก "Sign in with Google"
3. ควรเห็น console log:
   ```
   🔒 กำลังตรวจสอบ reCAPTCHA...
   reCAPTCHA result: { success: true, score: 0.9, action: "login" }
   ✅ reCAPTCHA ผ่าน, กำลัง Login...
   ```
4. Login สำเร็จ

### ทดสอบ Bot Detection

**วิธีที่ 1: ใช้ Automated Tool**
- ใช้ Selenium, Puppeteer หรือ Playwright
- ลอง automate การคลิกปุ่ม Login
- ควรได้ score ต่ำ (< 0.5) และถูกบล็อก

**วิธีที่ 2: ปรับ Threshold ชั่วคราว**
- แก้ `RECAPTCHA_THRESHOLD` ใน `services/recaptcha.ts` เป็น `0.9`
- Login ปกติ → อาจถูกบล็อกถ้า score < 0.9
- ทดสอบว่า error message แสดงถูกต้อง

### ดู Logs ใน Firebase Console

```bash
firebase functions:log
```

หรือไปที่:
https://console.firebase.google.com/project/ecertonline-29a67/functions/logs

---

## 🐛 การแก้ไขปัญหา

### ปัญหา: "Cloud Function not deployed"

**สาเหตุ:** Functions ยังไม่ได้ deploy หรือ deploy ไม่สำเร็จ

**วิธีแก้:**
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### ปัญหา: "Secret key not configured"

**สาเหตุ:** ยังไม่ได้ตั้งค่า Secret Key

**วิธีแก้:**
```bash
firebase functions:config:set recaptcha.secret_key="YOUR_SECRET_KEY"
firebase deploy --only functions
```

### ปัญหา: reCAPTCHA ไม่โหลด

**สาเหตุ:** Script ยังไม่โหลดเสร็จ

**วิธีแก้:**
- ตรวจสอบว่า `index.html` มี script tag:
  ```html
  <script src="https://www.google.com/recaptcha/api.js?render=6Lc_6t4rAAAAAChtA-8Cpl-2p2fSjm3_wlDyAuEj"></script>
  ```
- เปิด Browser Console ดู error
- ตรวจสอบ Network tab ว่า script โหลดสำเร็จหรือไม่

### ปัญหา: Score ต่ำเกินไป (มนุษย์แท้แต่ถูกบล็อก)

**สาเหตุ:** Threshold สูงเกินไป หรือ reCAPTCHA ยังเรียนรู้ traffic ไม่เสร็จ

**วิธีแก้:**
1. ลด threshold ใน `services/recaptcha.ts`:
   ```typescript
   const RECAPTCHA_THRESHOLD = 0.3; // ลดจาก 0.5
   ```
2. รอให้ reCAPTCHA เรียนรู้ traffic (1-2 วัน)
3. ดู score distribution ใน [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)

### ปัญหา: CORS Error

**สาเหตุ:** Domain ไม่ได้อยู่ใน authorized domains

**วิธีแก้:**
1. ไปที่ [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. เลือก site ของคุณ
3. เพิ่ม domain:
   - `localhost` (development)
   - `ecertonline-29a67.web.app` (production)

---

## 📊 Monitoring

### ดู reCAPTCHA Analytics

1. ไปที่ [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. เลือก site ของคุณ
3. ดู:
   - **Requests**: จำนวน requests
   - **Score Distribution**: การกระจายของ score
   - **Actions**: breakdown ตาม action name

### ดู Cloud Function Logs

```bash
# ดู logs แบบ real-time
firebase functions:log --only verifyRecaptcha

# ดู logs ย้อนหลัง
firebase functions:log --since 1h
```

---

## ⚙️ Configuration

### ปรับ Threshold

แก้ไขใน `services/recaptcha.ts`:

```typescript
const RECAPTCHA_THRESHOLD = 0.5; // เปลี่ยนตามต้องการ
```

**แนะนำ:**
- **0.3** - ผ่อนปรน (บล็อกแค่ bot ชัดเจน)
- **0.5** - ปานกลาง (แนะนำ)
- **0.7** - เข้มงวด (อาจบล็อกมนุษย์บางคน)

### เพิ่ม reCAPTCHA ในหน้าอื่น

**ตัวอย่าง: ป้องกันการบันทึกเอกสาร**

1. Import service:
   ```typescript
   import { executeAndVerifyRecaptcha, isRecaptchaScoreValid } from '../services/recaptcha';
   ```

2. เรียกก่อนบันทึก:
   ```typescript
   const handleSave = async () => {
       // Verify reCAPTCHA
       const result = await executeAndVerifyRecaptcha('save_document');
       
       if (!result.success || !isRecaptchaScoreValid(result.score)) {
           alert('ตรวจพบกิจกรรมผิดปกติ');
           return;
       }
       
       // บันทึกเอกสาร
       await saveDeliveryNote(data);
   };
   ```

---

## 🔗 Links

- [Google reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [reCAPTCHA Best Practices](https://developers.google.com/recaptcha/docs/faq)

---

## 📝 หมายเหตุ

- reCAPTCHA v3 **ไม่มี checkbox** (invisible)
- Score จะ**แม่นยำขึ้น**เมื่อมี traffic มากขึ้น
- ควร**ติดตาม score distribution** ใน Admin Console
- ถ้า score ต่ำเกินไป ให้**ปรับ threshold**
- **Token มีอายุ 2 นาที** ต้องเรียก execute ก่อนทำ action

---

**สร้างเมื่อ:** 5 ตุลาคม 2025  
**เวอร์ชัน:** 1.0.0  
**Site Key:** `6Lc_6t4rAAAAAChtA-8Cpl-2p2fSjm3_wlDyAuEj`
