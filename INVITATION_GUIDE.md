# 📨 คู่มือระบบเชิญสมาชิกเข้าองค์กร (Invitation System)

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [คุณสมบัติหลัก](#คุณสมบัติหลัก)
3. [วิธีการใช้งาน](#วิธีการใช้งาน)
4. [โครงสร้างข้อมูล](#โครงสร้างข้อมูล)
5. [การตั้งค่า](#การตั้งค่า)
6. [การแก้ไขปัญหา](#การแก้ไขปัญหา)

---

## 🎯 ภาพรวมระบบ

ระบบเชิญสมาชิก (Invitation System) เป็นฟีเจอร์ที่ช่วยให้ Admin ขององค์กรสามารถเชิญผู้ใช้ใหม่เข้าร่วมองค์กรได้อย่างง่ายดาย โดยรองรับทั้ง:

- ✅ **ผู้ใช้ที่มีบัญชีแล้ว** - สามารถยอมรับคำเชิญด้วยบัญชีที่มีอยู่
- ✅ **ผู้ใช้ที่ยังไม่มีบัญชี** - สามารถสร้างบัญชีใหม่และยอมรับคำเชิญในคราวเดียว

---

## 🌟 คุณสมบัติหลัก

### 1. การเชิญสมาชิก
- เชิญผqez้ใช้ผ่านอีเมล
- กำหนดบทบาท (Admin หรือ Member)
- เพิ่มข้อความส่วนตัวถึงผู้ถูกเชิญ
- ส่งอีเมลเชิญอัตโนมัติ (ถ้าต้องการ)

### 2. การจัดการคำเชิญ
- ดูรายการคำเชิญทั้งหมด
- ตรวจสอบสถานะคำเชิญ (รอการยอมรับ, ยอมรับแล้ว, ปฏิเสธ, หมดอายุ)
- ส่งคำเชิญใหม่ (Resend)
- ยกเลิกคำเชิญ

### 3. การยอมรับคำเชิญ
- หน้ายอมรับคำเชิญที่สวยงาม
- แสดงข้อมูลองค์กรและบทบาท
- รองรับการ Login/สร้างบัญชีใหม่
- ตรวจสอบวันหมดอายุอัตโนมัติ

### 4. ความปลอดภัย
- Token แบบสุ่มสำหรับแต่ละคำเชิญ
- คำเชิญหมดอายุใน 7 วัน
- ตรวจสอบสิทธิ์ Admin เท่านั้นที่สามารถเชิญได้
- ตรวจสอบอีเมลตรงกันก่อนยอมรับ

---

## 📖 วิธีการใช้งาน

### สำหรับ Admin: การเชิญสมาชิกใหม่

#### ขั้นตอนที่ 1: เปิดหน้าจัดการสมาชิก

1. คลิกที่เมนู **"จัดการสมาชิก"** ใน Header
2. หรือไปที่หน้าตั้งค่าองค์กร

#### ขั้นตอนที่ 2: เชิญสมาชิกใหม่

1. คลิกปุ่ม **"📨 เชิญสมาชิกใหม่"**
2. กรอกข้อมูล:
   - **อีเมลผู้ถูกเชิญ** (จำเป็น)
   - **บทบาท**: Admin หรือ Member
   - **ข้อความถึงผู้ถูกเชิญ** (ไม่บังคับ)
3. เลือกว่าจะ **ส่งอีเมลอัตโนมัติ** หรือไม่
4. คลิก **"📨 ส่งคำเชิญ"**

```typescript
// ตัวอย่างการใช้งาน Service
import { createInvitation } from './services/invitations';

const invitation = await createInvitation(
    'company-id',
    'บริษัท ABC',
    'user@example.com',
    'member',
    'ยินดีต้อนรับเข้าสู่ทีมของเรา!'
);
```

#### ขั้นตอนที่ 3: จัดการคำเชิญ

1. ไปที่แท็บ **"📨 คำเชิญ"** ในหน้าจัดการสมาชิก
2. ดูรายการคำเชิญทั้งหมด พร้อมสถานะ:
   - ⏳ **รอการยอมรับ** (Pending)
   - ✅ **ยอมรับแล้ว** (Accepted)
   - ❌ **ปฏิเสธ** (Rejected)
   - ⏰ **หมดอายุ** (Expired)

3. สำหรับคำเชิญที่รอการยอมรับ สามารถ:
   - 🔄 **ส่งใหม่** - สร้าง Token ใหม่และขยายเวลา
   - 🗑️ **ยกเลิก** - ลบคำเชิญ

---

### สำหรับผู้ถูกเชิญ: การยอมรับคำเชิญ

#### ขั้นตอนที่ 1: เปิดลิงก์คำเชิญ

1. เปิดอีเมลที่ได้รับจากองค์กร
2. คลิกปุ่ม **"ยอมรับคำเชิญ"** ในอีเมล
3. หรือคัดลอกลิงก์ไปวางในเบราว์เซอร์

ลิงก์จะมีรูปแบบ:
```
https://your-app-domain.web.app/accept-invitation?token=ABC123...
```

#### ขั้นตอนที่ 2: ตรวจสอบข้อมูล

หน้ายอมรับคำเชิญจะแสดง:
- 🏢 ชื่อองค์กร
- 📧 อีเมลของคุณ
- 👤 บทบาทที่จะได้รับ
- ✉️ ผู้เชิญ
- ⏰ วันหมดอายุ
- 💬 ข้อความจากผู้เชิญ (ถ้ามี)
- 📋 สิทธิ์ของบทบาท

#### ขั้นตอนที่ 3: ยอมรับหรือปฏิเสธ

**กรณีที่ 1: มีบัญชีแล้ว**
1. คลิก **"✅ ยอมรับคำเชิญ"**
2. Login ด้วยอีเมลที่ตรงกับคำเชิญ
3. ระบบจะเพิ่มคุณเข้าองค์กรอัตโนมัติ

**กรณีที่ 2: ยังไม่มีบัญชี**
1. คลิก **"🔐 Login เพื่อยอมรับ"**
2. สร้างบัญชีใหม่ด้วยอีเมลที่ถูกเชิญ
3. ระบบจะเพิ่มคุณเข้าองค์กรอัตโนมัติ

**ปฏิเสธคำเชิญ:**
- คลิก **"❌ ปฏิเสธ"** ถ้าไม่ต้องการเข้าร่วม

---

## 🗂️ โครงสร้างข้อมูล

### Invitation Interface

```typescript
interface Invitation {
    id?: string;                   // Document ID
    companyId: string;             // ID ขององค์กรที่เชิญ
    companyName: string;           // ชื่อองค์กร
    email: string;                 // อีเมลของผู้ถูกเชิญ
    role: UserRole;                // บทบาท: 'admin' | 'member'
    status: InvitationStatus;      // สถานะ: 'pending' | 'accepted' | 'rejected' | 'expired'
    invitedBy: string;             // User ID ของผู้เชิญ
    invitedByName?: string;        // ชื่อของผู้เชิญ
    invitedByEmail?: string;       // อีเมลของผู้เชิญ
    token: string;                 // Token สำหรับยืนยัน (unique, 32 ตัวอักษร)
    expiresAt: Date;               // วันหมดอายุ (7 วันจากวันสร้าง)
    acceptedAt?: Date;             // วันที่ยอมรับ
    acceptedBy?: string;           // User ID ของผู้ยอมรับ
    message?: string;              // ข้อความจากผู้เชิญ
    createdAt?: Date;
    updatedAt?: Date;
}
```

### Firestore Collection

```
invitations/
  ├── {invitationId}/
  │   ├── companyId: "company-123"
  │   ├── companyName: "บริษัท ABC"
  │   ├── email: "user@example.com"
  │   ├── role: "member"
  │   ├── status: "pending"
  │   ├── token: "ABC123XYZ..."
  │   ├── expiresAt: Timestamp
  │   └── ...
```

---

## ⚙️ การตั้งค่า

### 1. ติดตั้ง Dependencies

```bash
npm install react-router-dom
```

### 2. ตั้งค่า Firebase Functions

#### ติดตั้ง Dependencies สำหรับ Functions

```bash
cd functions
npm install
```

#### Deploy Functions

```bash
firebase deploy --only functions:sendInvitationEmail
```

### 3. ตั้งค่า Firebase Email Extension (ถ้าต้องการส่งอีเมลจริง)

#### ติดตั้ง Extension

```bash
firebase ext:install firebase/firestore-send-email
```

#### กำหนดค่า

1. **SMTP Connection URI**: ใช้ Gmail, SendGrid, หรือ SMTP อื่นๆ
   ```
   smtps://username:password@smtp.gmail.com:465
   ```

2. **Default FROM**: อีเมลผู้ส่ง
   ```
   noreply@your-domain.com
   ```

3. **Firestore Collection**: `mail`

### 4. อัปเดต Base URL ใน Functions

แก้ไขไฟล์ `functions/src/index.ts`:

```typescript
const baseUrl = process.env.FUNCTIONS_EMULATOR
    ? 'http://localhost:5173'
    : 'https://your-actual-domain.web.app'; // เปลี่ยนเป็น domain จริง
```

### 5. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

---

## 🔧 API Reference

### Services

#### `invitations.ts`

```typescript
// สร้างคำเชิญ
createInvitation(
    companyId: string,
    companyName: string,
    email: string,
    role: UserRole,
    message?: string
): Promise<Invitation>

// ดึงคำเชิญตาม Token
getInvitationByToken(token: string): Promise<Invitation | null>

// ดึงคำเชิญตามอีเมล
getInvitationByEmail(
    companyId: string,
    email: string
): Promise<Invitation | null>

// ดึงรายการคำเชิญทั้งหมดขององค์กร
getCompanyInvitations(companyId: string): Promise<Invitation[]>

// ยอมรับคำเชิญ
acceptInvitation(token: string, userId: string): Promise<Invitation>

// ปฏิเสธคำเชิญ
rejectInvitation(token: string): Promise<void>

// ยกเลิกคำเชิญ (Admin)
cancelInvitation(invitationId: string): Promise<void>

// ส่งคำเชิญใหม่ (Admin)
resendInvitation(invitationId: string): Promise<Invitation>

// ตรวจสอบคำเชิญที่หมดอายุ
checkExpiredInvitations(companyId: string): Promise<void>
```

### Firebase Functions

#### `sendInvitationEmail`

```typescript
// เรียกใช้งาน
const functions = getFunctions();
const sendEmail = httpsCallable(functions, 'sendInvitationEmail');

await sendEmail({
    invitationId: 'invitation-123',
    email: 'user@example.com',
    companyName: 'บริษัท ABC',
    role: 'member',
    invitedByName: 'Admin User',
    invitedByEmail: 'admin@company.com',
    token: 'ABC123...',
    message: 'ยินดีต้อนรับ!'
});
```

---

## 🎨 Components

### 1. InviteMemberModal

Modal สำหรับเชิญสมาชิกใหม่

```tsx
<InviteMemberModal
    companyId="company-123"
    companyName="บริษัท ABC"
    onClose={() => setShowModal(false)}
    onSuccess={() => loadMembers()}
/>
```

### 2. AcceptInvitationPage

หน้ายอมรับคำเชิญ (Route: `/accept-invitation?token=...`)

```tsx
<Route path="/accept-invitation" element={<AcceptInvitationPage />} />
```

### 3. UserManagement (Updated)

Component จัดการสมาชิก พร้อมแท็บคำเชิญ

```tsx
<UserManagement
    companyId="company-123"
    companyName="บริษัท ABC"
    onClose={() => setShowManagement(false)}
/>
```

---

## 🔐 Firestore Security Rules

```javascript
// Invitations Collection
match /invitations/{invitationId} {
  // อ่านได้ถ้าเป็น Admin หรือเจ้าของอีเมล
  allow read: if isAuthenticated() && (
    isAdminOfCompany(resource.data.companyId) ||
    request.auth.token.email == resource.data.email
  );
  
  // สร้างได้เฉพาะ Admin
  allow create: if isAuthenticated() && 
    isAdminOfCompany(request.resource.data.companyId);
  
  // แก้ไขได้ถ้าเป็น Admin หรือเจ้าของอีเมล
  allow update: if isAuthenticated() && (
    isAdminOfCompany(resource.data.companyId) ||
    request.auth.token.email == resource.data.email
  );
  
  // ลบได้เฉพาะ Admin
  allow delete: if isAuthenticated() && 
    isAdminOfCompany(resource.data.companyId);
}
```

---

## 🐛 การแก้ไขปัญหา

### ปัญหา: ไม่สามารถส่งอีเมลได้

**สาเหตุที่เป็นไปได้:**
1. ยังไม่ได้ติดตั้ง Firebase Email Extension
2. SMTP Configuration ไม่ถูกต้อง
3. Firebase Functions ยังไม่ได้ Deploy

**วิธีแก้:**
```bash
# 1. ตรวจสอบ Extension
firebase ext:list

# 2. ติดตั้ง Extension
firebase ext:install firebase/firestore-send-email

# 3. Deploy Functions
firebase deploy --only functions
```

### ปัญหา: คำเชิญหมดอายุทันที

**สาเหตุ:** เวลาเซิร์ฟเวอร์ไม่ตรงกับเวลาจริง

**วิธีแก้:**
```typescript
// ใช้ Timestamp จาก Firebase แทน Date
import { Timestamp } from 'firebase/firestore';

const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7);

await setDoc(docRef, {
    ...data,
    expiresAt: Timestamp.fromDate(expiresAt) // ✅ ถูกต้อง
});
```

### ปัญหา: ไม่สามารถยอมรับคำเชิญได้

**สาเหตุที่เป็นไปได้:**
1. อีเมลไม่ตรงกับคำเชิญ
2. คำเชิญหมดอายุแล้ว
3. Firestore Rules ไม่อนุญาต

**วิธีแก้:**
```bash
# 1. ตรวจสอบ Firestore Rules
firebase deploy --only firestore:rules

# 2. ตรวจสอบ Log
firebase functions:log

# 3. ตรวจสอบข้อมูลใน Firestore Console
```

### ปัญหา: Route ไม่ทำงาน

**สาเหตุ:** ยังไม่ได้ติดตั้ง react-router-dom

**วิธีแก้:**
```bash
npm install react-router-dom
```

---

## 📊 Flow Diagram

```
┌─────────────┐
│   Admin     │
│  เชิญสมาชิก  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ สร้างคำเชิญ          │
│ - สร้าง Token       │
│ - กำหนดวันหมดอายุ   │
│ - บันทึกใน Firestore│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ ส่งอีเมล (Optional) │
│ - เรียก Function    │
│ - สร้างอีเมล HTML   │
│ - ส่งผ่าน Extension │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ ผู้ถูกเชิญ          │
│ - เปิดลิงก์         │
│ - ตรวจสอบข้อมูล     │
│ - Login/สร้างบัญชี  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ ยอมรับคำเชิญ         │
│ - อัปเดตสถานะ       │
│ - เพิ่มเป็นสมาชิก    │
│ - อัปเดตจำนวนสมาชิก │
└─────────────────────┘
```

---

## 🎯 Best Practices

### 1. การตั้งชื่ออีเมล

```typescript
// ✅ ดี - ใช้อีเมลจริงขององค์กร
from: 'noreply@your-company.com'

// ❌ ไม่ดี - ใช้อีเมลส่วนตัว
from: 'admin@gmail.com'
```

### 2. ข้อความเชิญ

```typescript
// ✅ ดี - ชัดเจน เป็นมิตร
message: 'ยินดีต้อนรับเข้าสู่ทีม! เรารอคอยที่จะทำงานร่วมกับคุณ'

// ❌ ไม่ดี - สั้นเกินไป ไม่เป็นมิตร
message: 'เข้าร่วม'
```

### 3. การจัดการ Token

```typescript
// ✅ ดี - Token ยาวและสุ่ม
const token = generateInvitationToken(); // 32 ตัวอักษร

// ❌ ไม่ดี - Token สั้นหรือคาดเดาได้
const token = Math.random().toString(); // ไม่ปลอดภัย
```

### 4. การตรวจสอบวันหมดอายุ

```typescript
// ✅ ดี - ตรวจสอบก่อนใช้งาน
if (invitation.expiresAt < new Date()) {
    throw new Error('คำเชิญหมดอายุแล้ว');
}

// ✅ ดี - ทำความสะอาดอัตโนมัติ
await checkExpiredInvitations(companyId);
```

---

## 📚 เอกสารเพิ่มเติม

- [Multi-Company Guide](./MULTI_COMPANY_GUIDE.md)
- [User Management Guide](./USER_MANAGEMENT_GUIDE.md)
- [Authentication Guide](./AUTHENTICATION_GUIDE.md)
- [Firebase Setup](./FIREBASE_SETUP.md)

---

## 🤝 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. ดู Firebase Console Logs
3. ตรวจสอบ Firestore Rules
4. ตรวจสอบ Browser Console

---

## 📝 Changelog

### Version 1.0.0 (2025-01-30)
- ✨ เพิ่มระบบเชิญสมาชิกครบถ้วน
- ✨ รองรับผู้ใช้ที่มีและไม่มีบัญชี
- ✨ ส่งอีเมลเชิญอัตโนมัติ
- ✨ UI/UX ที่สวยงามและใช้งานง่าย
- ✨ ระบบจัดการคำเชิญแบบครบวงจร
- ✨ ความปลอดภัยระดับสูง

---

**สร้างโดย:** ระบบจัดการเอกสารอัตโนมัติ  
**อัปเดตล่าสุด:** 30 มกราคม 2025  
**เวอร์ชัน:** 1.0.0

