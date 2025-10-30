# Firebase Storage CORS Configuration Guide

## ปัญหา
โลโก้จาก Firebase Storage โหลดไม่ขึ้นเพราะ CORS (Cross-Origin Resource Sharing) ไม่ได้ตั้งค่า

## วิธีแก้ไข

### ขั้นตอนที่ 1: ติดตั้ง Google Cloud SDK (ถ้ายังไม่มี)

**macOS:**
```bash
brew install --cask google-cloud-sdk
```

**หรือดาวน์โหลดจาก:**
https://cloud.google.com/sdk/docs/install

### ขั้นตอนที่ 2: Login เข้า Google Cloud

```bash
gcloud auth login
```

### ขั้นตอนที่ 3: ตั้งค่า Project

```bash
gcloud config set project ecertonline-29a67
```

### ขั้นตอนที่ 4: ตั้งค่า CORS

```bash
gsutil cors set cors.json gs://ecertonline-29a67.firebasestorage.app
```

### ขั้นตอนที่ 5: ตรวจสอบ CORS Configuration

```bash
gsutil cors get gs://ecertonline-29a67.firebasestorage.app
```

## ไฟล์ cors.json

ไฟล์ `cors.json` ที่สร้างไว้แล้ว:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

**คำอธิบาย:**
- `origin: ["*"]` - อนุญาตทุก domain (สำหรับ production ควรระบุ domain ที่ชัดเจน)
- `method: ["GET", "HEAD"]` - อนุญาตเฉพาะการอ่านข้อมูล
- `maxAgeSeconds: 3600` - Cache CORS preflight request 1 ชั่วโมง

## หมายเหตุ

### สำหรับ Production
ควรเปลี่ยน `origin: ["*"]` เป็น:
```json
{
  "origin": ["https://ecertonline-29a67.web.app", "https://ecertonline-29a67.firebaseapp.com"],
  "method": ["GET", "HEAD"],
  "maxAgeSeconds": 3600
}
```

### ตรวจสอบว่า CORS ทำงานหรือไม่

เปิด Browser Console (F12) และดู Network tab:
- ถ้ามี error `CORS policy` = ยังไม่ได้ตั้งค่า CORS
- ถ้าโหลดได้ปกติ = CORS ตั้งค่าถูกต้องแล้ว

## ทางเลือกอื่น (ไม่แนะนำ)

ถ้าไม่สามารถใช้ `gsutil` ได้ สามารถตั้งค่าผ่าน Firebase Console:
1. ไปที่ https://console.firebase.google.com/project/ecertonline-29a67/storage
2. คลิกที่ bucket `ecertonline-29a67.firebasestorage.app`
3. ไปที่ "Rules" tab
4. ตรวจสอบว่า `allow read: if true;` สำหรับ `/logos/{fileName}`

แต่การตั้งค่า CORS ต้องใช้ `gsutil` เท่านั้น

## อ้างอิง
- https://firebase.google.com/docs/storage/web/download-files#cors_configuration
- https://cloud.google.com/storage/docs/configuring-cors

