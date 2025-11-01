# 🎯 คู่มือ Dynamic Plan Templates

## 📋 ภาพรวม

ตอนนี้ระบบ Quota & Plan เป็น **Dynamic** แล้ว! ไม่ต้องแก้ code สามารถแก้ไขแผนการใช้งานได้ผ่าน Firestore โดยตรงค่ะ

---

## 🏗️ โครงสร้างใหม่

### 1. Plan Templates (`planTemplates` collection)
เก็บ template ของแต่ละแผน - **แก้ไขได้!**

### 2. Company Quotas (`companyQuotas` collection)  
ข้อมูล quota ของแต่ละบริษัท - สร้างจาก Plan Templates

---

## 🚀 วิธีใช้งาน

### ขั้นตอนที่ 1: Initialize Plan Templates

รันคำสั่งนี้ใน Browser Console (ที่ Super Admin Dashboard):

```javascript
import { initializePlanTemplates } from '../services/planTemplates';

// Initialize Plan Templates ครั้งแรก
await initializePlanTemplates();

// ผลลัพธ์:
// 🚀 กำลัง Initialize Plan Templates...
// ✅ สร้าง template: 🆓 Free
// ✅ สร้าง template: 💼 Basic
// ✅ สร้าง template: 💎 Premium  
// ✅ สร้าง template: 🏢 Enterprise
// ✅ Initialize Plan Templates เสร็จสิ้น
```

### ขั้นตอนที่ 2: ตรวจสอบ Plan Templates

ไปที่ Firebase Console → Firestore Database → Collection `planTemplates`

จะเห็น 4 documents:
- `free`
- `basic`
- `premium`
- `enterprise`

### ขั้นตอนที่ 3: แก้ไข Plan Template

สามารถแก้ไขได้ 2 วิธี:

#### วิธีที่ 1: ผ่าน Firebase Console (ง่ายที่สุด) ⭐

1. เข้า Firebase Console
2. ไปที่ Firestore Database
3. เปิด Collection `planTemplates`
4. คลิกที่ Plan ที่ต้องการแก้ (เช่น `basic`)
5. แก้ไขค่าที่ต้องการ:
   - `maxUsers`: จำนวนผู้ใช้สูงสุด
   - `maxDocuments`: จำนวนเอกสารต่อเดือน
   - `maxLogos`: จำนวนโลโก้
   - `maxStorageMB`: พื้นที่ Storage (MB)
   - `price`: ราคาต่อเดือน
   - `features.*`: เปิด/ปิด features ต่างๆ
6. คลิก **Save**

#### วิธีที่ 2: ผ่าน Code

```javascript
import { updatePlanTemplate } from '../services/planTemplates';

// อัปเดต Basic Plan
await updatePlanTemplate('basic', {
    maxUsers: 15,           // เปลี่ยนจาก 10 เป็น 15
    maxDocuments: 300,      // เปลี่ยนจาก 200 เป็น 300
    price: 399,             // เปลี่ยนราคาเป็น 399 บาท
}, 'USER_ID');

console.log('✅ อัปเดต Basic Plan สำเร็จ!');
```

---

## 📊 โครงสร้าง Plan Template

```javascript
{
    id: 'basic',
    name: '💼 Basic',
    description: 'สำหรับธุรกิจขนาดเล็ก',
    
    // โควตา
    maxUsers: 10,                 // จำนวนผู้ใช้ (-1 = ไม่จำกัด)
    maxDocuments: 200,            // เอกสารต่อเดือน (-1 = ไม่จำกัด)
    maxLogos: 5,                  // จำนวนโลโก้ (-1 = ไม่จำกัด)
    maxStorageMB: 500,            // Storage MB (-1 = ไม่จำกัด)
    allowCustomLogo: true,        // อนุญาตโลโก้กำหนดเอง
    
    // Features
    features: {
        multipleProfiles: true,
        apiAccess: false,
        customDomain: false,
        prioritySupport: false,
        exportPDF: true,
        exportExcel: true,
        advancedReports: false,
        customTemplates: true,
    },
    
    // ราคา
    price: 299,                   // ราคาต่อเดือน (0 = ฟรี)
    currency: 'THB',              // สกุลเงิน
    
    // UI
    displayOrder: 2,              // ลำดับการแสดง
    isActive: true,               // เปิดใช้งาน
    isPopular: false,             // แผนยอดนิยม
    color: '#3B82F6',             // สี
    
    // Metadata
    createdAt: Timestamp,
    updatedAt: Timestamp,
    updatedBy: 'USER_ID'
}
```

---

## 🎨 ตัวอย่างการแก้ไข

### ตัวอย่างที่ 1: เพิ่มโควตา Free Plan

