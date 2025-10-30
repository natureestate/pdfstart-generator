# 🔧 แก้ปัญหา UI ไม่แสดง - Multi-User System

## ปัญหาที่พบ

1. ❌ Company Dropdown กดแล้วให้สร้างใหม่อย่างเดียว ไม่เห็น dropdown
2. ❌ Role Badge ไม่มี
3. ❌ ปุ่มจัดการ Admin ไม่มี

## สาเหตุที่เป็นไปได้

### 1. ยังไม่มีข้อมูลในระบบ

**อาการ:**
- `companies.length === 0`
- `currentCompany === null`
- Console แสดง: "⚠️ [CompanyContext] ไม่มีบริษัทเลย"

**วิธีแก้:**

#### ขั้นตอนที่ 1: ตรวจสอบว่ามีบริษัทหรือไม่

1. เปิด Browser Console (F12)
2. ดูที่ Console Logs หา:
   ```
   📋 [CompanyContext] ดึงบริษัทได้: 0 องค์กร []
   ```
3. ถ้าเป็น `0 องค์กร` แสดงว่ายังไม่มีบริษัท

#### ขั้นตอนที่ 2: สร้างบริษัทใหม่

1. คลิกที่ Company Selector (ปุ่มที่มีไอคอนอาคาร 🏢)
2. จะเปิด Modal "เพิ่มบริษัทใหม่"
3. กรอกชื่อบริษัท
4. กรอกที่อยู่ (ถ้ามี)
5. คลิก "สร้างบริษัท"

#### ขั้นตอนที่ 3: ตรวจสอบว่าสร้างสำเร็จ

1. ดู Console ว่ามี log:
   ```
   ✅ สร้างบริษัทสำเร็จ: company-id (Admin: user-id)
   ✅ เพิ่ม Admin คนแรกสำเร็จ: member-id
   ```
2. Refresh หน้าเว็บ (F5)
3. ตรวจสอบว่า UI แสดง:
   - Company Dropdown แสดงชื่อบริษัท
   - Role Badge แสดง "👑 Admin"
   - ปุ่ม "จัดการสมาชิก"

### 2. Firestore Rules บล็อกการอ่าน/เขียน

**อาการ:**
- Console แสดง Error: "Missing or insufficient permissions"
- ไม่สามารถสร้างบริษัทได้

**วิธีแก้:**

ตรวจสอบ `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Companies Collection
    match /companies/{companyId} {
      // อ่านได้ถ้าเป็นสมาชิก
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        exists(/databases/$(database)/documents/companyMembers/$(request.auth.uid + '_' + companyId))
      );
      
      // สร้างได้ถ้า login แล้ว
      allow create: if request.auth != null;
      
      // แก้ไขได้เฉพาะ Admin
      allow update, delete: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        exists(/databases/$(database)/documents/companyMembers/$(request.auth.uid + '_' + companyId)) &&
        get(/databases/$(database)/documents/companyMembers/$(request.auth.uid + '_' + companyId)).data.role == 'admin'
      );
    }
    
    // Company Members Collection
    match /companyMembers/{memberId} {
      // อ่านได้ถ้าเป็นสมาชิกของบริษัทนั้น
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        resource.data.companyId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companies
      );
      
      // สร้างได้ถ้า login แล้ว (สำหรับ addFirstAdmin)
      allow create: if request.auth != null;
      
      // แก้ไข/ลบได้เฉพาะ Admin
      allow update, delete: if request.auth != null &&
        exists(/databases/$(database)/documents/companyMembers/$(request.auth.uid + '_' + resource.data.companyId)) &&
        get(/databases/$(database)/documents/companyMembers/$(request.auth.uid + '_' + resource.data.companyId)).data.role == 'admin';
    }
  }
}
```

**หรือใช้ Rules แบบง่าย (สำหรับ Development):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Firestore Indexes ยังไม่สร้าง

**อาการ:**
- Console แสดง Error เกี่ยวกับ Index
- ข้อมูลไม่โหลด

**วิธีแก้:**

1. เปิด Firebase Console → Firestore → Indexes
2. สร้าง Composite Indexes ดังนี้:

#### Index 1: companyMembers - Query by userId and status
```
Collection: companyMembers
Fields:
  - userId (Ascending)
  - status (Ascending)
  - createdAt (Descending)
```

#### Index 2: companyMembers - Query by companyId
```
Collection: companyMembers
Fields:
  - companyId (Ascending)
  - createdAt (Descending)
```

#### Index 3: companyMembers - Check Admin
```
Collection: companyMembers
Fields:
  - companyId (Ascending)
  - userId (Ascending)
  - role (Ascending)
  - status (Ascending)
```

**หรือใช้ไฟล์ `firestore.indexes.json`:**

```json
{
  "indexes": [
    {
      "collectionGroup": "companyMembers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "companyMembers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "companyMembers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

### 4. Cache ของ Browser

**อาการ:**
- Code อัปเดตแล้วแต่ UI ยังเป็นแบบเก่า

**วิธีแก้:**

1. **Hard Refresh:**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

2. **Clear Cache:**
   - เปิด DevTools (F12)
   - คลิกขวาที่ปุ่ม Refresh
   - เลือก "Empty Cache and Hard Reload"

3. **Incognito Mode:**
   - เปิด Browser ในโหมด Incognito/Private
   - ทดสอบใหม่

### 5. Dev Server ไม่ได้ Restart

**อาการ:**
- เปลี่ยน code แล้วแต่ไม่เห็นผล

**วิธีแก้:**

```bash
cd /Users/macbooknow/Ecertdoc/pdfexportforDeliveryandCert
npm run restart
```

หรือ

```bash
# หยุด server
lsof -ti:3000 | xargs kill -9

