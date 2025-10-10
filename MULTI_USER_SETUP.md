# 🚀 Multi-user และ Admin Management - Setup Guide

## 📋 สรุปการเปลี่ยนแปลง

ระบบได้รับการอัปเกรดเป็น **Multi-user System** ที่รองรับ:

✅ **User หลายคนในองค์กรเดียวกันเห็นข้อมูลร่วมกัน**
- ทุกคนในองค์กรสามารถเข้าถึงเอกสาร, Template, และข้อมูลขององค์กรได้
- ข้อมูลถูกแชร์แบบ Real-time

✅ **คนสร้างองค์กรเป็น Admin อัตโนมัติ**
- ผู้ที่สร้างองค์กรจะได้รับสิทธิ์ Admin ทันที
- ไม่ต้องตั้งค่าเพิ่มเติม

✅ **Admin จัดการ User ได้**
- เชิญสมาชิกใหม่เข้าองค์กร
- เปลี่ยนบทบาท (Admin ↔ Member)
- ลบสมาชิกออกจากองค์กร

---

## 📁 ไฟล์ที่เพิ่มใหม่

### 1. Types และ Interfaces
- **`types.ts`** - เพิ่ม `UserRole`, `MemberStatus`, `CompanyMember`

### 2. Services (Backend Logic)
- **`services/companyMembers.ts`** - จัดการสมาชิกในองค์กร (ใหม่)
  - `addCompanyMember()` - เชิญสมาชิกใหม่
  - `getCompanyMembers()` - ดูรายการสมาชิก
  - `updateMemberRole()` - เปลี่ยนบทบาท
  - `removeMember()` - ลบสมาชิก
  - `checkIsAdmin()` - ตรวจสอบสิทธิ์ Admin
  - `confirmMembership()` - ยืนยันการเข้าร่วม

### 3. Components (UI)
- **`components/UserManagement.tsx`** - หน้าจัดการสมาชิก (ใหม่)
  - แสดงรายการสมาชิก
  - ฟอร์มเชิญสมาชิกใหม่
  - ปุ่มเปลี่ยนบทบาทและลบสมาชิก
  
- **`components/CompanyMembersList.tsx`** - แสดงรายการองค์กร (ใหม่)
  - แสดงองค์กรที่ User เป็นสมาชิก
  - แสดงบทบาทและจำนวนสมาชิก
  - ปุ่มเปิดหน้าจัดการสมาชิก (สำหรับ Admin)

### 4. Security Rules
- **`firestore.rules`** - อัปเดตเพื่อรองรับ Multi-user
  - เพิ่มฟังก์ชัน `isMemberOfCompany()`
  - เพิ่มฟังก์ชัน `isAdminOfCompany()`
  - อัปเดต Rules ทุก Collection

### 5. Documentation
- **`USER_MANAGEMENT_GUIDE.md`** - คู่มือการใช้งานฉบับเต็ม
- **`MULTI_USER_SETUP.md`** - เอกสารนี้

---

## 📁 ไฟล์ที่แก้ไข

### 1. Types
**`types.ts`**
```typescript
// เพิ่ม Types ใหม่
export type UserRole = 'admin' | 'member';
export type MemberStatus = 'active' | 'pending' | 'inactive';

// เพิ่ม Interface ใหม่
export interface CompanyMember { ... }

// อัปเดต Company Interface
export interface Company {
    ...
    memberCount?: number;  // เพิ่มฟิลด์นี้
}
```

### 2. Services
**`services/companies.ts`**
- อัปเดต `createCompany()` - เพิ่ม Admin คนแรกอัตโนมัติ
- อัปเดต `getUserCompanies()` - ดึงเฉพาะองค์กรที่เป็นสมาชิก
- อัปเดต `getCompanyById()` - เพิ่ม memberCount
- อัปเดต `deleteCompany()` - ตรวจสอบสิทธิ์ Admin

### 3. Firestore Rules
**`firestore.rules`**
- เพิ่มฟังก์ชันตรวจสอบสิทธิ์
- อัปเดต Rules สำหรับ `companies`
- เพิ่ม Rules สำหรับ `companyMembers`
- อัปเดต Rules สำหรับ `deliveryNotes`, `warrantyCards`
- อัปเดต Rules สำหรับ `serviceTemplates`
- อัปเดต Rules สำหรับ `documentNumbers`