```javascript
// ไปที่ Firebase Console → planTemplates → free
// แก้ไขค่า:
maxUsers: 5          // เปลี่ยนจาก 3 เป็น 5
maxDocuments: 100    // เปลี่ยนจาก 50 เป็น 100
```

**ผลลัพธ์:** บริษัทที่สร้างใหม่จะได้ quota ตามค่าใหม่ทันที!

### ตัวอย่างที่ 2: เปลี่ยนราคา Premium Plan

```javascript
// ไปที่ Firebase Console → planTemplates → premium
// แก้ไขค่า:
price: 1299          // เปลี่ยนจาก 999 เป็น 1299 บาท
```

### ตัวอย่างที่ 3: เพิ่ม Feature ใน Basic Plan

```javascript
// ไปที่ Firebase Console → planTemplates → basic → features
// แก้ไขค่า:
apiAccess: true      // เปลี่ยนจาก false เป็น true
```

---

## 🔄 การทำงานของระบบ

### เมื่อสร้างบริษัทใหม่:

```
1. สร้างบริษัท
        ↓
2. เรียก createQuota(companyId, 'free')
        ↓
3. ดึง Plan Template 'free' จาก Firestore
        ↓
4. สร้าง Quota ตาม Template ล่าสุด ✨
        ↓
5. บันทึกลง companyQuotas collection
```

### เมื่อแก้ไข Plan Template:

```
1. แก้ไข planTemplates/basic
        ↓
2. บริษัทใหม่ที่สร้างหลังจากนี้
   จะได้ quota ตามค่าใหม่ ✨
        ↓
3. บริษัทเดิมยังใช้ quota เดิม
   (ถ้าต้องการอัปเดตต้องเปลี่ยนแผนใหม่)
```

---

## 📝 API Functions

### 1. `initializePlanTemplates()`
สร้าง Plan Templates ทั้งหมด (ใช้ครั้งแรกเท่านั้น)

### 2. `getAllPlanTemplates()`
ดึง Plan Templates ทั้งหมด (เรียงตาม displayOrder)

```javascript
const templates = await getAllPlanTemplates();
// [Free, Basic, Premium, Enterprise]
```

### 3. `getPlanTemplate(planId)`
ดึง Plan Template เฉพาะแผน

```javascript
const basic = await getPlanTemplate('basic');
console.log(basic.price); // 299
```

### 4. `updatePlanTemplate(planId, updates, updatedBy)`
อัปเดต Plan Template

```javascript
await updatePlanTemplate('premium', {
    maxUsers: 100,
    price: 1499,
}, user.uid);
```

### 5. `deletePlanTemplate(planId)`
ลบ Plan Template (ใช้ด้วยความระมัดระวัง!)

---

## ✅ ข้อดีของระบบ Dynamic

### 1. ไม่ต้องแก้ Code ✨
แก้แผนผ่าน Firebase Console ได้เลย ไม่ต้อง deploy ใหม่!

### 2. ยืดหยุ่น 🎯
- เพิ่มโควตาได้ทันที
- เปลี่ยนราคาได้ง่าย
- เปิด/ปิด features ได้ตามต้องการ

### 3. ปลอดภัย 🔐
- มี Firestore Rules ป้องกัน
- เฉพาะ Super Admin แก้ไขได้
- มี Log ทุกการเปลี่ยนแปลง

### 4. Backward Compatible 📦
ถ้า Plan Template ไม่มีจะ fallback ไปใช้ default hardcode

---

## 🚨 ข้อควรระวัง

### 1. อย่าใช้ `-1` สำหรับ Free Plan
`-1` = ไม่จำกัด ควรใช้กับ Enterprise เท่านั้น

### 2. ตั้งค่า displayOrder ให้ถูกต้อง
เพื่อให้แสดงผลเรียงลำดับ:
- Free: 1
- Basic: 2
- Premium: 3
- Enterprise: 4

### 3. อัปเดต Plan Template ไม่กระทบบริษัทเดิม
บริษัทเดิมจะยังใช้ quota เดิม ไม่อัปเดตอัตโนมัติ

### 4. ควร Initialize ก่อนใช้งาน
รัน `initializePlanTemplates()` ครั้งแรกก่อนสร้างบริษัท

---

## 🎯 สรุป

✅ **แก้ไขแผนได้แล้ว:** ไปที่ Firebase Console → planTemplates
✅ **แก้ไขได้ทันที:** ไม่ต้อง deploy code ใหม่
✅ **ปลอดภัย:** เฉพาะ Super Admin แก้ไขได้
✅ **ยืดหยุ่น:** เปลี่ยนโควตา/ราคา/features ได้ตามต้องการ

---

## 📞 ติดต่อ

หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อ Super Admin

---

เอกสารนี้สร้างโดย: System  
วันที่อัปเดตล่าสุด: 30 ตุลาคม 2025

