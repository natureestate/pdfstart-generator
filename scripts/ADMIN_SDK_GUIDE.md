# 🔐 Firebase Admin SDK Migration Guide

คู่มือสำหรับย้ายข้อมูล Firestore โดยใช้ Firebase Admin SDK (สำหรับผู้ที่ Login ด้วย Google)

---

## 🎯 ภาพรวม

Scripts นี้เหมาะสำหรับ:
- ✅ ผู้ที่ Login Firebase ด้วย **Google Account**
- ✅ ไม่ต้องใช้ Email/Password
- ✅ ปลอดภัยกว่าเพราะใช้ Service Account
- ✅ สามารถเข้าถึงข้อมูลทั้งหมดโดยไม่จำกัด

---

## 📋 ขั้นตอนการเตรียมการ

### ขั้นตอนที่ 1: ดาวน์โหลด Service Account Key

1. เปิด [Firebase Console](https://console.firebase.google.com/)
2. เลือก Project: **ecertonline-29a67**
3. คลิกไอคอน ⚙️ (Settings) > **Project settings**
4. ไปที่แท็บ **Service accounts**
5. คลิกปุ่ม **"Generate new private key"**
6. คลิก **"Generate key"** เพื่อดาวน์โหลดไฟล์ JSON

![Firebase Service Account](https://firebase.google.com/static/docs/admin/setup-node-admin-sdk.png)

### ขั้นตอนที่ 2: วางไฟล์ Service Account Key

```bash
# ย้ายไฟล์ที่ดาวน์โหลดมาไว้ที่ scripts/
cd /Users/macbooknow/Ecertdoc/pdfexportforDeliveryandCert
mv ~/Downloads/ecertonline-29a67-*.json scripts/serviceAccountKey.json
```

**⚠️ สำคัญ:** ไฟล์นี้เป็นความลับ! อย่า commit ขึ้น Git

### ขั้นตอนที่ 3: เพิ่มไฟล์ลง .gitignore

```bash
echo "scripts/serviceAccountKey.json" >> .gitignore
```

---

## 🔍 ขั้นตอนที่ 1: ตรวจสอบข้อมูล

### 1.1 หา User ID ของคุณ

```bash
cd /Users/macbooknow/Ecertdoc/pdfexportforDeliveryandCert
npx ts-node scripts/check-firestore-admin.ts
```

**Output จะแสดง:**
```
👤 รายการ Users ทั้งหมด:
================================================================================
1. admin@naturestate.com
   User ID: abc123xyz456
   Display Name: Admin User
   Provider: google.com
   Created: 2024-01-01
```

**📝 จดบันทึก User ID ของคุณ!** (เช่น `abc123xyz456`)

### 1.2 ตรวจสอบข้อมูลแบบละเอียด

**วิธีที่ 1: ใช้ User ID**
```bash
USER_ID=abc123xyz456 npx ts-node scripts/check-firestore-admin.ts
```

**วิธีที่ 2: ใช้ Email (จะหา User ID อัตโนมัติ)**
```bash
USER_EMAIL=admin@naturestate.com npx ts-node scripts/check-firestore-admin.ts
```

**Output ตัวอย่าง:**
```
🔍 ตรวจสอบข้อมูล Firestore (Firebase Admin SDK)
================================================================================
🔍 ค้นหา User ID จาก Email: admin@naturestate.com
✅ พบ User ID: abc123xyz456

🎯 กำลังตรวจสอบข้อมูลของ User ID: abc123xyz456

📊 สรุปข้อมูลทั้งหมด:
================================================================================
📁 Companies: 2 องค์กร
👥 Company Members: 3 สมาชิก
📦 Delivery Notes: 25 รายการ (ของ User นี้)
🛡️  Warranty Cards: 40 รายการ (ของ User นี้)
================================================================================

📁 ตรวจสอบ Companies:
================================================================================
พบทั้งหมด: 2 องค์กร

1. บริษัท ABC
   ID: comp_abc123
   Address: 123 ถนนสุขุมวิท กรุงเทพ
   User ID: abc123xyz456
   Members: 2
   Logo Type: custom
   Created: 1/10/2024, 10:00:00

2. บริษัท XYZ
   ID: comp_xyz789
   ...

📦 ตรวจสอบ Delivery Notes:
================================================================================
พบทั้งหมด: 25 รายการ

Company ID: comp_abc123
จำนวน: 15 รายการ

   1. DN-2025-001
      โครงการ: โครงการ A
      จาก: บริษัท ABC
      ถึง: บริษัท XYZ
      วันที่: 9/10/2025
   ...

Company ID: ไม่มี company
จำนวน: 10 รายการ
   ...
```

---

## 🚀 ขั้นตอนที่ 2: ย้ายข้อมูล

### ⚠️ อ่านก่อนย้าย!

1. **สำรองข้อมูล** - Export ข้อมูลจาก Firebase Console ก่อน
2. **ตรวจสอบข้อมูล** - รันขั้นตอนที่ 1 ให้เรียบร้อยก่อน
3. **มีเวลาหยุด 5 วินาที** - สามารถกด Ctrl+C เพื่อยกเลิกได้

### 2.1 รัน Migration Script

**วิธีที่ 1: ใช้ User ID**
```bash
USER_ID=abc123xyz456 npx ts-node scripts/migrate-to-nature-estate-admin.ts
```

**วิธีที่ 2: ใช้ Email**
```bash
USER_EMAIL=admin@naturestate.com npx ts-node scripts/migrate-to-nature-estate-admin.ts
```

### 2.2 ตัวอย่าง Output

```
🚀 เริ่มต้น Migration Script (Firebase Admin SDK)
============================================================

🔍 ค้นหา User ID จาก Email: admin@naturestate.com
✅ พบ User ID: abc123xyz456

🎯 กำลัง Migrate ข้อมูลของ User ID: abc123xyz456

📊 สถิติข้อมูลปัจจุบัน:
   📁 Companies: 2 องค์กร
      - บริษัท ABC (ID: comp1, Members: 2)
      - บริษัท XYZ (ID: comp2, Members: 3)
   📦 Delivery Notes: 25 รายการ
      - comp1: 15 รายการ
      - ไม่มี company: 10 รายการ
   🛡️  Warranty Cards: 40 รายการ
      - comp2: 25 รายการ
      - ไม่มี company: 15 รายการ
   👥 Company Members: 3 รายการ

🔍 ค้นหา Nature Estate Company...
📝 ไม่พบ Nature Estate, กำลังสร้างใหม่...
✅ สร้าง Nature Estate สำเร็จ (ID: nature_estate_123)

⚠️  คุณต้องการย้ายข้อมูลทั้งหมดไปยัง Nature Estate หรือไม่?
   กด Ctrl+C เพื่อยกเลิก หรือรอ 5 วินาทีเพื่อดำเนินการต่อ...

🔄 เริ่มต้น Migration...
============================================================

📦 กำลังย้าย Delivery Notes...
✅ ย้าย Delivery Note: 251009_DN-001 (DN-2025-001)
✅ ย้าย Delivery Note: 251009_DN-002 (DN-2025-002)
✅ ย้าย Delivery Note: 251009_DN-003 (DN-2025-003)
...
✅ ย้าย Delivery Notes เรียบร้อย: 25 รายการ

🛡️  กำลังย้าย Warranty Cards...
✅ ย้าย Warranty Card: 251010_A01 (WR-2025-001)
✅ ย้าย Warranty Card: 251010_B02 (WR-2025-002)
✅ ย้าย Warranty Card: 251010_C03 (WR-2025-003)
...
✅ ย้าย Warranty Cards เรียบร้อย: 40 รายการ

============================================================
📊 สถิติข้อมูลหลัง Migration:
   📁 Companies: 3 องค์กร
      - บริษัท ABC (ID: comp1, Members: 2)
      - บริษัท XYZ (ID: comp2, Members: 3)
      - Nature Estate (ID: nature_estate_123, Members: 1)
   📦 Delivery Notes: 25 รายการ
      - nature_estate_123: 25 รายการ
   🛡️  Warranty Cards: 40 รายการ
      - nature_estate_123: 40 รายการ
   👥 Company Members: 4 รายการ

============================================================
✅ Migration เสร็จสิ้น!
   📦 ย้าย Delivery Notes: 25 รายการ
   🛡️  ย้าย Warranty Cards: 40 รายการ
   🎯 ปลายทาง: Nature Estate (ID: nature_estate_123)
============================================================
```

---

## ✅ ขั้นตอนที่ 3: ตรวจสอบหลัง Migration

```bash
USER_EMAIL=admin@naturestate.com npx ts-node scripts/check-firestore-admin.ts
```

ตรวจสอบว่า:
- ✅ ข้อมูลทั้งหมดอยู่ใน Nature Estate
- ✅ จำนวนข้อมูลตรงกับก่อน Migration
- ✅ ไม่มีข้อมูลสูญหาย

---

## 🔒 ความปลอดภัย

### ⚠️ คำเตือนสำคัญ!

1. **ไฟล์ serviceAccountKey.json เป็นความลับสุดยอด!**
   - ห้าม commit ขึ้น Git
   - ห้ามแชร์ให้ใคร
   - ลบทิ้งหลังใช้งานเสร็จ

2. **สิทธิ์เข้าถึง**
   - Service Account มีสิทธิ์เข้าถึงทุกอย่างใน Firebase
   - ใช้เฉพาะในเครื่องที่ปลอดภัย

3. **การจัดเก็บ**
   ```bash
   # ลบไฟล์หลังใช้งานเสร็จ
   rm scripts/serviceAccountKey.json
   
   # หรือเก็บไว้ในที่ปลอดภัย
   mv scripts/serviceAccountKey.json ~/Documents/firebase-keys/
   ```

---

## 🔧 การแก้ปัญหา

### ปัญหา: ไม่พบ serviceAccountKey.json

**วิธีแก้:**
```bash
# ตรวจสอบว่าไฟล์อยู่ที่ไหน
ls -la scripts/serviceAccountKey.json

# ถ้าไม่มี ให้ดาวน์โหลดใหม่ตามขั้นตอนที่ 1
```

### ปัญหา: Cannot find module 'firebase-admin'

**วิธีแก้:**
```bash
npm install --save-dev firebase-admin ts-node @types/node
```

### ปัญหา: Permission Denied

**วิธีแก้:**
1. ตรวจสอบ Firestore Security Rules
2. Service Account ต้องมีสิทธิ์ Owner หรือ Editor

### ปัญหา: ไม่พบ User

**วิธีแก้:**
```bash
# รันโดยไม่ระบุ USER_ID เพื่อดูรายการ Users
npx ts-node scripts/check-firestore-admin.ts

# จดบันทึก User ID ที่ถูกต้อง แล้วรันใหม่
USER_ID=correct-user-id npx ts-node scripts/check-firestore-admin.ts
```

---

## 📝 คำสั่งสำคัญสรุป

### ตรวจสอบข้อมูล
```bash
# ดูรายการ Users ทั้งหมด
npx ts-node scripts/check-firestore-admin.ts

# ดูข้อมูลของ User เฉพาะคน (ใช้ Email)
USER_EMAIL=your@email.com npx ts-node scripts/check-firestore-admin.ts

# ดูข้อมูลของ User เฉพาะคน (ใช้ User ID)
USER_ID=your-user-id npx ts-node scripts/check-firestore-admin.ts
```

### ย้ายข้อมูล
```bash
# ย้ายข้อมูล (ใช้ Email)
USER_EMAIL=your@email.com npx ts-node scripts/migrate-to-nature-estate-admin.ts

# ย้ายข้อมูล (ใช้ User ID)
USER_ID=your-user-id npx ts-node scripts/migrate-to-nature-estate-admin.ts
```

---

## 🎉 เสร็จสิ้น!

หลังจาก Migration เสร็จ:
1. ✅ เปิดแอปใน Browser
2. ✅ Login ด้วย Google Account
3. ✅ เลือก Company เป็น **Nature Estate**
4. ✅ ตรวจสอบว่าข้อมูลแสดงครบถ้วน

---

## 🆘 ต้องการความช่วยเหลือ?

ถ้ามีปัญหาหรือข้อสงสัย:
1. อ่านส่วน **การแก้ปัญหา** ด้านบน
2. ตรวจสอบ Error message ใน Console
3. ติดต่อผู้พัฒนาระบบ

---

**Last Updated:** 2025-10-11  
**Version:** 1.0.0 (Admin SDK Edition)

