# คู่มือการใช้งานระบบ Auto-Generate เลขที่เอกสาร

## ภาพรวม

ระบบ Auto-Generate เลขที่เอกสารช่วยให้คุณสร้างเลขที่เอกสารอัตโนมัติในรูปแบบ **prefix-YYMMDDXX** 

- **prefix**: ตัวอักษรนำหน้า (เช่น DN สำหรับ Delivery Note, WR สำหรับ Warranty)
- **YYMMDD**: วันที่ในรูปแบบ ปี(2หลัก)เดือน(2หลัก)วัน(2หลัก)
- **XX**: Running number เริ่มต้นที่ 01 และเพิ่มขึ้นทีละ 1 ในแต่ละวัน

## ตัวอย่างเลขที่เอกสาร

- **DN-25101001**: ใบส่งมอบงานที่ 1 วันที่ 10 ตุลาคม 2025
- **DN-25101002**: ใบส่งมอบงานที่ 2 วันที่ 10 ตุลาคม 2025
- **WR-25101001**: ใบรับประกันที่ 1 วันที่ 10 ตุลาคม 2025
- **DN-25101101**: ใบส่งมอบงานที่ 1 วันที่ 11 ตุลาคม 2025 (Running number รีเซ็ตเป็น 01 เมื่อเปลี่ยนวัน)

## การใช้งาน

### 1. ใบส่งมอบงาน (Delivery Note)

1. เปิดแท็บ "ใบส่งมอบงาน"
2. ที่ช่อง "เลขที่เอกสาร" คลิกปุ่ม **Auto** 
3. ระบบจะสร้างเลขที่เอกสารอัตโนมัติในรูปแบบ `DN-YYMMDDXX`
4. คุณสามารถแก้ไขเลขที่เอกสารได้ตามต้องการ

### 2. ใบรับประกันสินค้า (Warranty Card)

1. เปิดแท็บ "ใบรับประกันสินค้า"
2. ที่ช่อง "หมายเลขเครื่อง" คลิกปุ่ม **Auto**
3. ระบบจะสร้างหมายเลขเครื่องอัตโนมัติในรูปแบบ `WR-YYMMDDXX`
4. คุณสามารถแก้ไขหมายเลขเครื่องได้ตามต้องการ

## คุณสมบัติพิเศษ

### 1. Running Number แยกตาม User
- แต่ละผู้ใช้จะมี Running Number เป็นของตัวเอง
- ไม่มีการชนกันระหว่าง User

### 2. รีเซ็ตอัตโนมัติทุกวัน
- Running Number จะรีเซ็ตเป็น 01 เมื่อเปลี่ยนวัน
- ไม่จำเป็นต้องรีเซ็ตด้วยตนเอง

### 3. Transaction-Safe
- ใช้ Firebase Transaction เพื่อป้องกัน race condition
- ไม่มีการซ้ำกันของเลขที่เอกสาร

### 4. แก้ไขได้
- สามารถแก้ไขเลขที่เอกสารที่สร้างขึ้นได้ตามต้องการ
- หากต้องการใช้เลขที่เอกสารแบบกำหนดเองก็สามารถพิมพ์เองได้

## โครงสร้างข้อมูลใน Firestore

### Collection: `documentNumbers`

```
documentNumbers/
  └── {userId}_{prefix}_{YYMMDD}/
      ├── prefix: "DN" หรือ "WR"
      ├── date: "251010"
      ├── lastNumber: 5
      ├── userId: "user-uid"
      ├── createdAt: Timestamp
      └── updatedAt: Timestamp
```

### ตัวอย่าง Document ID
- `user123_DN_251010`: Counter สำหรับใบส่งมอบงานของ user123 วันที่ 10/10/25
- `user456_WR_251010`: Counter สำหรับใบรับประกันของ user456 วันที่ 10/10/25

## การปรับแต่ง Prefix

หากต้องการเปลี่ยน Prefix (เช่น จาก DN เป็น DEL) สามารถแก้ไขได้ที่:

