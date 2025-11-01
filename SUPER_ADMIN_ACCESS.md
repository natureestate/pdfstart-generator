# 🔐 คู่มือการเข้าใช้งาน Super Admin

## ✅ เสร็จสิ้นแล้ว!

Super Admin ของคุณถูกสร้างเรียบร้อยแล้วครับ

---

## 📧 ข้อมูลการเข้าใช้งาน

```
อีเมล: sinanan.ac.th@gmail.com
รหัสผ่าน: Sinananr99
User ID: xqPGPylngfM2soJnxUP8raRcRhb2
```

---

## 🔗 URL สำหรับเข้าใช้งาน

### Development (Local)
```
http://localhost:5173/superadmin
```

### Production
```
https://ecertonline-29a67.web.app/superadmin
```

---

## 📝 วิธีการเข้าใช้งาน

### 1. เปิด Browser
เปิด Browser ที่ต้องการใช้งาน (แนะนำ Chrome, Firefox, หรือ Safari)

### 2. Login เข้าระบบ
- ไปที่: `http://localhost:5173` (หรือ URL production)
- กรอกอีเมล: `sinanan.ac.th@gmail.com`
- กรอกรหัสผ่าน: `Sinananr99`
- คลิก "เข้าสู่ระบบ"

### 3. เข้า Super Admin Dashboard
**หลังจาก Login แล้ว** ให้พิมพ์ URL ใน address bar:

```
http://localhost:5173/superadmin
```

หรือใน Production:

```
https://ecertonline-29a67.web.app/superadmin
```

---

## 🎯 คุณสมบัติของ Super Admin Dashboard

### 📊 Overview (ภาพรวม)
- จำนวนบริษัททั้งหมด
- จำนวน Users ทั้งหมด
- จำนวนสมาชิกทั้งหมด
- จำนวนคำเชิญทั้งหมด
- จำนวนเอกสารทั้งหมด
- จำนวน Active Users
- จำนวนคำเชิญที่รอดำเนินการ

### 🏢 Companies (บริษัท)
- ดูรายการบริษัททั้งหมด
- ค้นหาบริษัท
- ดูจำนวนสมาชิกในแต่ละบริษัท
- ดูสถานะ (Active/Inactive)

### 👥 Members (สมาชิก)
- ดูรายการสมาชิกทั้งหมดในทุกบริษัท
- ค้นหาสมาชิก
- กรองตามบทบาท (Admin/Member)
- กรองตามสถานะ (Active/Pending/Inactive)
- ดูชื่อบริษัทที่สมาชิกสังกัด

### 📨 Invitations (คำเชิญ)
- ดูรายการคำเชิญทั้งหมด
- ค้นหาคำเชิญ
- กรองตามสถานะ (Pending/Accepted/Rejected/Cancelled/Expired)
- ดูชื่อบริษัทที่ส่งคำเชิญ

---

## ⚠️ ข้อควรระวัง

### 1. URL นี้ไม่มีปุ่มนำทาง
- Super Admin Dashboard ไม่มีปุ่มหรือลิงก์ในเมนูปกติ
- คุณต้องพิมพ์ URL `/superadmin` เองในทุกครั้งที่ต้องการเข้าใช้งาน
- แนะนำให้ Bookmark URL ไว้เพื่อความสะดวก

### 2. ต้อง Login ก่อน
- ต้อง Login เข้าระบบด้วยบัญชี Super Admin ก่อน
- ถ้ายังไม่ได้ Login จะถูก redirect ไปหน้า Login

### 3. สิทธิ์พิเศษ
- Super Admin มีสิทธิ์ดูข้อมูลทั้งหมดในระบบ
- กรุณาใช้งานอย่างระมัดระวัง

---

## 🔄 การเปลี่ยนรหัสผ่าน

หากต้องการเปลี่ยนรหัสผ่าน:

1. Login เข้าระบบ
2. ไปที่เมนู Profile หรือ Settings
3. เลือก "เปลี่ยนรหัสผ่าน"

หรือสามารถใช้ Firebase Console:
1. ไปที่ https://console.firebase.google.com
2. เลือก Project
3. ไปที่ Authentication > Users
4. หา `sinanan.ac.th@gmail.com`
5. คลิก "..." > "Reset password"

---

## 🆘 แก้ไขปัญหา

### ไม่สามารถเข้า Super Admin Dashboard ได้
1. ตรวจสอบว่า Login แล้วหรือยัง
2. ตรวจสอบว่าอยู่ใน URL ที่ถูกต้อง (`/superadmin`)
3. ลองเปิด Console ใน Browser (F12) ดู error
4. ลองล้าง cache และ cookies

### แสดง "Permission Denied"
1. ตรวจสอบว่าบัญชีถูกสร้างเป็น Super Admin แล้ว
2. ตรวจสอบ Firestore rules
3. ลองรัน script สร้าง Super Admin อีกครั้ง

### หน้าแสดงผลไม่ถูกต้อง
1. ลอง Refresh หน้าเว็บ (Ctrl+F5 หรือ Cmd+Shift+R)
2. ตรวจสอบ Console ว่ามี error หรือไม่
3. ตรวจสอบว่า `components/SuperAdminDashboard.tsx` ถูก compile แล้ว

---

## 📞 ติดต่อสอบถาม

หากมีปัญหาหรือข้อสงสัย:
- ตรวจสอบ Console log (F12)
- อ่านคู่มือเพิ่มเติมใน `SUPER_ADMIN_GUIDE.md`
- ติดต่อทีมพัฒนา

---

## 🚀 เพิ่มเติม

### หากต้องการสร้าง Super Admin เพิ่ม

รัน script:
```bash
node scripts/create-sinanan-superadmin.cjs
```

หรือแก้ไขอีเมลและรหัสผ่านใน script แล้วรันใหม่

### หากต้องการเพิ่มปุ่มนำทาง

ดูวิธีการใน `SUPER_ADMIN_GUIDE.md` หัวข้อ "การเพิ่มเมนู Super Admin ใน Header"

---

สร้างเมื่อ: 30 ตุลาคม 2025
อัปเดตล่าสุด: 30 ตุลาคม 2025