# เริ่มใหม่
npm run dev
```

## เครื่องมือ Debug

### 1. ใช้ไฟล์ทดสอบ

เปิดไฟล์ `test-firestore-data.html` ใน Browser:

```
http://localhost:3000/test-firestore-data.html
```

ทดสอบ:
- 📋 ดึงรายการบริษัท
- 👥 ดึงรายการสมาชิก
- 👑 ตรวจสอบสิทธิ์ Admin

### 2. ดู Console Logs

เปิด Browser Console (F12) และดู logs:

```javascript
// ตรวจสอบ User
🔄 [CompanyContext] เริ่มโหลดบริษัท, User: your-email@example.com

// ตรวจสอบ Companies
📋 [CompanyContext] ดึงบริษัทได้: X องค์กร [...]

// ตรวจสอบ Company Selector
🏢 [CompanySelector] Current Company: {...}
🏢 [CompanySelector] All Companies: [...]

// ตรวจสอบ Admin Status
👑 [Header] Admin Status: true/false
```

### 3. ตรวจสอบ Firestore ใน Firebase Console

1. เปิด Firebase Console
2. ไปที่ Firestore Database
3. ตรวจสอบ Collections:

#### Collection: `companies`
```
companies/
  └── {companyId}/
      ├── name: "ชื่อบริษัท"
      ├── address: "ที่อยู่"
      ├── userId: "user-id"
      ├── memberCount: 1
      ├── createdAt: Timestamp
      └── updatedAt: Timestamp
```

#### Collection: `companyMembers`
```
companyMembers/
  └── {memberId}/
      ├── companyId: "company-id"
      ├── userId: "user-id"
      ├── email: "email@example.com"
      ├── role: "admin"
      ├── status: "active"
      ├── joinedAt: Timestamp
      ├── createdAt: Timestamp
      └── updatedAt: Timestamp
```

## ขั้นตอนแก้ปัญหาแบบละเอียด

### ✅ Checklist

- [ ] 1. ตรวจสอบว่า Login สำเร็จ (เห็น User Menu ที่ Header)
- [ ] 2. เปิด Browser Console (F12)
- [ ] 3. ดู Console Logs ว่ามี Error หรือไม่
- [ ] 4. ตรวจสอบว่า `companies.length` เป็นเท่าไร
- [ ] 5. ถ้าเป็น 0 → สร้างบริษัทใหม่
- [ ] 6. ถ้าสร้างไม่ได้ → ตรวจสอบ Firestore Rules
- [ ] 7. ถ้ามี Error เรื่อง Index → สร้าง Indexes
- [ ] 8. Hard Refresh Browser (Cmd+Shift+R)
- [ ] 9. Restart Dev Server
- [ ] 10. ทดสอบด้วย `test-firestore-data.html`

### 🎯 ขั้นตอนทดสอบทีละขั้น

#### ขั้นที่ 1: ตรวจสอบ Console

```javascript
// คาดหวัง
✅ [CompanyContext] โหลดเสร็จสิ้น
📋 [CompanyContext] ดึงบริษัทได้: 1 องค์กร [...]

// ถ้าเห็น
⚠️ [CompanyContext] ไม่มีบริษัทเลย
// → ไปขั้นที่ 2
```

#### ขั้นที่ 2: สร้างบริษัท

1. คลิก Company Selector
2. กรอกข้อมูล
3. คลิก "สร้างบริษัท"
4. ดู Console ว่ามี Error หรือไม่

```javascript
// คาดหวัง
✅ สร้างบริษัทสำเร็จ: xxx
✅ เพิ่ม Admin คนแรกสำเร็จ: xxx

// ถ้าเห็น Error
❌ Missing or insufficient permissions
// → ไปแก้ Firestore Rules
```

#### ขั้นที่ 3: Refresh และตรวจสอบ

1. Refresh หน้าเว็บ (F5)
2. ดู Console อีกครั้ง
3. ตรวจสอบ UI:
   - ✅ Company Dropdown แสดงชื่อบริษัท
   - ✅ Role Badge แสดง "👑 Admin"
   - ✅ ปุ่ม "จัดการสมาชิก" แสดง

## ติดต่อ Support

หากทำตามขั้นตอนแล้วยังมีปัญหา กรุณาส่ง:

1. **Screenshot ของ Browser Console** (F12)
2. **Screenshot ของ Firestore Data** (Firebase Console)
3. **ขั้นตอนที่ทำก่อนเกิดปัญหา**
4. **Error Messages** (ถ้ามี)

## ไฟล์ที่เกี่ยวข้อง

- `contexts/CompanyContext.tsx` - จัดการ state ของบริษัท
- `components/CompanySelector.tsx` - Dropdown เลือกบริษัท
- `components/Header.tsx` - แสดง Role Badge และปุ่มจัดการ
- `services/companies.ts` - CRUD บริษัท
- `services/companyMembers.ts` - CRUD สมาชิก
- `firestore.rules` - Security Rules
- `firestore.indexes.json` - Database Indexes

