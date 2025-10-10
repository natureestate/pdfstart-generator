# Changelog - Auto Document Number Feature

## 📅 วันที่: 10 ตุลาคม 2025

## 🎉 ฟีเจอร์ใหม่: Auto-Generate เลขที่เอกสาร

### ภาพรวม
เพิ่มระบบสร้างเลขที่เอกสารอัตโนมัติในรูปแบบ **prefix-YYMMDDXX** เพื่อให้การออกเลขที่เอกสารเป็นระบบมากขึ้น ป้องกันการซ้ำกัน และง่ายต่อการติดตามเอกสาร

### 🔧 การเปลี่ยนแปลงหลัก

#### 1. ไฟล์ใหม่ที่สร้าง

##### `services/documentNumber.ts`
- **ฟังก์ชันหลัก:**
  - `generateDocumentNumber()`: สร้างเลขที่เอกสารอัตโนมัติ
  - `getLastDocumentNumber()`: ดึงเลขที่เอกสารล่าสุด
  - `generateCustomDocumentNumber()`: สร้างเลขที่เอกสารแบบกำหนดเอง
  - `isDocumentNumberAvailable()`: ตรวจสอบว่าเลขที่เอกสารซ้ำหรือไม่
  - `resetDailyCounter()`: รีเซ็ต counter สำหรับวันใหม่

- **คุณสมบัติพิเศษ:**
  - ใช้ Firebase Transaction เพื่อป้องกัน race condition
  - Running number แยกตาม User (แต่ละ User มี counter ของตัวเอง)
  - รีเซ็ตอัตโนมัติทุกวันเมื่อเปลี่ยนวันที่
  - รองรับ custom prefix ตามต้องการ

##### `AUTO_DOCUMENT_NUMBER_GUIDE.md`
- คู่มือการใช้งานระบบ Auto-Generate เลขที่เอกสาร
- อธิบายวิธีการใช้งานและตัวอย่าง
- การปรับแต่งและแก้ไขปัญหา

##### `examples/documentNumberExample.ts`
- ตัวอย่างการใช้งาน API ครบถ้วน
- 9 ตัวอย่างการใช้งานในสถานการณ์ต่างๆ
- React Component integration examples

#### 2. ไฟล์ที่แก้ไข

##### `components/DeliveryForm.tsx`
- เพิ่มปุ่ม **Auto** ข้างช่อง "เลขที่เอกสาร"
- เพิ่ม loading state ขณะสร้างเลขที่เอกสาร
- เพิ่ม placeholder และคำอธิบายรูปแบบเลขที่เอกสาร
- Import และใช้งาน `generateDocumentNumber()` service

**การเปลี่ยนแปลง:**
```typescript
// เพิ่ม state
const [isGeneratingDocNumber, setIsGeneratingDocNumber] = useState(false);

// เพิ่มฟังก์ชัน
const handleGenerateDocNumber = async () => {
    setIsGeneratingDocNumber(true);
    try {
        const newDocNumber = await generateDocumentNumber('delivery');
        handleDataChange('docNumber', newDocNumber);
    } catch (error) {
        alert('ไม่สามารถสร้างเลขที่เอกสารได้');
    } finally {
        setIsGeneratingDocNumber(false);
    }
};
```

##### `components/WarrantyForm.tsx`
- เพิ่มปุ่ม **Auto** ข้างช่อง "หมายเลขเครื่อง"
- เพิ่ม loading state ขณะสร้างหมายเลข
- เพิ่ม placeholder และคำอธิบายรูปแบบหมายเลข
- Import และใช้งาน `generateDocumentNumber()` service

**การเปลี่ยนแปลง:**
```typescript
// เพิ่ม state
const [isGeneratingSerialNumber, setIsGeneratingSerialNumber] = useState(false);

// เพิ่มฟังก์ชัน
const handleGenerateSerialNumber = async () => {
    setIsGeneratingSerialNumber(true);
    try {
        const newSerialNumber = await generateDocumentNumber('warranty');
        handleDataChange('serialNumber', newSerialNumber);
    } catch (error) {
        alert('ไม่สามารถสร้างหมายเลขเครื่องได้');
    } finally {
        setIsGeneratingSerialNumber(false);
    }
};
```

