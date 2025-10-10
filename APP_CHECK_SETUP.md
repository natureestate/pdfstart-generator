# 🛡️ App Check Setup Guide

## ✅ สิ่งที่ทำเสร็จแล้ว

1. ✅ อัปเกรด Cloud Function เป็น v2 พร้อม `enforceAppCheck: true`
2. ✅ เพิ่ม App Check SDK ใน client (firebase.config.ts)
3. ✅ Deploy สำเร็จ

---

## ⚠️ สิ่งที่ต้องทำต่อใน Firebase Console

### ขั้นตอนที่ 1: ลงทะเบียน App ใน App Check

1. ไปที่ [Firebase Console](https://console.firebase.google.com/project/ecertonline-29a67/appcheck)
2. คลิก **"Get started"** หรือ **"Register app"**
3. เลือก **Web app** ของคุณ
4. เลือก provider: **reCAPTCHA v3**
5. ใส่ **Site Key**: `6Lc_6t4rAAAAAChtA-8Cpl-2p2fSjm3_wlDyAuEj`
6. คลิก **Save**

### ขั้นตอนที่ 2: เปิดใช้งาน App Check Enforcement

1. ใน Firebase Console > App Check
2. ไปที่แท็บ **"APIs"**
3. หา **Cloud Functions**
4. คลิก **"Enforce"** (หรือ **"Unenforced"** แล้วเปลี่ยนเป็น **"Enforced"**)
5. ยืนยันการเปลี่ยนแปลง

---

## 🧪 วิธีทดสอบ

### 1. ทดสอบ Login ปกติ

เปิด: https://ecertonline-29a67.web.app

**คาดว่าจะเห็น:**
```
🔒 กำลังตรวจสอบ reCAPTCHA...
🔑 กำลัง Login...
App Check verified: { appId: "...", alreadyConsumed: false }
reCAPTCHA result: { success: true, score: 0.9, action: "login" }
✅ Login สำเร็จ
```

### 2. ตรวจสอบ App Check Token

เปิด Browser Console (F12) และพิมพ์:
```javascript
firebase.appCheck().getToken()
```

ควรได้ token กลับมา

### 3. ดู Logs

```bash
firebase functions:log --only verifyRecaptcha
```

ควรเห็น:
```
App Check verified: { appId: "1:457246107908:web:1008539ce20637935c8851", ... }
reCAPTCHA verification: { action: "login", score: 0.9, ... }
```

---

## 🔐 ความแตกต่างระหว่าง reCAPTCHA และ App Check

### reCAPTCHA v3
- ✅ ตรวจสอบว่าเป็น **bot หรือมนุษย์**
- ✅ ให้ **score** (0.0-1.0)
- ✅ ทำงานใน **browser**

### App Check
- ✅ ตรวจสอบว่า request มาจาก **app ที่ถูกต้อง**
- ✅ ป้องกัน **unauthorized clients**
- ✅ ใช้ reCAPTCHA v3 เป็น **provider**

### ทำงานร่วมกัน
```
User → reCAPTCHA (ตรวจสอบ bot) → App Check (ตรวจสอบ app) → Cloud Function
```

---

## 📊 การทำงาน

### ก่อน (เฉพาะ reCAPTCHA):
```
Client → Cloud Function
         ↓
         Verify reCAPTCHA token
         ↓
         Return score
```

### หลัง (reCAPTCHA + App Check):
```
Client → Generate App Check token (ใช้ reCAPTCHA v3)
         ↓
         Call Cloud Function พร้อม App Check token
         ↓
         Cloud Function verify App Check token
         ↓
         Verify reCAPTCHA token
         ↓
         Return score
```

---

## 🐛 Troubleshooting

### ปัญหา: "App Check token is missing"

**สาเหตุ:** ยังไม่ได้ลงทะเบียน app ใน App Check

**วิธีแก้:** ทำตามขั้นตอนที่ 1 ด้านบน

### ปัญหา: "App Check token is invalid"

**สาเหตุ:** Site key ไม่ตรงกัน

**วิธีแก้:**
- ตรวจสอบว่า site key ใน `firebase.config.ts` ตรงกับที่ลงทะเบียนใน App Check

### ปัญหา: Function ทำงานช้าลง

**สาเหตุ:** App Check verification ใช้เวลาเพิ่ม

**ปกติ:** App Check verification ใช้เวลาประมาณ 100-200ms เพิ่มเติม

---

## 📝 Links

- [Firebase Console - App Check](https://console.firebase.google.com/project/ecertonline-29a67/appcheck)
- [Firebase Console - Functions](https://console.firebase.google.com/project/ecertonline-29a67/functions)
- [App Check Documentation](https://firebase.google.com/docs/app-check)
- [App Check for Cloud Functions](https://firebase.google.com/docs/app-check/cloud-functions)

---

**สร้างเมื่อ:** 5 ตุลาคม 2025  
**เวอร์ชัน:** 1.0.0
