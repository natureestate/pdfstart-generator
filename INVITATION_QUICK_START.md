# 🚀 เริ่มต้นใช้งานระบบเชิญสมาชิก (Quick Start)

## 📦 สิ่งที่ได้เพิ่มเข้ามา

### ✅ ไฟล์ใหม่ที่สร้าง

1. **Types & Interfaces**
   - `types.ts` - เพิ่ม `Invitation` และ `InvitationStatus`

2. **Services**
   - `services/invitations.ts` - จัดการคำเชิญทั้งหมด

3. **Components**
   - `components/InviteMemberModal.tsx` - Modal เชิญสมาชิก
   - `components/AcceptInvitationPage.tsx` - หน้ายอมรับคำเชิญ
   - `components/UserManagement.tsx` - อัปเดตให้รองรับคำเชิญ

4. **Firebase Functions**
   - `functions/src/index.ts` - เพิ่ม `sendInvitationEmail`

5. **Documentation**
   - `INVITATION_GUIDE.md` - คู่มือฉบับเต็ม
   - `INVITATION_QUICK_START.md` - คู่มือฉบับย่อ (ไฟล์นี้)

### ✅ ไฟล์ที่แก้ไข

1. `App.tsx` - เพิ่ม routing สำหรับ `/accept-invitation`
2. `index.tsx` - เพิ่ม BrowserRouter
3. `firestore.rules` - เพิ่ม rules สำหรับ invitations
4. `package.json` - เพิ่ม react-router-dom

---

## 🎯 วิธีใช้งานแบบง่าย

### สำหรับ Admin

1. **เชิญสมาชิก:**
   ```
   เมนู → จัดการสมาชิก → 📨 เชิญสมาชิกใหม่
   ```

2. **กรอกข้อมูล:**
   - อีเมล: `user@example.com`
   - บทบาท: Admin หรือ Member
   - ข้อความ: (ไม่บังคับ)
   - ✅ ส่งอีเมลอัตโนมัติ

3. **ดูคำเชิญ:**
   ```
   แท็บ "📨 คำเชิญ" → ดูสถานะ/ส่งใหม่/ยกเลิก
   ```

### สำหรับผู้ถูกเชิญ

1. **เปิดอีเมล** → คลิก "ยอมรับคำเชิญ"
2. **Login หรือสร้างบัญชี** ด้วยอีเมลที่ถูกเชิญ
3. **ยอมรับ** → เข้าสู่องค์กรทันที!

---

## ⚙️ การตั้งค่าเบื้องต้น

### 1. Deploy Firebase Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions:sendInvitationEmail
```

### 2. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. ตั้งค่า Base URL (สำคัญ!)

แก้ไข `functions/src/index.ts` บรรทัด 197-199:

```typescript
const baseUrl = process.env.FUNCTIONS_EMULATOR
    ? 'http://localhost:5173'
    : 'https://YOUR-ACTUAL-DOMAIN.web.app'; // ⚠️ เปลี่ยนตรงนี้!
```

### 4. ตั้งค่าส่งอีเมล (Optional แต่แนะนำ)

#### ติดตั้ง Firebase Email Extension:

```bash
firebase ext:install firebase/firestore-send-email
```

#### กำหนดค่า:
- **SMTP URI**: `smtps://username:password@smtp.gmail.com:465`
- **FROM**: `noreply@your-domain.com`
- **Collection**: `mail`

---

## 🧪 ทดสอบระบบ

### ทดสอบ Local (Development)

```bash
# Terminal 1: Start Emulators
firebase emulators:start

# Terminal 2: Start Dev Server
npm run dev
```

### ทดสอบการเชิญ

1. Login เป็น Admin
2. เชิญอีเมลของคุณเอง
3. เปิด Firestore Emulator UI: `http://localhost:4000`
4. ดูคำเชิญใน collection `invitations`
5. คัดลอก `token` จากคำเชิญ
6. เปิด: `http://localhost:5173/accept-invitation?token=YOUR_TOKEN`

---

## 📋 Checklist ก่อน Production

- [ ] แก้ Base URL ใน Functions
- [ ] Deploy Functions
- [ ] Deploy Firestore Rules
- [ ] ติดตั้ง Email Extension
- [ ] ทดสอบส่งอีเมลจริง
- [ ] ทดสอบยอมรับคำเชิญ
- [ ] ตรวจสอบ Firestore Rules ทำงานถูกต้อง

---

## 🐛 แก้ปัญหาเร็ว

### ส่งอีเมลไม่ได้?
```bash
# ตรวจสอบ Extension
firebase ext:list

# ดู Logs
firebase functions:log
```

### Route ไม่ทำงาน?
```bash
# ตรวจสอบว่าติดตั้งแล้ว
npm list react-router-dom

# ถ้ายังไม่มี
npm install react-router-dom
```

### คำเชิญหมดอายุทันที?
- ตรวจสอบเวลาเซิร์ฟเวอร์
- ใช้ `Timestamp.fromDate()` แทน `new Date()`

---

## 📚 เอกสารเพิ่มเติม

- **คู่มือฉบับเต็ม:** [INVITATION_GUIDE.md](./INVITATION_GUIDE.md)
- **Multi-Company:** [MULTI_COMPANY_GUIDE.md](./MULTI_COMPANY_GUIDE.md)
- **User Management:** [USER_MANAGEMENT_GUIDE.md](./USER_MANAGEMENT_GUIDE.md)

---

## 🎉 พร้อมใช้งาน!

ระบบเชิญสมาชิกพร้อมใช้งานแล้ว! 

**คุณสมบัติหลัก:**
- ✅ เชิญผู้ใช้ทั้งที่มีและไม่มีบัญชี
- ✅ ส่งอีเมลอัตโนมัติ
- ✅ จัดการคำเชิญแบบครบวงจร
- ✅ UI/UX สวยงาม
- ✅ ปลอดภัยด้วย Token และวันหมดอายุ

**Happy Inviting! 🚀**