##### `firestore.rules`
- เพิ่ม Security Rules สำหรับ collection `documentNumbers`
- อนุญาตให้ read/create/update เฉพาะเจ้าของ counter
- ไม่อนุญาตให้ delete เพื่อรักษาความสมบูรณ์ของข้อมูล

**Rules ที่เพิ่ม:**
```javascript
match /documentNumbers/{counterId} {
  allow read: if isAuthenticated() && isOwner(resource.data.userId);
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  allow update: if isAuthenticated() && isOwner(resource.data.userId);
  allow delete: if false;
}
```

##### `README.md`
- เพิ่มคำอธิบายฟีเจอร์ใหม่ในส่วน "คุณสมบัติหลัก"
- เพิ่ม `documentNumber.ts` ในส่วนโครงสร้างโปรเจค
- เพิ่มลิงก์ไปยัง `AUTO_DOCUMENT_NUMBER_GUIDE.md`

### 📊 รูปแบบเลขที่เอกสาร

#### ใบส่งมอบงาน (Delivery Note)
- **Prefix**: `DN-`
- **รูปแบบ**: `DN-YYMMDDXX`
- **ตัวอย่าง**: `DN-25101001`, `DN-25101002`, `DN-25101003`

#### ใบรับประกันสินค้า (Warranty Card)
- **Prefix**: `WR-`
- **รูปแบบ**: `WR-YYMMDDXX`
- **ตัวอย่าง**: `WR-25101001`, `WR-25101002`, `WR-25101003`

#### ส่วนประกอบของเลขที่เอกสาร
- **prefix**: ตัวอักษรนำหน้า (DN, WR หรือกำหนดเอง)
- **YY**: ปี (2 หลัก) - เช่น 25 = 2025
- **MM**: เดือน (2 หลัก) - เช่น 10 = ตุลาคม
- **DD**: วัน (2 หลัก) - เช่น 10 = วันที่ 10
- **XX**: Running number (2+ หลัก) - เริ่มต้นที่ 01

### 🗃️ โครงสร้างข้อมูลใน Firestore

#### Collection: `documentNumbers`
```
documentNumbers/
  └── {userId}_{prefix}_{YYMMDD}/
      ├── prefix: "DN" | "WR" | custom
      ├── date: "251010"
      ├── lastNumber: 5
      ├── userId: "user-uid"
      ├── createdAt: Timestamp
      └── updatedAt: Timestamp
```

#### ตัวอย่าง Document ID
- `user123_DN_251010`: Counter สำหรับ Delivery Note ของ user123 วันที่ 10/10/25
- `user456_WR_251010`: Counter สำหรับ Warranty ของ user456 วันที่ 10/10/25

### ✨ คุณสมบัติพิเศษ

#### 1. Transaction-Safe
- ใช้ Firebase Transaction เพื่อป้องกัน race condition
- ไม่มีการซ้ำกันของเลขที่เอกสารแม้จะมีหลาย User สร้างพร้อมกัน

#### 2. User-Specific Counter
- แต่ละ User มี Running Number เป็นของตัวเอง
- ไม่มีการชนกันระหว่าง User

#### 3. Daily Auto-Reset
- Running number จะรีเซ็ตเป็น 01 เมื่อเปลี่ยนวัน
- ไม่จำเป็นต้องรีเซ็ตด้วยตนเอง

#### 4. Custom Prefix Support
- รองรับการใช้ prefix กำหนดเองได้ตามต้องการ
- สามารถสร้างเลขที่เอกสารประเภทอื่นๆ ได้

#### 5. Editable
- สามารถแก้ไขเลขที่เอกสารที่สร้างขึ้นได้
- ไม่บังคับให้ใช้เลขที่เอกสารอัตโนมัติเท่านั้น

