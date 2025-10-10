# 📚 คู่มือการใช้งานระบบ Multi-user และ Admin Management

## 📖 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [โครงสร้างข้อมูล](#โครงสร้างข้อมูล)
3. [บทบาทและสิทธิ์](#บทบาทและสิทธิ์)
4. [การใช้งาน Services](#การใช้งาน-services)
5. [การใช้งาน Components](#การใช้งาน-components)
6. [Firestore Security Rules](#firestore-security-rules)
7. [ตัวอย่างการใช้งาน](#ตัวอย่างการใช้งาน)

---

## 🎯 ภาพรวมระบบ

ระบบ Multi-user และ Admin Management ช่วยให้:

- **User หลายคนในองค์กรเดียวกันเห็นข้อมูลร่วมกัน** - ทุกคนในองค์กรสามารถเข้าถึงเอกสาร, Template, และข้อมูลขององค์กรได้
- **คนสร้างองค์กรเป็น Admin อัตโนมัติ** - ผู้ที่สร้างองค์กรจะได้รับสิทธิ์ Admin ทันที
- **Admin จัดการสมาชิกได้** - เชิญสมาชิกใหม่, เปลี่ยนบทบาท, ลบสมาชิก

### ✨ ฟีเจอร์หลัก

1. **Multi-Company Support** - User สามารถเป็นสมาชิกหลายองค์กรได้
2. **Role-Based Access Control** - Admin และ Member มีสิทธิ์ต่างกัน
3. **Invitation System** - เชิญสมาชิกผ่านอีเมล
4. **Shared Data** - ข้อมูลในองค์กรเดียวกันแชร์กันได้

---

## 📊 โครงสร้างข้อมูล

### 1. Company (องค์กร)

```typescript
interface Company {
    id?: string;
    name: string;              // ชื่อบริษัท
    address?: string;          // ที่อยู่บริษัท
    userId: string;            // Admin คนแรก (คนที่สร้างบริษัท)
    logoUrl?: string | null;   // โลโก้บริษัท
    logoType?: LogoType;       // ประเภทโลโก้
    memberCount?: number;      // จำนวนสมาชิกในองค์กร
    createdAt?: Date;
    updatedAt?: Date;
}
```

### 2. CompanyMember (สมาชิกในองค์กร)

```typescript
interface CompanyMember {
    id?: string;                // Document ID
    companyId: string;          // ID ขององค์กร
    userId: string;             // User ID จาก Firebase Auth
    email: string;              // อีเมลของ User
    phoneNumber?: string;       // เบอร์โทรศัพท์
    displayName?: string;       // ชื่อแสดง
    role: UserRole;             // บทบาท: 'admin' หรือ 'member'
    status: MemberStatus;       // สถานะ: 'active', 'pending', 'inactive'
    joinedAt?: Date;            // วันที่เข้าร่วม
    invitedBy?: string;         // User ID ของคนที่เชิญ
    createdAt?: Date;
    updatedAt?: Date;
}
```

### 3. Types

```typescript
// บทบาทของผู้ใช้ในองค์กร
type UserRole = 'admin' | 'member';

// สถานะของสมาชิกในองค์กร
type MemberStatus = 'active' | 'pending' | 'inactive';
```

---

## 🔐 บทบาทและสิทธิ์

### Admin (ผู้จัดการ)

**สิทธิ์:**
- ✅ เชิญสมาชิกใหม่เข้าองค์กร
- ✅ เปลี่ยนบทบาทของสมาชิก (Admin ↔ Member)
- ✅ ลบสมาชิกออกจากองค์กร
- ✅ ดูรายการสมาชิกทั้งหมด
- ✅ แก้ไขข้อมูลองค์กร
- ✅ เข้าถึงข้อมูลทั้งหมดในองค์กร

**ข้อจำกัด:**
- ❌ ไม่สามารถลบตัวเองได้ถ้าเป็น Admin คนเดียว
- ❌ ต้องมี Admin อย่างน้อย 1 คนในองค์กร

### Member (สมาชิกทั่วไป)

**สิทธิ์:**
- ✅ ดูรายการสมาชิกในองค์กร
- ✅ เข้าถึงข้อมูลทั้งหมดในองค์กร
- ✅ สร้างและแก้ไขเอกสาร
- ✅ ใช้ Template ร่วมกัน

**ข้อจำกัด:**
- ❌ ไม่สามารถเชิญสมาชิกใหม่ได้
- ❌ ไม่สามารถเปลี่ยนบทบาทของสมาชิกได้
- ❌ ไม่สามารถลบสมาชิกได้

---

## 🛠️ การใช้งาน Services

### 1. สร้างองค์กรใหม่

```typescript
import { createCompany } from './services/companies';

// สร้างองค์กรใหม่ (ผู้สร้างจะเป็น Admin อัตโนมัติ)
const companyId = await createCompany({
    name: 'บริษัท ABC จำกัด',
    address: '123 ถนนสุขุมวิท กรุงเทพฯ',
    logoUrl: null,
    logoType: 'default'
});

console.log('✅ สร้างองค์กรสำเร็จ:', companyId);
```

### 2. เชิญสมาชิกใหม่ (Admin เท่านั้น)

```typescript
import { addCompanyMember } from './services/companyMembers';

// เชิญสมาชิกใหม่เข้าองค์กร
const memberId = await addCompanyMember(
    'company-id-123',           // ID ขององค์กร
    'user@example.com',         // อีเมลของสมาชิก
    'member'                    // บทบาท: 'admin' หรือ 'member'
);

console.log('✅ เชิญสมาชิกสำเร็จ:', memberId);
```

### 3. ดูรายการสมาชิกในองค์กร

```typescript
import { getCompanyMembers } from './services/companyMembers';

// ดึงรายการสมาชิกทั้งหมด
const members = await getCompanyMembers('company-id-123');

console.log('📋 สมาชิกทั้งหมด:', members.length, 'คน');
members.forEach(member => {
    console.log(`- ${member.email} (${member.role})`);
});
```

### 4. ตรวจสอบสิทธิ์ Admin

```typescript
import { checkIsAdmin } from './services/companyMembers';

// ตรวจสอบว่า User เป็น Admin หรือไม่
const isAdmin = await checkIsAdmin('company-id-123', 'user-id-456');

if (isAdmin) {
    console.log('👑 User นี้เป็น Admin');
} else {
    console.log('👤 User นี้เป็น Member');
}
```

### 5. เปลี่ยนบทบาทของสมาชิก (Admin เท่านั้น)

```typescript
import { updateMemberRole } from './services/companyMembers';

// เปลี่ยนบทบาทเป็น Admin
await updateMemberRole('member-id-789', 'admin');

console.log('✅ เปลี่ยนบทบาทเป็น Admin สำเร็จ');
```

### 6. ลบสมาชิก (Admin เท่านั้น)

```typescript
import { removeMember } from './services/companyMembers';

// ลบสมาชิกออกจากองค์กร
await removeMember('member-id-789');

console.log('✅ ลบสมาชิกสำเร็จ');
```

### 7. ดูรายการองค์กรที่ User เป็นสมาชิก

```typescript
import { getUserCompanies } from './services/companies';

// ดึงรายการองค์กรทั้งหมดที่ User เป็นสมาชิก
const companies = await getUserCompanies();

console.log('📋 องค์กรของฉัน:', companies.length, 'องค์กร');
companies.forEach(company => {
    console.log(`- ${company.name} (${company.memberCount} สมาชิก)`);
});
```

### 8. ยืนยันการเข้าร่วมองค์กร (Auto-confirm เมื่อ Login)

```typescript
import { confirmMembership } from './services/companyMembers';

// ยืนยันการเข้าร่วมองค์กร (เรียกใช้เมื่อ User login ครั้งแรก)
await confirmMembership(
    'user@example.com',         // อีเมลของ User
    'user-id-456',              // User ID
    '+66812345678',             // เบอร์โทร (optional)
    'John Doe'                  // ชื่อแสดง (optional)
);

console.log('✅ ยืนยันการเข้าร่วมองค์กรสำเร็จ');
```

---

## 🎨 การใช้งาน Components

### 1. UserManagement Component

Component สำหรับ Admin จัดการสมาชิกในองค์กร

```tsx
import UserManagement from './components/UserManagement';

function App() {
    return (
        <UserManagement
            companyId="company-id-123"
            companyName="บริษัท ABC จำกัด"
            onClose={() => console.log('ปิดหน้าจัดการสมาชิก')}
        />
    );
}
```

**ฟีเจอร์:**
- 📋 แสดงรายการสมาชิกทั้งหมด
- ➕ เชิญสมาชิกใหม่ (Admin เท่านั้น)
- 🔄 เปลี่ยนบทบาท Admin ↔ Member (Admin เท่านั้น)
- 🗑️ ลบสมาชิก (Admin เท่านั้น)
- 👤 แสดงข้อมูล: อีเมล, ชื่อ, เบอร์โทร, บทบาท, สถานะ

### 2. CompanyMembersList Component

Component แสดงรายการองค์กรที่ User เป็นสมาชิก

```tsx
import CompanyMembersList from './components/CompanyMembersList';

function App() {
    return <CompanyMembersList />;
}
```

**ฟีเจอร์:**
- 📋 แสดงรายการองค์กรทั้งหมดที่ User เป็นสมาชิก
- 👑 แสดงบทบาท (Admin/Member)
- 👥 แสดงจำนวนสมาชิก
- 🔧 ปุ่มจัดการสมาชิก (สำหรับ Admin)
- 🔄 รีเฟรชข้อมูล

---

## 🔒 Firestore Security Rules

### 1. ฟังก์ชันตรวจสอบสิทธิ์

```javascript
// ตรวจสอบว่าเป็นสมาชิกขององค์กรหรือไม่
function isMemberOfCompany(companyId) {
    return exists(/databases/$(database)/documents/companyMembers/$(request.auth.uid + '_' + companyId))
        || exists(/databases/$(database)/documents/companyMembers/$(companyId + '_' + request.auth.uid));
}

// ตรวจสอบว่าเป็น Admin ขององค์กรหรือไม่
function isAdminOfCompany(companyId) {
    let memberDoc = get(/databases/$(database)/documents/companyMembers/$(request.auth.uid + '_' + companyId));
    return memberDoc.data.role == 'admin' && memberDoc.data.status == 'active';
}
```

### 2. Rules สำหรับ Companies

```javascript
match /companies/{companyId} {
    // อ่านได้เฉพาะสมาชิกในองค์กร
    allow read: if isAuthenticated() && isMemberOfCompany(companyId);
    
    // สร้างได้เฉพาะผู้ที่ Login
    allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    
    // แก้ไขได้เฉพาะสมาชิกในองค์กร
    allow update: if isAuthenticated() && isMemberOfCompany(companyId);
    
    // ลบได้เฉพาะ Admin คนแรก
    allow delete: if isAuthenticated() && isOwner(resource.data.userId);
}
```

### 3. Rules สำหรับ Company Members

```javascript
match /companyMembers/{memberId} {
    // อ่านได้เฉพาะสมาชิกในองค์กรเดียวกัน
    allow read: if isAuthenticated() && (
        isOwner(resource.data.userId) ||
        isMemberOfCompany(resource.data.companyId)
    );
    
    // สร้างได้เฉพาะ Admin
    allow create: if isAuthenticated() && (
        request.resource.data.userId == request.auth.uid ||
        isAdminOfCompany(request.resource.data.companyId)
    );
    
    // แก้ไขได้เฉพาะ Admin หรือตัวเอง
    allow update: if isAuthenticated() && (
        isOwner(resource.data.userId) ||
        isAdminOfCompany(resource.data.companyId)
    );
    
    // ลบได้เฉพาะ Admin
    allow delete: if isAuthenticated() && isAdminOfCompany(resource.data.companyId);
}
```

### 4. Rules สำหรับเอกสาร (Delivery Notes, Warranty Cards)

```javascript
match /deliveryNotes/{documentId} {
    // อ่านได้ถ้าเป็นสมาชิกในองค์กรเดียวกัน
    allow read: if isAuthenticated() && (
        isOwner(resource.data.userId) ||
        (resource.data.companyId != null && isMemberOfCompany(resource.data.companyId))
    );
    
    // สร้างได้เฉพาะผู้ที่ Login
    allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    
    // แก้ไข/ลบได้ถ้าเป็นสมาชิกในองค์กรเดียวกัน
    allow update, delete: if isAuthenticated() && (
        isOwner(resource.data.userId) ||
        (resource.data.companyId != null && isMemberOfCompany(resource.data.companyId))
    );
}
```

---

## 💡 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: สร้างองค์กรและเชิญสมาชิก

```typescript
import { createCompany } from './services/companies';
import { addCompanyMember } from './services/companyMembers';

async function setupNewCompany() {
    try {
        // 1. สร้างองค์กรใหม่
        const companyId = await createCompany({
            name: 'บริษัท XYZ จำกัด',
            address: '456 ถนนพระราม 4 กรุงเทพฯ'
        });
        
        console.log('✅ สร้างองค์กรสำเร็จ:', companyId);
        console.log('👑 คุณเป็น Admin อัตโนมัติ');
        
        // 2. เชิญสมาชิกใหม่
        await addCompanyMember(companyId, 'member1@example.com', 'member');
        await addCompanyMember(companyId, 'admin2@example.com', 'admin');
        
        console.log('✅ เชิญสมาชิก 2 คนสำเร็จ');
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error);
    }
}
```

### ตัวอย่างที่ 2: แสดงรายการสมาชิกและจัดการ

```typescript
import { getCompanyMembers, checkIsAdmin } from './services/companyMembers';
import { useAuth } from './contexts/AuthContext';

function MembersList({ companyId }: { companyId: string }) {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    
    useEffect(() => {
        async function loadData() {
            // ตรวจสอบสิทธิ์
            const adminStatus = await checkIsAdmin(companyId, user!.uid);
            setIsAdmin(adminStatus);
            
            // โหลดสมาชิก
            const membersList = await getCompanyMembers(companyId);
            setMembers(membersList);
        }
        
        loadData();
    }, [companyId]);
    
    return (
        <div>
            <h2>สมาชิกทั้งหมด ({members.length} คน)</h2>
            {isAdmin && <p>👑 คุณเป็น Admin</p>}
            
            <ul>
                {members.map(member => (
                    <li key={member.id}>
                        {member.email} - {member.role}
                        {member.status === 'pending' && ' (รอยืนยัน)'}
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

### ตัวอย่างที่ 3: ใช้งานใน App Component

```tsx
import React, { useState } from 'react';
import { useCompany } from './contexts/CompanyContext';
import CompanyMembersList from './components/CompanyMembersList';
import UserManagement from './components/UserManagement';

function App() {
    const { currentCompany } = useCompany();
    const [showMembers, setShowMembers] = useState(false);
    
    return (
        <div>
            <h1>ระบบจัดการเอกสาร</h1>
            
            {/* แสดงองค์กรปัจจุบัน */}
            {currentCompany && (
                <div>
                    <h2>องค์กร: {currentCompany.name}</h2>
                    <button onClick={() => setShowMembers(true)}>
                        👥 จัดการสมาชิก
                    </button>
                </div>
            )}
            
            {/* Modal จัดการสมาชิก */}
            {showMembers && currentCompany && (
                <div className="modal">
                    <UserManagement
                        companyId={currentCompany.id!}
                        companyName={currentCompany.name}
                        onClose={() => setShowMembers(false)}
                    />
                </div>
            )}
        </div>
    );
}
```

---

## 🚀 การ Deploy

### 1. Deploy Firestore Rules

```bash
# Deploy Security Rules
firebase deploy --only firestore:rules

# ตรวจสอบ Rules
firebase firestore:rules:get
```

### 2. ทดสอบ Rules ใน Firebase Console

1. เปิด Firebase Console
2. ไปที่ Firestore Database → Rules
3. ทดสอบ Rules ด้วย Rules Playground

---

## 📝 หมายเหตุ

### ข้อควรระวัง

1. **Admin คนเดียว** - ต้องมี Admin อย่างน้อย 1 คนในองค์กร ไม่สามารถลบ Admin คนเดียวได้
2. **Pending Members** - สมาชิกที่ถูกเชิญจะมีสถานะ `pending` จนกว่าจะ Login ครั้งแรก
3. **Email Matching** - ระบบจับคู่สมาชิกด้วยอีเมล ต้องใช้อีเมลเดียวกับที่ Login
4. **Firestore Rules** - ตรวจสอบให้แน่ใจว่า Deploy Rules แล้ว

### Best Practices

1. ✅ เชิญสมาชิกด้วยอีเมลที่ถูกต้อง
2. ✅ ตั้งค่าบทบาทให้เหมาะสม (Admin/Member)
3. ✅ อัปเดต memberCount เมื่อมีการเปลี่ยนแปลงสมาชิก
4. ✅ ตรวจสอบสิทธิ์ก่อนทำงานสำคัญ
5. ✅ จัดการ Error ให้เหมาะสม

---

## 🆘 การแก้ไขปัญหา

### ปัญหา: ไม่สามารถเห็นข้อมูลองค์กร

**สาเหตุ:** ไม่ได้เป็นสมาชิกขององค์กร

**วิธีแก้:**
1. ตรวจสอบว่าถูกเชิญเข้าองค์กรแล้วหรือยัง
2. Login ด้วยอีเมลที่ถูกเชิญ
3. ตรวจสอบสถานะใน `companyMembers` collection

### ปัญหา: ไม่สามารถเชิญสมาชิกได้

**สาเหตุ:** ไม่มีสิทธิ์ Admin

**วิธีแก้:**
1. ตรวจสอบว่าเป็น Admin หรือไม่
2. ขอให้ Admin เปลี่ยนบทบาทเป็น Admin

### ปัญหา: Firestore Rules ไม่ทำงาน

**สาเหตุ:** ยังไม่ Deploy Rules

**วิธีแก้:**
```bash
firebase deploy --only firestore:rules
```

---

## 📚 เอกสารเพิ่มเติม

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Context API](https://react.dev/reference/react/useContext)

---

## ✅ Checklist การติดตั้ง

- [ ] เพิ่ม Types ใน `types.ts`
- [ ] สร้าง `services/companyMembers.ts`
- [ ] อัปเดต `services/companies.ts`
- [ ] อัปเดต `firestore.rules`
- [ ] Deploy Firestore Rules
- [ ] สร้าง `components/UserManagement.tsx`
- [ ] สร้าง `components/CompanyMembersList.tsx`
- [ ] ทดสอบการสร้างองค์กร
- [ ] ทดสอบการเชิญสมาชิก
- [ ] ทดสอบการจัดการสมาชิก

---

**เอกสารนี้อัปเดตล่าสุด:** 2025-10-10

**เวอร์ชัน:** 1.0.0

