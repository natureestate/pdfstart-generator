# คู่มือ Phone Authentication

## ภาพรวม

ระบบ Phone Authentication ช่วยให้ผู้ใช้สามารถ Login เข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัส OTP (One-Time Password) ที่ส่งผ่าน SMS โดยใช้ Firebase Phone Authentication พร้อมระบบป้องกัน bot ด้วย reCAPTCHA v3

## คุณสมบัติหลัก

- ✅ Login ด้วยเบอร์โทรศัพท์ไทย (+66XXXXXXXXX)
- ✅ ส่งรหัส OTP 6 หลักผ่าน SMS
- ✅ รหัส OTP หมดอายุใน 60 วินาที
- ✅ ป้องกัน bot ด้วย reCAPTCHA v3 (invisible mode)
- ✅ รองรับเบอร์ทดสอบสำหรับ development
- ✅ Error messages เป็นภาษาไทย
- ✅ UI/UX ที่ใช้งานง่าย

## การตั้งค่า Firebase Console

### 1. เปิดใช้งาน Phone Authentication

1. ไปที่ [Firebase Console](https://console.firebase.google.com/project/ecertonline-29a67/authentication/providers)
2. คลิกที่แท็บ **Authentication** > **Sign-in method**
3. เลื่อนหา **Phone** provider
4. คลิก **Enable** (เปิดใช้งาน)
5. คลิก **Save**

### 2. เพิ่มเบอร์ทดสอบสำหรับ Development

สำหรับการทดสอบในระหว่างพัฒนา คุณสามารถเพิ่มเบอร์ทดสอบที่ไม่ต้องส่ง SMS จริง:

1. ใน **Phone** provider settings
2. เลื่อนลงไปที่ **Phone numbers for testing**
3. คลิก **Add phone number**
4. กรอกเบอร์ทดสอบ เช่น: `+66812345678`
5. กรอกรหัส OTP ที่ต้องการ เช่น: `123456`
6. คลิก **Add**

**ตัวอย่างเบอร์ทดสอบที่แนะนำ:**

| เบอร์โทรศัพท์ | รหัส OTP |
|--------------|----------|
| +66812345678 | 123456   |
| +66898765432 | 654321   |
| +66855512345 | 111111   |

**หมายเหตุ:**
- เบอร์ทดสอบจะไม่ส่ง SMS จริง
- สามารถเพิ่มได้สูงสุด 10 เบอร์
- ใช้สำหรับ development เท่านั้น
- ควรลบออกก่อน production

### 3. ตั้งค่า SMS Quota (ถ้าจำเป็น)

Firebase มี SMS quota ฟรี:
- **Spark Plan (ฟรี)**: 10 SMS/วัน
- **Blaze Plan (จ่ายตามใช้)**: ไม่จำกัด (คิดค่าใช้จ่ายตามจำนวน SMS)

สำหรับ production แนะนำให้อัปเกรดเป็น Blaze Plan

## โครงสร้างโค้ด

### 1. services/auth.ts

ฟังก์ชันหลักสำหรับ Phone Authentication:

```typescript
// สร้าง RecaptchaVerifier
export const createRecaptchaVerifier = (elementId: string): RecaptchaVerifier

// ส่ง OTP ไปยังเบอร์โทรศัพท์
export const sendPhoneOTP = async (
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult>

// ยืนยัน OTP และ Login
export const verifyPhoneOTP = async (
    confirmationResult: ConfirmationResult,
    otp: string
): Promise<User>
```

### 2. components/PhoneAuthForm.tsx

คอมโพเนนต์ฟอร์มสำหรับ Phone Authentication:

**Props:**
- `onSuccess?: () => void` - Callback เมื่อ Login สำเร็จ
- `onError?: (error: string) => void` - Callback เมื่อเกิด error

**Features:**
- 2 ขั้นตอน: กรอกเบอร์โทรศัพท์ → กรอก OTP
- จัดรูปแบบเบอร์โทรศัพท์อัตโนมัติ
- Countdown timer 60 วินาทีสำหรับขอ OTP ใหม่
- Validation เบอร์โทรศัพท์และ OTP
- Error handling ที่ครอบคลุม

### 3. components/LoginPage.tsx

หน้า Login ที่รองรับทั้ง Google และ Phone Authentication:

**Features:**
- Tab สำหรับเลือกวิธี Login (Google / เบอร์โทรศัพท์)
- reCAPTCHA container สำหรับ Phone Auth
- Error display แบบรวมศูนย์

## การใช้งาน

### สำหรับผู้ใช้ทั่วไป

#### ขั้นตอนที่ 1: เลือกวิธี Login

1. เปิดหน้า Login
2. คลิกที่แท็บ **เบอร์โทรศัพท์**

#### ขั้นตอนที่ 2: กรอกเบอร์โทรศัพท์

1. กรอกเบอร์โทรศัพท์ในรูปแบบ `+66XXXXXXXXX`
   - ตัวอย่าง: `+66812345678`
   - ถ้าเริ่มต้นด้วย `0` ระบบจะแปลงเป็น `+66` อัตโนมัติ
2. คลิกปุ่ม **ส่งรหัส OTP**
3. รอรับ SMS (ประมาณ 5-30 วินาที)

#### ขั้นตอนที่ 3: กรอกรหัส OTP

1. กรอกรหัส OTP 6 หลักที่ได้รับ
2. คลิกปุ่ม **ยืนยัน OTP**
3. ระบบจะ Login อัตโนมัติ

**หมายเหตุ:**
- รหัส OTP หมดอายุใน 60 วินาที
- สามารถขอรหัสใหม่ได้หลังจาก countdown จบ
- สามารถเปลี่ยนเบอร์โทรศัพท์ได้ก่อนยืนยัน OTP

### สำหรับนักพัฒนา

#### การทดสอบด้วยเบอร์ทดสอบ

1. ใช้เบอร์ที่ตั้งค่าไว้ใน Firebase Console
2. กรอกเบอร์ทดสอบ เช่น `+66812345678`
3. คลิก **ส่งรหัส OTP** (จะไม่ส่ง SMS จริง)
4. กรอกรหัส OTP ที่ตั้งค่าไว้ เช่น `123456`
5. คลิก **ยืนยัน OTP**

#### การทดสอบด้วยเบอร์จริง

1. ตรวจสอบว่ามี SMS quota เพียงพอ
2. ใช้เบอร์โทรศัพท์จริงที่สามารถรับ SMS ได้
3. ทำตามขั้นตอนปกติ
4. รอรับ SMS และกรอก OTP

## Error Messages และการแก้ไข

### Error จากการส่ง OTP

| Error Code | ข้อความภาษาไทย | สาเหตุและวิธีแก้ไข |
|-----------|---------------|-------------------|
| `auth/invalid-phone-number` | รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง | ตรวจสอบรูปแบบเบอร์ (+66XXXXXXXXX) |
| `auth/missing-phone-number` | กรุณากรอกเบอร์โทรศัพท์ | กรอกเบอร์โทรศัพท์ให้ครบถ้วน |
| `auth/quota-exceeded` | ส่ง SMS เกินโควต้า กรุณาลองใหม่ภายหลัง | รอ 24 ชั่วโมงหรืออัปเกรด plan |
| `auth/too-many-requests` | มีการส่ง OTP มากเกินไป กรุณารอสักครู่ | รอสักครู่แล้วลองใหม่ |
| `auth/captcha-check-failed` | การตรวจสอบ reCAPTCHA ล้มเหลว กรุณาลองใหม่ | รีเฟรชหน้าและลองใหม่ |
| `auth/operation-not-allowed` | ระบบยังไม่เปิดใช้งาน Phone Authentication | เปิดใช้งาน Phone provider ใน Firebase Console |

### Error จากการยืนยัน OTP

| Error Code | ข้อความภาษาไทย | สาเหตุและวิธีแก้ไข |
|-----------|---------------|-------------------|
| `auth/invalid-verification-code` | รหัส OTP ไม่ถูกต้อง | ตรวจสอบรหัส OTP และกรอกใหม่ |
| `auth/code-expired` | รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่ | ขอรหัส OTP ใหม่ |
| `auth/missing-verification-code` | กรุณากรอกรหัส OTP | กรอกรหัส OTP 6 หลัก |
| `auth/session-expired` | Session หมดอายุ กรุณาขอรหัส OTP ใหม่ | เริ่มต้นใหม่ตั้งแต่ขั้นตอนกรอกเบอร์ |

## Troubleshooting

### ปัญหา: ไม่ได้รับ SMS

**สาเหตุที่เป็นไปได้:**
1. เบอร์โทรศัพท์ไม่ถูกต้อง
2. SMS quota หมด (Spark Plan: 10 SMS/วัน)
3. เครือข่ายมีปัญหา
4. เบอร์ถูกบล็อกโดย Firebase

**วิธีแก้ไข:**
1. ตรวจสอบรูปแบบเบอร์โทรศัพท์
2. ตรวจสอบ SMS quota ใน Firebase Console
3. ลองใช้เบอร์อื่น
4. ใช้เบอร์ทดสอบแทน (สำหรับ development)

### ปัญหา: reCAPTCHA ไม่ทำงาน

**สาเหตุที่เป็นไปได้:**
1. reCAPTCHA script ยังไม่โหลด
2. Site key ไม่ถูกต้อง
3. Domain ไม่ได้รับอนุญาต

**วิธีแก้ไข:**
1. ตรวจสอบว่ามี reCAPTCHA script ใน `index.html`
2. ตรวจสอบ site key ใน `firebase.config.ts`
3. เพิ่ม domain ใน reCAPTCHA settings (Google Cloud Console)

### ปัญหา: OTP หมดอายุเร็วเกินไป

**สาเหตุ:**
- Firebase กำหนดให้ OTP หมดอายุใน 60 วินาที (ไม่สามารถเปลี่ยนได้)

**วิธีแก้ไข:**
- ขอรหัส OTP ใหม่
- กรอก OTP ให้เร็วขึ้น

### ปัญหา: ไม่สามารถ Login ได้หลังจากยืนยัน OTP

**สาเหตุที่เป็นไปได้:**
1. Firestore Rules ไม่อนุญาต
2. Network error
3. User ถูกระงับ

**วิธีแก้ไข:**
1. ตรวจสอบ Firestore Rules
2. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
3. ตรวจสอบสถานะ user ใน Firebase Console

## ข้อมูลทางเทคนิค

### Flow การทำงาน

```
1. ผู้ใช้กรอกเบอร์โทรศัพท์
   ↓
2. สร้าง RecaptchaVerifier (invisible)
   ↓
3. เรียก signInWithPhoneNumber()
   ↓
4. Firebase ส่ง SMS พร้อม OTP
   ↓
5. ผู้ใช้กรอก OTP
   ↓
6. เรียก confirmationResult.confirm(otp)
   ↓
7. Firebase ตรวจสอบ OTP
   ↓
8. Login สำเร็จ → ได้ User object
```

### รูปแบบเบอร์โทรศัพท์

Firebase Phone Authentication ต้องการเบอร์ในรูปแบบ E.164:

**รูปแบบ:** `+[country code][subscriber number]`

**ตัวอย่างเบอร์ไทย:**
- ✅ `+66812345678` (ถูกต้อง)
- ✅ `+66898765432` (ถูกต้อง)
- ❌ `0812345678` (ผิด - ขาด country code)
- ❌ `66812345678` (ผิด - ขาด +)
- ❌ `+66-81-234-5678` (ผิด - มีเครื่องหมาย -)

**การแปลงอัตโนมัติ:**
- `0812345678` → `+66812345678`
- `66812345678` → `+66812345678`

### Security

1. **reCAPTCHA v3**: ป้องกัน bot และ automated attacks
2. **Rate Limiting**: Firebase จำกัดจำนวนการส่ง SMS ต่อเบอร์
3. **OTP Expiration**: รหัส OTP หมดอายุใน 60 วินาที
4. **Session Management**: Session หมดอายุหลังจากไม่ได้ใช้งานนาน

### Firestore Rules

Phone Authentication ใช้ `request.auth.uid` เหมือนกับ Google OAuth:

```javascript
match /deliveryNotes/{documentId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}
```

ไม่ต้องแก้ไข rules เพิ่มเติม

## Best Practices

### สำหรับ Development

1. ใช้เบอร์ทดสอบเสมอเพื่อประหยัด SMS quota
2. เพิ่มเบอร์ทดสอบหลายเบอร์สำหรับทีม
3. ใช้ emulator สำหรับการทดสอบอัตโนมัติ
4. Log error messages เพื่อ debug

### สำหรับ Production

1. อัปเกรดเป็น Blaze Plan เพื่อ SMS quota ไม่จำกัด
2. ลบเบอร์ทดสอบทั้งหมดออก
3. ตั้งค่า rate limiting เพิ่มเติม
4. Monitor SMS usage ใน Firebase Console
5. เพิ่ม error tracking (เช่น Sentry)

### สำหรับ UX

1. แสดงข้อความชัดเจนว่ากำลังส่ง SMS
2. แสดง countdown timer สำหรับขอ OTP ใหม่
3. อนุญาตให้เปลี่ยนเบอร์ได้ก่อนยืนยัน OTP
4. แสดง error messages ที่เข้าใจง่าย
5. รองรับการกด Enter เพื่อ submit

## ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: Login ด้วยเบอร์ทดสอบ

```
1. เปิดหน้า Login
2. คลิกแท็บ "เบอร์โทรศัพท์"
3. กรอก: +66812345678
4. คลิก "ส่งรหัส OTP"
5. กรอก: 123456
6. คลิก "ยืนยัน OTP"
7. Login สำเร็จ ✅
```

### ตัวอย่างที่ 2: Login ด้วยเบอร์จริง

```
1. เปิดหน้า Login
2. คลิกแท็บ "เบอร์โทรศัพท์"
3. กรอก: +66898765432
4. คลิก "ส่งรหัส OTP"
5. รอรับ SMS (5-30 วินาที)
6. กรอกรหัส OTP จาก SMS
7. คลิก "ยืนยัน OTP"
8. Login สำเร็จ ✅
```

### ตัวอย่างที่ 3: ขอ OTP ใหม่

```
1. กรอกเบอร์และส่ง OTP
2. รอจนกว่า countdown จะหมด (60 วินาที)
3. คลิก "ขอรหัส OTP ใหม่"
4. รอรับ SMS ใหม่
5. กรอกรหัส OTP ใหม่
6. ยืนยัน OTP
```

## FAQ

### Q: ต้องมีเบอร์โทรศัพท์ไทยเท่านั้นหรือไม่?

A: ไม่จำเป็น แต่ระบบออกแบบมาสำหรับเบอร์ไทย (+66) เป็นหลัก หากต้องการรองรับประเทศอื่น สามารถแก้ไข validation ใน `PhoneAuthForm.tsx` ได้

### Q: สามารถเปลี่ยนเวลาหมดอายุของ OTP ได้หรือไม่?

A: ไม่ได้ Firebase กำหนดให้ OTP หมดอายุใน 60 วินาที และไม่สามารถเปลี่ยนแปลงได้

### Q: ค่าใช้จ่ายในการส่ง SMS เท่าไหร่?

A: 
- **Spark Plan (ฟรี)**: 10 SMS/วัน ฟรี
- **Blaze Plan**: ประมาณ $0.01-0.05 ต่อ SMS (ขึ้นอยู่กับประเทศ)

### Q: สามารถใช้ Phone Auth กับ Google OAuth พร้อมกันได้หรือไม่?

A: ได้ ผู้ใช้สามารถมีหลายวิธีในการ Login ได้ แต่จะใช้ `uid` เดียวกันถ้าเป็นบัญชีเดียวกัน

### Q: จะทำอย่างไรถ้าผู้ใช้เปลี่ยนเบอร์โทรศัพท์?

A: ผู้ใช้ต้อง Login ด้วยเบอร์ใหม่ ระบบจะสร้างบัญชีใหม่ให้อัตโนมัติ หากต้องการย้ายข้อมูล ต้องใช้ Firebase Admin SDK

## สรุป

Phone Authentication เป็นทางเลือกที่สะดวกสำหรับผู้ใช้ที่ไม่ต้องการใช้ Google Account โดยมีความปลอดภัยสูงด้วย OTP และ reCAPTCHA v3 ระบบออกแบบมาให้ใช้งานง่ายทั้งสำหรับผู้ใช้และนักพัฒนา

สำหรับข้อมูลเพิ่มเติม:
- [Firebase Phone Authentication Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)

---

**หมายเหตุ:** เอกสารนี้อัปเดตล่าสุด: ตุลาคม 2025