---

## 🔧 การติดตั้ง

### ขั้นตอนที่ 1: Deploy Firestore Rules

```bash
# เข้าไปที่ folder โปรเจค
cd pdfexportforDeliveryandCert

# Deploy Security Rules
firebase deploy --only firestore:rules
```

**ผลลัพธ์ที่คาดหวัง:**
```
✔  Deploy complete!
```

### ขั้นตอนที่ 2: ทดสอบระบบ

#### 2.1 สร้างองค์กรใหม่

```typescript
import { createCompany } from './services/companies';

// User A สร้างองค์กร
const companyId = await createCompany({
    name: 'บริษัททดสอบ จำกัด',
    address: '123 ถนนทดสอบ'
});

// ✅ User A จะเป็น Admin อัตโนมัติ
```

#### 2.2 เชิญสมาชิกใหม่

```typescript
import { addCompanyMember } from './services/companyMembers';

// Admin เชิญ User B
await addCompanyMember(companyId, 'userB@example.com', 'member');

// ✅ User B จะได้รับคำเชิญ (สถานะ: pending)
```

#### 2.3 User B Login และยืนยัน

```typescript
// เมื่อ User B Login ครั้งแรก
import { confirmMembership } from './services/companyMembers';

await confirmMembership(
    'userB@example.com',
    'user-b-id',
    '+66812345678',
    'User B'
);

// ✅ User B จะเป็นสมาชิกขององค์กร (สถานะ: active)
```

#### 2.4 ตรวจสอบข้อมูล

```typescript
import { getCompanyMembers } from './services/companyMembers';

const members = await getCompanyMembers(companyId);
console.log('สมาชิกทั้งหมด:', members);

// ผลลัพธ์:
// [
//   { email: 'userA@example.com', role: 'admin', status: 'active' },
//   { email: 'userB@example.com', role: 'member', status: 'active' }
// ]
```

---

## 🎨 การใช้งาน UI Components

### 1. เพิ่ม UserManagement ใน App

```tsx
// App.tsx
import React, { useState } from 'react';
import { useCompany } from './contexts/CompanyContext';
import UserManagement from './components/UserManagement';

function App() {
    const { currentCompany } = useCompany();
    const [showUserManagement, setShowUserManagement] = useState(false);
    
    return (
        <div>
            {/* ปุ่มเปิดหน้าจัดการสมาชิก */}
            {currentCompany && (
                <button onClick={() => setShowUserManagement(true)}>
                    👥 จัดการสมาชิก
                </button>
            )}
            
            {/* Modal จัดการสมาชิก */}
            {showUserManagement && currentCompany && (
                <div className="modal-overlay">
                    <UserManagement
                        companyId={currentCompany.id!}
                        companyName={currentCompany.name}
                        onClose={() => setShowUserManagement(false)}
                    />
                </div>
            )}
        </div>
    );
}
```

### 2. เพิ่ม CompanyMembersList

```tsx
// App.tsx
import CompanyMembersList from './components/CompanyMembersList';

function App() {
    return (
        <div>
            <h1>ระบบจัดการเอกสาร</h1>
            
            {/* แสดงรายการองค์กร */}
            <CompanyMembersList />
        </div>
    );
}
```

---

## 🔐 สิทธิ์และการเข้าถึง

### Admin (👑)
- ✅ เชิญสมาชิกใหม่
- ✅ เปลี่ยนบทบาทสมาชิก
- ✅ ลบสมาชิก
- ✅ แก้ไขข้อมูลองค์กร
- ✅ เข้าถึงข้อมูลทั้งหมด

### Member (👤)
- ✅ ดูรายการสมาชิก
- ✅ เข้าถึงข้อมูลทั้งหมด
- ✅ สร้างและแก้ไขเอกสาร
- ❌ ไม่สามารถเชิญสมาชิกได้
- ❌ ไม่สามารถเปลี่ยนบทบาทได้