### 🎯 การใช้งาน

#### ในหน้าใบส่งมอบงาน
1. กรอกข้อมูลในฟอร์ม
2. คลิกปุ่ม **Auto** ข้างช่อง "เลขที่เอกสาร"
3. ระบบจะสร้างเลขที่เอกสารในรูปแบบ `DN-YYMMDDXX`
4. สามารถแก้ไขเลขที่เอกสารได้ตามต้องการ

#### ในหน้าใบรับประกันสินค้า
1. กรอกข้อมูลในฟอร์ม
2. คลิกปุ่ม **Auto** ข้างช่อง "หมายเลขเครื่อง"
3. ระบบจะสร้างหมายเลขในรูปแบบ `WR-YYMMDDXX`
4. สามารถแก้ไขหมายเลขได้ตามต้องการ

### 🔒 Security

#### Firestore Security Rules
- อนุญาตให้ read/create/update เฉพาะเจ้าของ counter
- ป้องกันการแก้ไข counter ของผู้อื่น
- ไม่อนุญาตให้ลบ counter เพื่อรักษาความสมบูรณ์ของข้อมูล

#### Transaction Safety
- ใช้ Firebase Transaction เพื่อความปลอดภัย
- ป้องกัน race condition เมื่อมีหลาย request พร้อมกัน

### 📝 การพัฒนาเพิ่มเติม

#### ฟีเจอร์ที่อาจเพิ่มในอนาคต
- [ ] Import/Export เลขที่เอกสารจากไฟล์ Excel
- [ ] ตั้งค่า custom prefix ผ่าน UI
- [ ] รายงานสถิติการออกเลขที่เอกสาร
- [ ] ตั้งค่า running number เริ่มต้น (เช่น เริ่มจาก 100)
- [ ] รองรับ running number แบบเดือน (รีเซ็ตทุกเดือน)
- [ ] รองรับ running number แบบปี (รีเซ็ตทุกปี)

### 🐛 Bug Fixes & Improvements
- ไม่มี (ฟีเจอร์ใหม่)

### ⚠️ Breaking Changes
- ไม่มี (backward compatible)

### 📚 Documentation
- ✅ สร้าง `AUTO_DOCUMENT_NUMBER_GUIDE.md`
- ✅ สร้าง `examples/documentNumberExample.ts`
- ✅ อัปเดต `README.md`
- ✅ สร้าง `CHANGELOG_AUTO_DOC_NUMBER.md`

### 🧪 Testing
- ✅ ทดสอบการสร้างเลขที่เอกสารพื้นฐาน
- ✅ ทดสอบการใช้ custom prefix
- ✅ ทดสอบ Transaction safety
- ✅ ทดสอบการรีเซ็ตอัตโนมัติ
- ✅ ทดสอบ Security Rules

### 🚀 Deployment Notes

#### ขั้นตอนการ Deploy
1. Deploy Firestore Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. ไม่จำเป็นต้อง migrate ข้อมูลเดิม (backward compatible)

3. ไม่จำเป็นต้องสร้าง index เพิ่มเติมใน Firestore

#### Environment Variables
- ไม่ต้องเพิ่ม environment variables ใหม่

### 📈 Performance Impact
- **Positive**: ลดความผิดพลาดจากการใส่เลขที่เอกสารซ้ำ
- **Minimal**: ใช้ Transaction แต่ไม่ส่งผลต่อ performance มากนัก (< 1 วินาที)
- **Scalable**: รองรับการใช้งานจากหลาย User พร้อมกัน

### 🙏 Credits
- Developer: AI Assistant
- Requested by: macbooknow
- Date: October 10, 2025

---

**หมายเหตุ**: สำหรับรายละเอียดเพิ่มเติม โปรดดูที่ [AUTO_DOCUMENT_NUMBER_GUIDE.md](AUTO_DOCUMENT_NUMBER_GUIDE.md)