```typescript
// ไฟล์: services/documentNumber.ts

const getDocumentPrefix = (type: DocumentType): string => {
    switch (type) {
        case 'delivery':
            return 'DN'; // เปลี่ยนเป็น 'DEL' หรืออื่นๆ ตามต้องการ
        case 'warranty':
            return 'WR'; // เปลี่ยนเป็น 'WAR' หรืออื่นๆ ตามต้องการ
        default:
            return 'DOC';
    }
};
```

## การใช้งานขั้นสูง

### สร้างเลขที่เอกสารด้วย Custom Prefix

```typescript
import { generateDocumentNumber } from '../services/documentNumber';

// สร้างเลขที่เอกสารด้วย prefix กำหนดเอง
const docNumber = await generateDocumentNumber('delivery', 'DEL');
// ผลลัพธ์: DEL-25101001
```

### ดึงเลขที่เอกสารล่าสุด

```typescript
import { getLastDocumentNumber } from '../services/documentNumber';

// ดึงเลขที่เอกสารล่าสุด
const lastDocNumber = await getLastDocumentNumber('delivery');
// ผลลัพธ์: DN-25101005 (ถ้ามี) หรือ null (ถ้ายังไม่มี)
```

### สร้างเลขที่เอกสารแบบกำหนดเอง

```typescript
import { generateCustomDocumentNumber } from '../services/documentNumber';

// สร้างเลขที่เอกสารแบบกำหนดเองโดยไม่ใช้ running number
const customDocNumber = generateCustomDocumentNumber('DN', '001');
// ผลลัพธ์: DN-251010001
```

## Firestore Security Rules

ระบบได้เพิ่ม Security Rules สำหรับ collection `documentNumbers`:

```javascript
// Document Numbers (เลขที่เอกสารอัตโนมัติ - Running Number)
match /documentNumbers/{counterId} {
  // อนุญาตให้อ่านได้เฉพาะผู้ที่ Login แล้วและเป็นเจ้าของ counter
  allow read: if isAuthenticated() && isOwner(resource.data.userId);
  
  // อนุญาตให้สร้าง counter ใหม่ได้เฉพาะผู้ที่ Login แล้ว
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  
  // อนุญาตให้แก้ไข counter ได้เฉพาะเจ้าของ
  allow update: if isAuthenticated() && isOwner(resource.data.userId);
  
  // ไม่อนุญาตให้ลบ counter (เพื่อรักษาความสมบูรณ์ของข้อมูล)
  allow delete: if false;
}
```

## การแก้ไขปัญหา

### ปัญหา: ไม่สามารถสร้างเลขที่เอกสารได้

**สาเหตุ**: ผู้ใช้ยังไม่ได้ Login

**แก้ไข**: ตรวจสอบให้แน่ใจว่าได้ Login เข้าสู่ระบบแล้ว

### ปัญหา: เลขที่เอกสารไม่ต่อเนื่อง

**สาเหตุ**: Running number รีเซ็ตเมื่อเปลี่ยนวัน

**แก้ไข**: นี่เป็นพฤติกรรมปกติของระบบ เพื่อให้เลขที่เอกสารมี pattern ที่ชัดเจนตามวันที่

### ปัญหา: การสร้างเลขที่เอกสารช้า

**สาเหตุ**: ใช้ Firebase Transaction เพื่อความปลอดภัย

**แก้ไข**: นี่เป็นการทำงานปกติ โดยปกติจะใช้เวลาไม่เกิน 1-2 วินาที

## สรุป

ระบบ Auto-Generate เลขที่เอกสารช่วยให้การสร้างเลขที่เอกสารเป็นไปอย่างอัตโนมัติและมีระเบียบ โดย:

✅ **รูปแบบเลขที่เอกสารที่ชัดเจน**: prefix-YYMMDDXX
✅ **ไม่มีการซ้ำกัน**: ใช้ Transaction เพื่อความปลอดภัย
✅ **แยกตาม User**: แต่ละ User มี Running Number ของตัวเอง
✅ **รีเซ็ตอัตโนมัติ**: Running Number รีเซ็ตทุกวัน
✅ **แก้ไขได้**: สามารถแก้ไขเลขที่เอกสารได้ตามต้องการ
✅ **ใช้งานง่าย**: แค่คลิกปุ่ม Auto

---

**หมายเหตุ**: หากต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อผู้พัฒนาระบบ

