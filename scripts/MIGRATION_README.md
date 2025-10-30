# 🔄 Firestore Data Migration Scripts

คู่มือสำหรับการตรวจสอบและย้ายข้อมูล Firestore ไปยัง Nature Estate Company

## 📋 สารบัญ

1. [ภาพรวม](#ภาพรวม)
2. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
3. [การติดตั้ง](#การติดตั้ง)
4. [Scripts ที่มี](#scripts-ที่มี)
5. [วิธีใช้งาน](#วิธีใช้งาน)
6. [คำเตือน](#คำเตือน)

---

## 🎯 ภาพรวม

Scripts เหล่านี้ช่วยในการ:
- ✅ ตรวจสอบข้อมูลใน Firestore ทั้งหมด
- ✅ ย้ายข้อมูล Delivery Notes และ Warranty Cards ไปยัง Nature Estate Company
- ✅ สร้าง Nature Estate Company อัตโนมัติถ้ายังไม่มี

---

## 📦 ข้อกำหนดเบื้องต้น

1. **Node.js และ npm** ติดตั้งแล้ว
2. **TypeScript** สำหรับรัน ts-node
3. **Firebase Account** พร้อม Email และ Password สำหรับ Login
4. **สิทธิ์เข้าถึง Firestore** ของ Project

---

## 🔧 การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
cd /Users/macbooknow/Ecertdoc/pdfexportforDeliveryandCert
npm install
```

### 2. ติดตั้ง ts-node (ถ้ายังไม่มี)

```bash
npm install -g ts-node
# หรือ
npm install --save-dev ts-node
```

---

## 🛠️ Scripts ที่มี

### 1. `check-firestore-data.ts`
**วัตถุประสงค์:** ตรวจสอบข้อมูลใน Firestore (ไม่แก้ไขข้อมูล)

**แสดงข้อมูล:**
- 📁 Companies ทั้งหมด
- 👥 Company Members
- 📦 Delivery Notes (แบ่งตาม Company)
- 🛡️ Warranty Cards (แบ่งตาม Company)
- 📊 สรุปจำนวนข้อมูล

### 2. `migrate-to-nature-estate.ts`
**วัตถุประสงค์:** ย้ายข้อมูลทั้งหมดไปยัง Nature Estate Company

**การทำงาน:**
1. ค้นหา Nature Estate Company (หรือสร้างใหม่ถ้ายังไม่มี)
2. อัปเดต `companyId` ของ Delivery Notes ทั้งหมด
3. อัปเดต `companyId` ของ Warranty Cards ทั้งหมด
4. แสดงสถิติก่อนและหลัง Migration

---

## 🚀 วิธีใช้งาน

### ขั้นตอนที่ 1: ตรวจสอบข้อมูลก่อน

```bash
FIREBASE_EMAIL=your@email.com FIREBASE_PASSWORD=yourpassword npx ts-node scripts/check-firestore-data.ts
```

**Output ตัวอย่าง:**
```
🔍 ตรวจสอบข้อมูล Firestore
================================================================================
🔐 กำลัง Login ด้วย: your@email.com
✅ Login สำเร็จ (User ID: abc123...)

📊 สรุปข้อมูลทั้งหมด:
================================================================================
📁 Companies: 3 องค์กร
👥 Company Members: 5 สมาชิก
📦 Delivery Notes: 25 รายการ
🛡️ Warranty Cards: 40 รายการ
================================================================================

📁 ตรวจสอบ Companies:
================================================================================
พบทั้งหมด: 3 องค์กร

1. บริษัท ABC
   ID: comp_abc123
   ...
```

### ขั้นตอนที่ 2: ย้ายข้อมูล (หลังจากตรวจสอบแล้ว)

```bash
FIREBASE_EMAIL=your@email.com FIREBASE_PASSWORD=yourpassword npx ts-node scripts/migrate-to-nature-estate.ts
```

**Output ตัวอย่าง:**
```
🚀 เริ่มต้น Migration Script
============================================================

🔐 กำลัง Login ด้วย: your@email.com
✅ Login สำเร็จ (User ID: abc123...)

📊 สถิติข้อมูลปัจจุบัน:
   📁 Companies: 2 องค์กร
      - บริษัท ABC (ID: comp1, Members: 2)
      - บริษัท XYZ (ID: comp2, Members: 3)
   📦 Delivery Notes: 25 รายการ
      - comp1: 15 รายการ
      - ไม่มี company: 10 รายการ
   🛡️ Warranty Cards: 40 รายการ
      - comp2: 25 รายการ
      - ไม่มี company: 15 รายการ

🔍 ค้นหา Nature Estate Company...
📝 ไม่พบ Nature Estate, กำลังสร้างใหม่...
✅ สร้าง Nature Estate สำเร็จ (ID: nature123)

⚠️  คุณต้องการย้ายข้อมูลทั้งหมดไปยัง Nature Estate หรือไม่?
   กด Ctrl+C เพื่อยกเลิก หรือรอ 5 วินาทีเพื่อดำเนินการต่อ...

🔄 เริ่มต้น Migration...
============================================================

📦 กำลังย้าย Delivery Notes...
✅ ย้าย Delivery Note: 251009_DN-001 (DN-2025-001)
✅ ย้าย Delivery Note: 251009_DN-002 (DN-2025-002)
...
✅ ย้าย Delivery Notes เรียบร้อย: 25 รายการ

🛡️ กำลังย้าย Warranty Cards...
✅ ย้าย Warranty Card: 251010_A01 (WR-2025-001)
✅ ย้าย Warranty Card: 251010_B02 (WR-2025-002)
...
✅ ย้าย Warranty Cards เรียบร้อย: 40 รายการ

============================================================
✅ Migration เสร็จสิ้น!
   📦 ย้าย Delivery Notes: 25 รายการ
   🛡️ Warranty Cards: 40 รายการ
   🎯 ปลายทาง: Nature Estate (ID: nature123)
============================================================
```

---

## ⚠️ คำเตือน

### ⚠️ สำคัญมาก!

1. **สำรองข้อมูลก่อน:** ควร export ข้อมูลจาก Firestore ก่อนทำ Migration
2. **ตรวจสอบก่อนย้าย:** รัน `check-firestore-data.ts` ก่อนเสมอ
3. **มีเวลาหยุด 5 วินาที:** Script จะรอ 5 วินาทีก่อนเริ่มย้าย (กด Ctrl+C เพื่อยกเลิก)
4. **ข้อมูลที่อยู่ใน Nature Estate แล้วจะถูกข้าม:** Script จะไม่ย้ายข้อมูลที่มี companyId เป็น Nature Estate อยู่แล้ว

### 🔒 ความปลอดภัย

- **ไม่ควรเก็บ Email/Password ในไฟล์:** ใช้ environment variables เท่านั้น
- **ใช้ในสภาพแวดล้อมปลอดภัย:** ไม่ควรรันใน production server โดยตรง
- **ตรวจสอบสิทธิ์:** ให้แน่ใจว่า account มีสิทธิ์เข้าถึงข้อมูลทั้งหมด

---

## 🔍 การแก้ปัญหา

### ปัญหา: ไม่สามารถ Login ได้

**วิธีแก้:**
1. ตรวจสอบว่า Email และ Password ถูกต้อง
2. ตรวจสอบว่า Firebase Authentication เปิดใช้งาน Email/Password
3. ตรวจสอบ Firestore Rules ว่าอนุญาตให้เข้าถึงข้อมูล

### ปัญหา: Permission Denied

**วิธีแก้:**
1. ตรวจสอบ Firestore Security Rules
2. ให้แน่ใจว่า User มีสิทธิ์เข้าถึง collection ที่ต้องการ

### ปัญหา: ts-node: command not found

**วิธีแก้:**
```bash
npm install -g ts-node
# หรือใช้แบบ local
npx ts-node scripts/check-firestore-data.ts
```

---

## 📝 ตัวอย่างการใช้งานแบบเต็ม

```bash
# 1. ไปยัง directory
cd /Users/macbooknow/Ecertdoc/pdfexportforDeliveryandCert

# 2. ตรวจสอบข้อมูลก่อน
FIREBASE_EMAIL=admin@naturestate.com FIREBASE_PASSWORD=mypassword123 \
  npx ts-node scripts/check-firestore-data.ts

# 3. ถ้าข้อมูลถูกต้อง ให้ทำ Migration
FIREBASE_EMAIL=admin@naturestate.com FIREBASE_PASSWORD=mypassword123 \
  npx ts-node scripts/migrate-to-nature-estate.ts

# 4. ตรวจสอบข้อมูลอีกครั้งหลัง Migration
FIREBASE_EMAIL=admin@naturestate.com FIREBASE_PASSWORD=mypassword123 \
  npx ts-node scripts/check-firestore-data.ts
```

---

## 🎉 เสร็จสิ้น

หลังจาก Migration เสร็จสิ้น:
- ✅ ข้อมูลทั้งหมดจะอยู่ใน Nature Estate Company
- ✅ ระบบจะแสดงเฉพาะข้อมูลของ Nature Estate เมื่อเลือก Company นั้น
- ✅ ข้อมูลเก่ายังคงความสมบูรณ์ (เปลี่ยนแค่ companyId)

---

## 🆘 ต้องการความช่วยเหลือ?

หากพบปัญหาหรือต้องการคำแนะนำเพิ่มเติม กรุณาติดต่อผู้พัฒนาระบบ

---

**Last Updated:** 2025-10-11
**Version:** 1.0.0

