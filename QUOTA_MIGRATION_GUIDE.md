# 📋 คู่มือ Migration: สร้าง Quota สำหรับบริษัทที่มีอยู่แล้ว

## ⚠️ สถานการณ์

หากคุณมีบริษัทที่สร้างไว้แล้วก่อนที่จะมีระบบ Quota ระบบจะไม่มีข้อมูล quota สำหรับบริษัทเหล่านั้น

ตัวอย่าง:
```
🏢 บริษัททั้งหมด (1) 
- NATURE ESTATE ✅

💎 โควตาและแผนการใช้งาน (0)
- ไม่มีข้อมูล ❌
```

## 🔧 วิธีแก้ไข

มี 2 วิธีในการสร้าง quota ให้กับบริษัทที่มีอยู่แล้ว:

---

## วิธีที่ 1: รัน Migration Script (แนะนำ) ⭐

### ขั้นตอน:

#### 1. ติดตั้ง `tsx` (ถ้ายังไม่มี)

```bash
npm install -D tsx
```

#### 2. รัน Migration Script

```bash
npm run migrate:quotas
```

หรือ

```bash
tsx scripts/create-default-quotas.ts
```

### ผลลัพธ์ที่คาดหวัง:

```
🚀 เริ่มต้น Migration: สร้าง Default Quota สำหรับบริษัททั้งหมด

📋 กำลังดึงรายการบริษัททั้งหมด...
✅ พบบริษัททั้งหมด: 1 บริษัท

🔍 กำลังตรวจสอบ quota ที่มีอยู่แล้ว...
📊 พบ quota ที่มีอยู่แล้ว: 0 quota

💾 กำลังสร้าง quota...

✅ สร้างสำเร็จ: NATURE ESTATE (xxxxx) - Free Plan

==================================================
📊 สรุปผลลัพธ์:
==================================================
📦 บริษัททั้งหมด:     1 บริษัท
✅ สร้างสำเร็จ:        1 quota
⏭️  ข้าม (มีอยู่แล้ว): 0 quota
❌ ล้มเหลว:           0 quota
==================================================

🎉 Migration สำเร็จ! ตอนนี้สามารถดู quota ใน Super Admin Dashboard ได้แล้ว

✅ Script เสร็จสิ้น
```

#### 3. รีเฟรช Super Admin Dashboard

- กลับไปที่ Super Admin Dashboard
- คลิกแท็บ **"💎 โควตา & แผน"**
- จะเห็นข้อมูล quota ของบริษัทแสดงขึ้นมา

---

## วิธีที่ 2: สร้างอัตโนมัติเมื่อสร้างบริษัทใหม่

**หมายเหตุ:** วิธีนี้ใช้ได้เฉพาะบริษัทใหม่ที่สร้างหลังจากอัปเดตโค้ด

ระบบได้อัปเดตฟังก์ชัน `createCompany()` แล้ว เมื่อมีการสร้างบริษัทใหม่จะสร้าง quota ให้อัตโนมัติ

```typescript
// services/companies.ts (อัปเดตแล้ว)
export const createCompany = async (company) => {
    // ... สร้างบริษัท
    
    // สร้าง quota เริ่มต้น (Free Plan) อัตโนมัติ ✨
    await createQuota(companyId, 'free');
    
    return companyId;
};
```

---

## 📊 Default Quota (Free Plan)

บริษัทที่ถูกสร้างใหม่จะได้รับ quota ดังนี้:

| รายการ | ค่าเริ่มต้น |
|--------|------------|
| 👥 ผู้ใช้งานสูงสุด | 3 คน |
| 📄 เอกสารต่อเดือน | 50 เอกสาร |
| 🎨 โลโก้ | 1 โลโก้ |
| 💾 Storage | 100 MB |
| ✨ Features | Export PDF เท่านั้น |
| 💰 ราคา | ฟรี |

---

## ✅ การตรวจสอบว่า Migration สำเร็จ

### 1. ตรวจสอบใน Super Admin Dashboard

เข้าไปที่:
```
Super Admin Dashboard → แท็บ "💎 โควตา & แผน"
```

ควรเห็น:
```
💎 โควตาและแผนการใช้งาน (1)

📊 แผนทั้งหมด:
Free: 1 | Basic: 0 | Premium: 0 | Enterprise: 0

บริษัท: NATURE ESTATE
แผน: FREE
สถานะ: ✅ Active
ผู้ใช้: 0 / 3
เอกสาร/เดือน: 0 / 50
โลโก้: 0 / 1
Storage: 0 / 100 MB
```

### 2. ตรวจสอบใน Firebase Console

1. เข้า Firebase Console
2. ไปที่ Firestore Database
3. เปิด Collection `companyQuotas`
4. ควรเห็น Document ที่มี ID ตรงกับ Company ID

---

## 🚨 Troubleshooting

### ปัญหา: Script ล้มเหลว

**วิธีแก้:**
1. ตรวจสอบว่าติดตั้ง `tsx` แล้ว
2. ตรวจสอบว่า Firebase Config ถูกต้อง
3. ตรวจสอบสิทธิ์ Firestore Rules

### ปัญหา: ยังไม่เห็นข้อมูล quota

**วิธีแก้:**
1. รีเฟรชหน้า Browser (Ctrl+F5 หรือ Cmd+Shift+R)
2. ตรวจสอบ Console ว่ามี error หรือไม่
3. ตรวจสอบ Firestore Database ว่ามีข้อมูลจริง

### ปัญหา: Permission Denied

**วิธีแก้:**
ตรวจสอบ Firestore Rules ว่ามี rules สำหรับ `companyQuotas`:

```javascript
// firestore.rules
match /companyQuotas/{companyId} {
  allow read: if isAuthenticated() && (
    isSuperAdmin() ||
    isMemberOfCompany(companyId)
  );
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && isSuperAdmin();
  allow delete: if isAuthenticated() && isSuperAdmin();
}
```

---

## 📝 หมายเหตุเพิ่มเติม

1. **สำหรับบริษัทเดิม:** ใช้ Migration Script (วิธีที่ 1)
2. **สำหรับบริษัทใหม่:** ระบบจะสร้าง quota อัตโนมัติ (วิธีที่ 2)
3. **ความปลอดภัย:** Script ไม่ลบข้อมูลใดๆ เพียงแค่สร้าง quota ใหม่
4. **การรัน Script ซ้ำ:** สามารถรันได้หลายครั้ง script จะข้ามบริษัทที่มี quota แล้ว

---

## 🎯 ขั้นตอนที่แนะนำ

1. ✅ รัน Migration Script เพื่อสร้าง quota ให้บริษัทที่มีอยู่
2. ✅ Deploy โค้ดใหม่ที่มีการสร้าง quota อัตโนมัติ
3. ✅ ตรวจสอบผลลัพธ์ใน Super Admin Dashboard
4. ✅ บริษัทใหม่จะได้รับ quota อัตโนมัติ

---

## 📞 ติดต่อ

หากพบปัญหาหรือมีคำถาม กรุณาติดต่อ Super Admin

---

เอกสารนี้สร้างโดย: System
วันที่อัปเดตล่าสุด: 30 ตุลาคม 2025

