# 🚀 วิธีย้ายข้อมูลแบบง่ายที่สุด (3 ขั้นตอน)

## ขั้นตอนที่ 1: ดาวน์โหลด Service Account Key (ครั้งเดียว)

### คลิกลิงก์นี้เพื่อเข้าหน้าดาวน์โหลดโดยตรง:
👉 https://console.firebase.google.com/project/ecertonline-29a67/settings/serviceaccounts/adminsdk

### ในหน้าเว็บ:
1. คลิกปุ่ม **"Generate new private key"** (สีน้ำเงิน)
2. คลิก **"Generate key"** ในหน้าต่างยืนยัน
3. ไฟล์ JSON จะดาวน์โหลดอัตโนมัติ (ชื่อประมาณ `ecertonline-29a67-xxxxx.json`)

### ย้ายไฟล์มาวางในโปรเจค:
```bash
cd /Users/macbooknow/Ecertdoc/pdfexportforDeliveryandCert
mv ~/Downloads/ecertonline-29a67-*.json scripts/serviceAccountKey.json
```

✅ **เสร็จขั้นตอนที่ 1!**

---

## ขั้นตอนที่ 2: ตรวจสอบข้อมูล

```bash
cd /Users/macbooknow/Ecertdoc/pdfexportforDeliveryandCert
npx ts-node scripts/check-firestore-admin.ts
```

**จะแสดง:**
- รายการ Users ทั้งหมด (จด User ID ไว้!)
- จำนวน Companies, Delivery Notes, Warranty Cards

**ตัวอย่าง Output:**
```
👤 รายการ Users ทั้งหมด:
1. sinanan.ac.th@gmail.com
   User ID: abc123xyz456    👈 จดตัวนี้ไว้!
```

✅ **เสร็จขั้นตอนที่ 2!**

---

## ขั้นตอนที่ 3: ย้ายข้อมูล

### วิธีที่ 1: ใช้ Email (แนะนำ)
```bash
USER_EMAIL=sinanan.ac.th@gmail.com npx ts-node scripts/migrate-to-nature-estate-admin.ts
```

### วิธีที่ 2: ใช้ User ID
```bash
USER_ID=abc123xyz456 npx ts-node scripts/migrate-to-nature-estate-admin.ts
```

**Script จะ:**
1. แสดงสถิติข้อมูลปัจจุบัน
2. สร้าง/หา Nature Estate Company
3. รอ 5 วินาที (กด Ctrl+C เพื่อยกเลิก)
4. ย้ายข้อมูลทั้งหมด
5. แสดงผลลัพธ์

✅ **เสร็จทุกขั้นตอน!**

---

## 🎉 ตรวจสอบผลลัพธ์

1. เปิดแอป: http://localhost:3000 (หรือ https://ecertonline-29a67.web.app)
2. Login ด้วย Google
3. เลือก Company: **Nature Estate**
4. เห็นข้อมูลทั้งหมดของคุณ!

---

## 🔒 ลบไฟล์ความลับหลังใช้งาน

```bash
rm scripts/serviceAccountKey.json
```

---

## 🆘 แก้ปัญหา

### ปัญหา: ไม่พบ serviceAccountKey.json
```bash
# ตรวจสอบว่ามีไฟล์หรือไม่
ls -la scripts/serviceAccountKey.json
```

ถ้าไม่มี ให้ทำขั้นตอนที่ 1 ใหม่

### ปัญหา: Cannot find module 'firebase-admin'
```bash
npm install --save-dev firebase-admin ts-node @types/node
```

### ปัญหา: Permission Denied
ให้แน่ใจว่า Service Account มีสิทธิ์ Owner หรือ Editor ใน Firebase Console

---

## 📝 สรุป 3 คำสั่งหลัก

```bash
# 1. ย้ายไฟล์ Service Account Key
mv ~/Downloads/ecertonline-29a67-*.json scripts/serviceAccountKey.json

# 2. ตรวจสอบข้อมูล (และจด User ID)
npx ts-node scripts/check-firestore-admin.ts

# 3. ย้ายข้อมูล
USER_EMAIL=sinanan.ac.th@gmail.com npx ts-node scripts/migrate-to-nature-estate-admin.ts
```

---

**หมายเหตุ:** ไฟล์ `serviceAccountKey.json` เป็นความลับมาก อย่าแชร์ให้ใคร และลบทิ้งหลังใช้งานเสร็จ!

