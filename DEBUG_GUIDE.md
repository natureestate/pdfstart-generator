# คู่มือ Debug Multi-User System

## วิธีตรวจสอบว่าระบบทำงานถูกต้อง

### 1. เปิด Browser Console (F12)

เมื่อ Login เข้าระบบ คุณจะเห็น logs ดังนี้:

```
🔄 [CompanyContext] เริ่มโหลดบริษัท, User: your-email@example.com
⏳ [CompanyContext] กำลังโหลด...
📋 ดึงบริษัทจาก memberships: X องค์กร
📋 รวมทั้งหมด: X บริษัท
📋 [CompanyContext] ดึงบริษัทได้: X องค์กร [Array]
✅ [CompanyContext] เลือกบริษัทแรก: ชื่อบริษัท
✅ [CompanyContext] โหลดเสร็จสิ้น
```

### 2. ตรวจสอบ CompanySelector

```
🏢 [CompanySelector] Rendered
🏢 [CompanySelector] Current Company: {id: "...", name: "..."}
🏢 [CompanySelector] All Companies: [{...}, {...}]
🏢 [CompanySelector] Loading: false
🏢 [CompanySelector] Show Dropdown: false
```

### 3. ตรวจสอบ Admin Status

```
👑 [Header] ตรวจสอบสิทธิ์ Admin
👑 [Header] User: your-email@example.com
👑 [Header] Current Company: ชื่อบริษัท company-id
👑 [Header] Admin Status: true/false
```

## ปัญหาที่อาจพบและวิธีแก้

### ปัญหา 1: ไม่มีบริษัทเลย (companies.length = 0)

**สาเหตุ:**
- ยังไม่เคยสร้างบริษัท
- Firestore Rules บล็อกการอ่านข้อมูล
- User ไม่มีสิทธิ์เข้าถึงบริษัท

**วิธีแก้:**
1. คลิกปุ่ม Company Selector → สร้างบริษัทใหม่
2. ตรวจสอบ Firestore Rules
3. ตรวจสอบว่ามี document ใน collection `companyMembers` หรือไม่

### ปัญหา 2: Dropdown ไม่แสดง

**สาเหตุ:**
- `companies.length === 0` → จะแสดงปุ่มสร้างบริษัทแทน
- `currentCompany === null` → จะแสดงปุ่มสร้างบริษัทแทน

**วิธีแก้:**
1. ตรวจสอบ Console ว่า `companies` มีค่าหรือไม่
2. ถ้ามีบริษัทแล้ว แต่ dropdown ไม่แสดง → ตรวจสอบ `showDropdown` state

### ปัญหา 3: Role Badge ไม่แสดง

**สาเหตุ:**
- `currentCompany === null` → Badge จะไม่แสดง (ตาม code ที่ line 69 ใน Header.tsx)
- `isAdmin` ยังไม่ได้รับค่าจาก `checkIsAdmin()`

**วิธีแก้:**
1. ตรวจสอบว่า `currentCompany` มีค่าหรือไม่
2. ตรวจสอบ Console ว่า `checkIsAdmin()` ทำงานหรือไม่
3. ตรวจสอบว่ามี document ใน `companyMembers` collection หรือไม่

### ปัญหา 4: ปุ่ม "จัดการสมาชิก" ไม่แสดง

**สาเหตุ:**
- `isAdmin === false` → ปุ่มจะไม่แสดง (เฉพาะ Admin เท่านั้น)
- `currentCompany === null` → ปุ่มจะไม่แสดง

**วิธีแก้:**
1. ตรวจสอบว่าคุณเป็น Admin หรือไม่ (ดูที่ Console)
2. ตรวจสอบ Firestore collection `companyMembers` ว่ามี document ที่:
   - `userId` = User ID ของคุณ
   - `companyId` = Company ID ปัจจุบัน
   - `role` = "admin"
   - `status` = "active"

## ตรวจสอบข้อมูลใน Firestore

### Collection: `companies`

```
{
  id: "auto-generated-id",
  name: "ชื่อบริษัท",
  address: "ที่อยู่",
  userId: "user-id-ของ-admin-คนแรก",
  memberCount: 1,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `companyMembers`

```
{
  id: "auto-generated-id",
  companyId: "company-id",
  userId: "user-id",
  email: "email@example.com",
  role: "admin" | "member",
  status: "active" | "pending" | "inactive",
  joinedAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Firestore Indexes ที่จำเป็น

ตรวจสอบว่ามี indexes ดังนี้:

1. **companyMembers**: `companyId` (Ascending) + `createdAt` (Descending)
2. **companyMembers**: `userId` (Ascending) + `status` (Ascending) + `createdAt` (Descending)
3. **companyMembers**: `companyId` (Ascending) + `userId` (Ascending) + `role` (Ascending) + `status` (Ascending)

## คำสั่ง Debug เพิ่มเติม

### ตรวจสอบ User ปัจจุบัน

เปิด Console แล้วพิมพ์:

```javascript
firebase.auth().currentUser
```

### ตรวจสอบ Companies

```javascript
// ใน Console
const { companies, currentCompany } = useCompany()
console.log('Companies:', companies)
console.log('Current:', currentCompany)
```

### Force Refresh Companies

```javascript
// ใน Console (ถ้าใช้ได้)
refreshCompanies()
```

## การทดสอบ Multi-User System

### ขั้นตอนที่ 1: สร้างบริษัท

1. Login ด้วย User A
2. คลิก Company Selector → สร้างบริษัทใหม่
3. ตรวจสอบว่าเห็น:
   - Company Dropdown แสดงชื่อบริษัท
   - Role Badge แสดง "👑 Admin"
   - ปุ่ม "จัดการสมาชิก" แสดง

### ขั้นตอนที่ 2: เชิญสมาชิก

1. คลิกปุ่ม "จัดการสมาชิก"
2. กรอกอีเมลของ User B
3. เลือกบทบาท (Admin หรือ Member)
4. คลิก "เชิญสมาชิก"

### ขั้นตอนที่ 3: ทดสอบ User B

1. Logout จาก User A
2. Login ด้วย User B (อีเมลที่ถูกเชิญ)
3. ตรวจสอบว่าเห็นบริษัทใน Company Dropdown
4. ตรวจสอบ Role Badge (Admin หรือ Member)
5. ถ้าเป็น Member จะไม่เห็นปุ่ม "จัดการสมาชิก"

## ติดต่อ Support

หากยังมีปัญหา กรุณาส่ง:
1. Screenshot ของ Browser Console
2. Screenshot ของ Firestore Data
3. อธิบายขั้นตอนที่ทำก่อนเกิดปัญหา