---

## 📊 โครงสร้างข้อมูลใน Firestore

### Collection: `companies`
```
companies/
  └── {companyId}/
      ├── name: "บริษัททดสอบ จำกัด"
      ├── address: "123 ถนนทดสอบ"
      ├── userId: "admin-user-id"  // Admin คนแรก
      ├── memberCount: 5
      ├── createdAt: Timestamp
      └── updatedAt: Timestamp
```

### Collection: `companyMembers`
```
companyMembers/
  └── {memberId}/
      ├── companyId: "company-id-123"
      ├── userId: "user-id-456"
      ├── email: "user@example.com"
      ├── phoneNumber: "+66812345678"
      ├── displayName: "John Doe"
      ├── role: "admin" | "member"
      ├── status: "active" | "pending" | "inactive"
      ├── joinedAt: Timestamp
      ├── invitedBy: "admin-user-id"
      ├── createdAt: Timestamp
      └── updatedAt: Timestamp
```

---

## 🔄 Flow การทำงาน

### 1. สร้างองค์กรใหม่
```
User A → createCompany() 
       → สร้าง Company Document
       → เพิ่ม User A เป็น Admin (addFirstAdmin)
       → ✅ เสร็จสิ้น
```

### 2. เชิญสมาชิกใหม่
```
Admin → addCompanyMember(email, role)
      → สร้าง CompanyMember (status: pending)
      → ✅ รอ User Login
```

### 3. User ใหม่ Login ครั้งแรก
```
User B Login → confirmMembership(email, userId)
             → อัปเดต CompanyMember (status: active)
             → เพิ่ม userId
             → ✅ เป็นสมาชิกเต็มรูปแบบ
```

### 4. เข้าถึงข้อมูล
```
User B → getUserCompanies()
       → getUserMemberships(userId)
       → ดึงข้อมูล Companies ที่เป็นสมาชิก
       → ✅ เห็นข้อมูลขององค์กร
```

---

## 🧪 การทดสอบ

### Test Case 1: สร้างองค์กรและตรวจสอบ Admin

```typescript
// 1. User A สร้างองค์กร
const companyId = await createCompany({ name: 'Test Company' });

// 2. ตรวจสอบว่า User A เป็น Admin
const isAdmin = await checkIsAdmin(companyId, userA.uid);
console.assert(isAdmin === true, 'User A ควรเป็น Admin');

// 3. ตรวจสอบจำนวนสมาชิก
const company = await getCompanyById(companyId);
console.assert(company.memberCount === 1, 'ควรมีสมาชิก 1 คน');
```

### Test Case 2: เชิญสมาชิกและตรวจสอบสถานะ

```typescript
// 1. Admin เชิญ User B
await addCompanyMember(companyId, 'userB@example.com', 'member');

// 2. ตรวจสอบสถานะ pending
const members = await getCompanyMembers(companyId);
const userB = members.find(m => m.email === 'userB@example.com');
console.assert(userB.status === 'pending', 'สถานะควรเป็น pending');

// 3. User B Login และยืนยัน
await confirmMembership('userB@example.com', 'user-b-id');

// 4. ตรวจสอบสถานะ active
const updatedMembers = await getCompanyMembers(companyId);
const updatedUserB = updatedMembers.find(m => m.email === 'userB@example.com');
console.assert(updatedUserB.status === 'active', 'สถานะควรเป็น active');
```

### Test Case 3: ตรวจสอบการเข้าถึงข้อมูล

```typescript
// 1. User A สร้างเอกสาร
const docId = await createDeliveryNote({
    companyId: companyId,
    userId: userA.uid,
    // ... ข้อมูลอื่นๆ
});

// 2. User B (Member) ควรเห็นเอกสาร
const docs = await getDeliveryNotes(companyId);
console.assert(docs.length > 0, 'User B ควรเห็นเอกสาร');

// 3. User C (ไม่ใช่สมาชิก) ไม่ควรเห็นเอกสาร
// จะถูกบล็อกโดย Firestore Rules
```

---

## 🐛 การแก้ไขปัญหาที่พบบ่อย

