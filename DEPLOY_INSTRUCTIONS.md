# คำแนะนำการ Deploy Firestore Rules

## 📌 สำคัญ: ต้อง Deploy Firestore Rules ก่อนใช้งานระบบ Auto Document Number

เนื่องจากเราได้แก้ไข Firestore Security Rules เพื่อรองรับระบบ Auto-Generate เลขที่เอกสาร คุณจำเป็นต้อง deploy rules เหล่านี้ขึ้น Firebase ก่อนใช้งาน

## ⚠️ ปัญหาที่เกิดขึ้นถ้าไม่ Deploy

หากคุณไม่ได้ deploy Firestore Rules คุณจะพบ error นี้:

```
FirebaseError: Missing or insufficient permissions.
Failed to load resource: the server responded with a status of 403
```

## 🚀 วิธีการ Deploy

### ขั้นตอนที่ 1: เข้าสู่ Terminal

เปิด Terminal และเข้าไปยัง directory ของโปรเจค:

```bash
cd /Users/macbooknow/Ecertdoc/pdfexportforDeliveryandCert
```

### ขั้นตอนที่ 2: Login เข้า Firebase (ถ้ายังไม่ได้ Login)

```bash
firebase login
```

เลือก Google Account ที่เชื่อมต่อกับ Firebase Project ของคุณ

### ขั้นตอนที่ 3: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

รอสักครู่จนกว่าจะเห็นข้อความ:

```
✔  Deploy complete!
```

### ขั้นตอนที่ 4: ทดสอบระบบ

1. เปิด browser และรีเฟรชหน้าแอป
2. Login เข้าสู่ระบบ
3. คลิกที่แท็บ "ใบส่งมอบงาน" หรือ "ใบรับประกันสินค้า"
4. ระบบจะ auto-generate เลขที่เอกสารให้อัตโนมัติ

## 📋 การตรวจสอบว่า Deploy สำเร็จ

### วิธีที่ 1: ตรวจสอบผ่าน Firebase Console

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือก Project: `ecertonline-29a67`
3. ไปที่ **Firestore Database** > **Rules**
4. ตรวจสอบว่ามี rules สำหรับ `documentNumbers` collection

คุณควรเห็น rules นี้:

```javascript
match /documentNumbers/{counterId} {
  allow read: if isAuthenticated() && counterId.matches('^' + request.auth.uid + '_.*');
  allow create: if isAuthenticated() 
                && request.resource.data.userId == request.auth.uid
                && counterId.matches('^' + request.auth.uid + '_.*');
  allow update: if isAuthenticated() 
                && counterId.matches('^' + request.auth.uid + '_.*')
                && resource.data.userId == request.auth.uid;
  allow delete: if false;
}
```

### วิธีที่ 2: ทดสอบโดยใช้งานแอป

1. เปิดแอปและ Login
2. เปิด Developer Tools (F12)
3. ไปที่แท็บ Console
4. ดูว่าไม่มี error `403` หรือ `permission-denied`
5. เลขที่เอกสารควรถูกสร้างอัตโนมัติในรูปแบบ `DN-YYMMDDXX`

## 🔍 การแก้ไขปัญหา

### ปัญหา: `firebase: command not found`

**แก้ไข**: ติดตั้ง Firebase CLI

```bash
npm install -g firebase-tools
```

### ปัญหา: `Error: Invalid project id`

**แก้ไข**: ตรวจสอบว่าคุณอยู่ใน directory ที่ถูกต้อง

```bash
pwd
# ควรแสดง: /Users/macbooknow/Ecertdoc/pdfexportforDeliveryandCert
```

และตรวจสอบว่ามีไฟล์ `.firebaserc`:

```bash
cat .firebaserc
# ควรแสดง project id: ecertonline-29a67
```

### ปัญหา: `Error: No project active`

**แก้ไข**: เลือก project

```bash
firebase use ecertonline-29a67
```

### ปัญหา: ยังเจอ error `403` หลัง deploy

**แก้ไข**:

1. รอสักครู่ (1-2 นาที) เพราะ Firebase อาจต้องใช้เวลาในการ propagate rules
2. ล้าง cache ของ browser (Ctrl+Shift+Delete)
3. Logout แล้ว Login ใหม่
4. ตรวจสอบว่า Firebase Rules ถูก deploy จริงๆ ใน Firebase Console

## 📚 คำสั่ง Firebase CLI ที่เป็นประโยชน์

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `firebase login` | Login เข้า Firebase |
| `firebase projects:list` | แสดงรายการ Firebase Projects |
| `firebase use <project-id>` | เลือก Firebase Project |
| `firebase deploy --only firestore:rules` | Deploy Firestore Rules เท่านั้น |
| `firebase deploy` | Deploy ทุกอย่าง (Rules, Functions, Hosting) |
| `firebase firestore:rules:get` | ดู Rules ปัจจุบันที่ deploy อยู่ |

## ✅ สรุป

หลังจาก deploy Firestore Rules สำเร็จแล้ว:

✅ **ระบบ Auto-Generate เลขที่เอกสารจะทำงาน**
- เลขที่เอกสารจะถูกสร้างอัตโนมัติในรูปแบบ `DN-YYMMDDXX`
- ไม่มี permission error อีกต่อไป
- Running number จะแยกตาม User และรีเซ็ตทุกวัน

✅ **มีปุ่มสร้างฟอร์มใหม่**
- คลิกปุ่ม "ฟอร์มใหม่" เพื่อสร้างเอกสารใหม่
- ระบบจะ reset ฟอร์มและ generate เลขที่เอกสารใหม่ให้อัตโนมัติ

✅ **UX ดีขึ้น**
- ไม่ต้องกดปุ่ม Auto เพื่อ generate เลขที่เอกสาร
- เลขที่เอกสารจะถูกสร้างทันทีเมื่อเปิดฟอร์มใหม่

---

**หมายเหตุ**: หากคุณยังพบปัญหา กรุณาดูที่ [AUTO_DOCUMENT_NUMBER_GUIDE.md](AUTO_DOCUMENT_NUMBER_GUIDE.md) สำหรับรายละเอียดเพิ่มเติม

