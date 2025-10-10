# 🏢 Multi-Company Management Guide

คู่มือการใช้งานระบบจัดการหลายบริษัท (Multi-Company Management)

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [คุณสมบัติหลัก](#คุณสมบัติหลัก)
3. [วิธีการใช้งาน](#วิธีการใช้งาน)
4. [โครงสร้างข้อมูล](#โครงสร้างข้อมูล)
5. [การพัฒนาเพิ่มเติม](#การพัฒนาเพิ่มเติม)

---

## 🎯 ภาพรวมระบบ

ระบบ Multi-Company Management ช่วยให้ผู้ใช้สามารถ:
- **จัดการหลายบริษัท** ภายใน account เดียว
- **แยกข้อมูล** ตามบริษัทที่เลือก
- **สลับบริษัท** ได้ง่ายๆ จาก Header
- **แชร์ข้อมูล** ระหว่าง users ในบริษัทเดียวกัน (อนาคต)

### สถาปัตยกรรมระบบ

```
User (Authentication)
    │
    ├── Company 1 (Default)
    │   ├── Delivery Notes
    │   ├── Warranty Cards
    │   ├── Company Profiles
    │   └── Logo Storage
    │
    ├── Company 2
    │   ├── Delivery Notes
    │   ├── Warranty Cards
    │   ├── Company Profiles
    │   └── Logo Storage
    │
    └── Company N...
```

---

## ✨ คุณสมบัติหลัก

### 1. 🏢 Company Selector
- **ตำแหน่ง**: ด้านขวาของ Header (ระหว่าง Logo และ User Menu)
- **ฟังก์ชัน**:
  - แสดงรายชื่อบริษัททั้งหมด
  - เลือกบริษัทที่ต้องการทำงาน
  - สร้างบริษัทใหม่
  - แสดง badge "Default" สำหรับบริษัทหลัก

### 2. 🔄 Auto Default Company
- สร้างบริษัท default อัตโนมัติเมื่อ user login ครั้งแรก
- ชื่อบริษัท default: "บริษัทของฉัน"
- ตั้งเป็น default company โดยอัตโนมัติ

### 3. 📊 Data Filtering
ข้อมูลทั้งหมดจะกรองตามบริษัทที่เลือก:
- ✅ ใบส่งมอบงาน (Delivery Notes)
- ✅ ใบรับประกันสินค้า (Warranty Cards)
- ✅ Company Profiles (ข้อมูลบริษัท/ลูกค้าที่บันทึกไว้)
- ✅ Logo Storage (อนาคต)

### 4. 🔐 Security
- ผู้ใช้เห็นเฉพาะบริษัทของตัวเอง
- Firestore Rules ตรวจสอบ `userId` และ `companyId`
- ข้อมูลแยกตามบริษัทอย่างเข้มงวด

---

## 📖 วิธีการใช้งาน

### การสร้างบริษัทใหม่

1. **คลิกที่ Company Selector** ในส่วน Header
2. **คลิก "➕ สร้างบริษัทใหม่"**
3. **กรอกข้อมูล**:
   - ชื่อบริษัท (บังคับ)
   - ที่อยู่ (ไม่บังคับ)
4. **คลิก "สร้างบริษัท"**
5. ระบบจะสร้างบริษัทและเปลี่ยนไปใช้งานบริษัทใหม่ทันที

### การเปลี่ยนบริษัท

1. **คลิกที่ Company Selector** ในส่วน Header
2. **เลือกบริษัท** ที่ต้องการจากรายการ
3. ระบบจะโหลดข้อมูลของบริษัทนั้นทันที

### การตั้งค่าบริษัท Default

1. **คลิกที่ Company Selector**
2. **คลิกที่ปุ่ม ⭐** ข้างชื่อบริษัท
3. บริษัทนั้นจะกลายเป็น default company

---

## 🗂️ โครงสร้างข้อมูล

### Company Interface

```typescript
interface Company {
    id?: string;              // Auto-generated
    name: string;             // ชื่อบริษัท
    address?: string;         // ที่อยู่บริษัท (optional)
    userId: string;           // เจ้าของบริษัท
    logoUrl?: string | null;  // โลโก้บริษัท
    logoType?: LogoType;      // ประเภทโลโก้
    isDefault?: boolean;      // บริษัทหลัก (default)
    createdAt?: Date;
    updatedAt?: Date;
}
```

### Firestore Collections

#### 1. `companies` Collection
```
companies/
  ├── {companyId}/
  │   ├── name: string
  │   ├── address: string
  │   ├── userId: string
  │   ├── logoUrl: string | null
  │   ├── logoType: string
  │   ├── isDefault: boolean
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp
```

#### 2. `deliveryNotes` Collection (Updated)
```
deliveryNotes/
  ├── {documentId}/
  │   ├── ... (existing fields)
  │   ├── userId: string
  │   ├── companyId: string | null  ← NEW
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp
```

#### 3. `warrantyCards` Collection (Updated)
```
warrantyCards/
  ├── {documentId}/
  │   ├── ... (existing fields)
  │   ├── userId: string
  │   ├── companyId: string | null  ← NEW
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp
```

#### 4. `companyProfiles` Collection (Updated)
```
companyProfiles/
  ├── {profileId}/
  │   ├── name: string
  │   ├── companyName: string
  │   ├── address: string
  │   ├── type: 'sender' | 'receiver' | 'both'
  │   ├── userId: string
  │   ├── companyId: string | null  ← NEW
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp
```

---

## 🔧 API Reference

### CompanyContext

```typescript
const { 
    currentCompany,      // บริษัทที่เลือกปัจจุบัน
    companies,           // รายการบริษัททั้งหมด
    loading,             // สถานะการโหลด
    selectCompany,       // เลือกบริษัท
    refreshCompanies,    // รีเฟรชรายการ
    setDefaultCompany    // ตั้งค่าบริษัท default
} = useCompany();
```

### Company Service Functions

```typescript
// ดึงรายการบริษัททั้งหมดของ user
getUserCompanies(): Promise<Company[]>

// สร้างบริษัทใหม่
createCompany(companyData: Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string>

// อัปเดตข้อมูลบริษัท
updateCompany(companyId: string, updates: Partial<Company>): Promise<void>

// ลบบริษัท
deleteCompany(companyId: string): Promise<void>

// ดึงบริษัท default
getDefaultCompany(): Promise<Company | null>

// สร้างบริษัท default
createDefaultCompany(): Promise<string>

// ตั้งค่าบริษัท default
setDefaultCompany(companyId: string): Promise<void>
```

### Updated Firestore Functions

```typescript
// บันทึกใบส่งมอบงาน พร้อม companyId
saveDeliveryNote(data: DeliveryNoteData, companyId?: string): Promise<string>

// ดึงรายการใบส่งมอบงาน กรองตาม companyId
getDeliveryNotes(limitCount?: number, companyId?: string): Promise<DeliveryNoteDocument[]>

// บันทึกใบรับประกัน พร้อม companyId
saveWarrantyCard(data: WarrantyData, companyId?: string): Promise<string>

// ดึงรายการใบรับประกัน กรองตาม companyId
getWarrantyCards(limitCount?: number, companyId?: string): Promise<WarrantyDocument[]>
```

---

## 🚀 การพัฒนาเพิ่มเติม

### ฟีเจอร์ที่แนะนำ

1. **Multi-User per Company** 🤝
   - เพิ่มระบบ invitation
   - กำหนด roles (Owner, Admin, Member)
   - แชร์ข้อมูลระหว่าง users ในบริษัทเดียวกัน

2. **Company Settings** ⚙️
   - แก้ไขข้อมูลบริษัท
   - อัปโหลดโลโก้บริษัท
   - ตั้งค่า default values

3. **Company Analytics** 📈
   - สถิติเอกสารแต่ละบริษัท
   - รายงานการใช้งาน
   - Export ข้อมูล

4. **Company Templates** 📄
   - Template เอกสารเฉพาะบริษัท
   - บันทึก default values
   - ใช้ซ้ำได้ง่าย

### การเพิ่ม Firestore Index

ถ้าต้องการ query ที่ซับซ้อนขึ้น อาจต้องเพิ่ม composite index:

```json
{
  "indexes": [
    {
      "collectionGroup": "deliveryNotes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "warrantyCards",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🐛 Troubleshooting

### ปัญหา: ไม่เห็นบริษัทใหม่หลังสร้าง
**วิธีแก้**: 
- รอสักครู่ให้ Firestore sync
- คลิก refresh ที่ Company Selector
- ตรวจสอบ Console สำหรับ errors

### ปัญหา: ข้อมูลไม่อัปเดตเมื่อเปลี่ยนบริษัท
**วิธีแก้**:
- ตรวจสอบว่า `companyId` ถูกส่งไปยัง API ถูกต้อง
- ตรวจสอบ Firestore Rules
- ดู Network tab สำหรับ API calls

### ปัญหา: Permission Denied
**วิธีแก้**:
- ตรวจสอบว่า user login แล้ว
- ตรวจสอบ Firestore Rules
- ตรวจสอบว่า `userId` ตรงกับ owner ของบริษัท

---

## 📚 เอกสารที่เกี่ยวข้อง

- [README.md](./README.md) - ภาพรวมโปรเจค
- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - คู่มือ Authentication
- [LOGO_MANAGEMENT_GUIDE.md](./LOGO_MANAGEMENT_GUIDE.md) - คู่มือจัดการโลโก้
- [RECAPTCHA_GUIDE.md](./RECAPTCHA_GUIDE.md) - คู่มือ reCAPTCHA

---

## 📞 ติดต่อและสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ Console logs
2. ตรวจสอบ Firestore Rules
3. ดูเอกสารที่เกี่ยวข้อง

---

**Version**: 1.0.0  
**Last Updated**: October 5, 2025  
**Status**: ✅ Production Ready