### ❌ ปัญหา: "Permission denied" เมื่อเข้าถึงข้อมูล

**สาเหตุ:** Firestore Rules ยังไม่ได้ Deploy

**วิธีแก้:**
```bash
firebase deploy --only firestore:rules
```

### ❌ ปัญหา: User ไม่เห็นองค์กร

**สาเหตุ:** ยังไม่ได้เป็นสมาชิก

**วิธีแก้:**
1. ตรวจสอบว่าถูกเชิญแล้วหรือยัง
2. Login ด้วยอีเมลที่ถูกเชิญ
3. เรียก `confirmMembership()` เมื่อ Login

### ❌ ปัญหา: ไม่สามารถเชิญสมาชิกได้

**สาเหตุ:** ไม่มีสิทธิ์ Admin

**วิธีแก้:**
```typescript
// ตรวจสอบสิทธิ์
const isAdmin = await checkIsAdmin(companyId, user.uid);
if (!isAdmin) {
    alert('เฉพาะ Admin เท่านั้นที่สามารถเชิญสมาชิกได้');
}
```

### ❌ ปัญหา: ลบ Admin คนเดียวไม่ได้

**สาเหตุ:** ป้องกันไม่ให้องค์กรไม่มี Admin

**วิธีแก้:**
1. เพิ่ม Admin คนอื่นก่อน
2. จึงจะสามารถลบ Admin คนเดิมได้

---

## 📈 Performance Tips

### 1. Cache ข้อมูลสมาชิก

```typescript
// ใช้ React Context หรือ State Management
const [members, setMembers] = useState<CompanyMember[]>([]);

// โหลดครั้งเดียว แล้ว cache
useEffect(() => {
    loadMembers();
}, [companyId]);
```

### 2. Pagination สำหรับองค์กรขนาดใหญ่

```typescript
// ถ้ามีสมาชิกเยอะ ควรใช้ Pagination
const members = await getCompanyMembers(companyId, {
    limit: 50,
    offset: 0
});
```

### 3. Real-time Updates

```typescript
// ใช้ onSnapshot สำหรับ Real-time
import { onSnapshot, collection, query, where } from 'firebase/firestore';

const q = query(
    collection(db, 'companyMembers'),
    where('companyId', '==', companyId)
);

const unsubscribe = onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(doc => doc.data());
    setMembers(members);
});
```

---

## 🎯 Next Steps

### ฟีเจอร์ที่แนะนำให้เพิ่ม

1. **Email Notifications** - ส่งอีเมลเชิญเมื่อเพิ่มสมาชิก
2. **Invitation Links** - สร้างลิงก์เชิญที่สามารถแชร์ได้
3. **Member Permissions** - กำหนดสิทธิ์แบบละเอียดขึ้น
4. **Activity Logs** - บันทึกการกระทำของสมาชิก
5. **Bulk Import** - เพิ่มสมาชิกหลายคนพร้อมกัน

---

## 📞 ติดต่อและสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. อ่านเอกสาร `USER_MANAGEMENT_GUIDE.md`
2. ตรวจสอบ Console Logs
3. ทดสอบด้วย Firebase Emulator

---

## ✅ Checklist การติดตั้งเสร็จสมบูรณ์

- [x] เพิ่ม Types ใหม่ใน `types.ts`
- [x] สร้าง `services/companyMembers.ts`
- [x] อัปเดต `services/companies.ts`
- [x] อัปเดต `firestore.rules`
- [ ] **Deploy Firestore Rules** ⚠️ สำคัญ!
- [x] สร้าง `components/UserManagement.tsx`
- [x] สร้าง `components/CompanyMembersList.tsx`
- [ ] ทดสอบสร้างองค์กร
- [ ] ทดสอบเชิญสมาชิก
- [ ] ทดสอบจัดการสมาชิก

---

**🎉 ระบบพร้อมใช้งานแล้ว!**

อย่าลืม Deploy Firestore Rules ก่อนใช้งานจริงครับ:

```bash
firebase deploy --only firestore:rules
```

---

**เอกสารนี้อัปเดตล่าสุด:** 2025-10-10  
**เวอร์ชัน:** 1.0.0

