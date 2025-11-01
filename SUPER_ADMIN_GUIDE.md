# 🔐 คู่มือ Super Admin (ผู้ดูแลระดับสูงสุด)

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [คุณสมบัติ Super Admin](#คุณสมบัติ-super-admin)
3. [การติดตั้งและตั้งค่า](#การติดตั้งและตั้งค่า)
4. [การใช้งาน Dashboard](#การใช้งาน-dashboard)
5. [การจัดการและ Monitoring](#การจัดการและ-monitoring)
6. [คำถามที่พบบ่อย](#คำถามที่พบบ่อย)

---

## 🎯 ภาพรวมระบบ

**Super Admin** คือผู้ดูแลระดับสูงสุดที่มีสิทธิ์:
- 📊 ดูภาพรวมทั้ง project (สถิติทั้งหมด)
- 🏢 ดูและจัดการบริษัททั้งหมด
- 👥 ดูและจัดการ users ทุกบริษัท
- 📨 ดูและจัดการคำเชิญทั้งหมด
- 📈 Monitor สถานะระบบ

### ความแตกต่างระหว่าง Admin และ Super Admin

| คุณสมบัติ | Company Admin | Super Admin |
|----------|---------------|-------------|
| จัดการสมาชิกในบริษัทตัวเอง | ✅ | ✅ |
| ดูข้อมูลบริษัทอื่น | ❌ | ✅ |
| ดูข้อมูล users ทุกบริษัท | ❌ | ✅ |
| ดูสถิติระดับระบบ | ❌ | ✅ |
| จัดการ Super Admin อื่น | ❌ | ⚠️ จำกัด |

---

## 🌟 คุณสมบัติ Super Admin

### 1. ภาพรวมระบบ (Overview Dashboard)

แสดงสถิติ Real-time:
- 🏢 จำนวนบริษัททั้งหมด
- 👥 จำนวน users/สมาชิกทั้งหมด
- ✅ สมาชิกที่ใช้งานอยู่ (Active)
- 📨 คำเชิญที่รอการยอมรับ
- 📄 จำนวนเอกสารทั้งหมด
- 👤 สมาชิกทั้งหมดในระบบ

### 2. จัดการบริษัท

- ดูรายการบริษัททั้งหมด
- ดูรายละเอียดแต่ละบริษัท
- ดูจำนวนสมาชิกในแต่ละบริษัท
- Monitor วันที่สร้างบริษัท

### 3. จัดการ Users

- ดูรายการ users ทั้งหมด
- ค้นหาด้วยอีเมลหรือชื่อ
- ดูบทบาท (Admin/Member)
- ดูสถานะ (Active/Pending/Inactive)
- Filter ตามบริษัท

### 4. จัดการคำเชิญ

- ดูรายการคำเชิญทั้งหมด
- ดูสถานะคำเชิญ
- ค้นหาคำเชิญ
- Monitor คำเชิญที่หมดอายุ

---

## ⚙️ การติดตั้งและตั้งค่า

### ขั้นตอนที่ 1: เพิ่ม Super Admin คนแรก

#### วิธีที่ 1: ใช้ Script (แนะนำ)

1. **แก้ไขไฟล์ Script:**
   ```bash
   nano scripts/setup-superadmin.ts
   ```

2. **แก้ไขข้อมูล:**
   ```typescript
   const SUPER_ADMIN_EMAIL = 'your-email@example.com';  // เปลี่ยนเป็นอีเมลของคุณ
   const DISPLAY_NAME = 'Your Name';                     // เปลี่ยนเป็นชื่อของคุณ
   ```

3. **รัน Script:**
   ```bash
   npx ts-node scripts/setup-superadmin.ts
   ```

4. **ยืนยัน:**
   ```
   📧 อีเมล Super Admin: your-email@example.com
   👤 ชื่อแสดง: Your Name

   ต้องการดำเนินการต่อหรือไม่? (yes/no): yes
   ```

#### วิธีที่ 2: ใช้ Firebase Console (Manual)

1. เข้า Firebase Console: https://console.firebase.google.com
2. เลือก Project ของคุณ
3. ไปที่ **Firestore Database**
4. สร้าง Collection ชื่อ `superAdmins`
5. เพิ่ม Document ใหม่:
   ```json
   {
     "userId": "YOUR_FIREBASE_AUTH_UID",
     "email": "your-email@example.com",
     "displayName": "Your Name",
     "role": "superadmin",
     "permissions": ["view_all", "manage_users", "manage_companies", "manage_invitations", "view_stats"],
     "createdAt": "TIMESTAMP",
     "updatedAt": "TIMESTAMP"
   }
   ```

### ขั้นตอนที่ 2: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### ขั้นตอนที่ 3: เพิ่มเมนู Super Admin ใน Header

แก้ไขไฟล์ `components/Header.tsx`:

```typescript
import { isSuperAdmin } from '../services/superAdmin';
import SuperAdminDashboard from './SuperAdminDashboard';

// เพิ่ม state
const [showSuperAdmin, setShowSuperAdmin] = useState(false);
const [isSuper, setIsSuper] = useState(false);

// ตรวจสอบ Super Admin
useEffect(() => {
    const checkSuperAdmin = async () => {
        if (user) {
            const superStatus = await isSuperAdmin(user.uid);
            setIsSuper(superStatus);
        }
    };
    checkSuperAdmin();
}, [user]);

// เพิ่มปุ่มในเมนู Dropdown (หลัง "จัดการสมาชิก")
{isSuper && (
    <button
        onClick={() => {
            setShowSuperAdmin(true);
            setShowDropdown(false);
        }}
        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3 border-b border-gray-200"
    >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="font-medium">🔐 Super Admin</span>
    </button>
)}

// เพิ่ม Modal (หลัง UserManagement Modal)
{showSuperAdmin && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl m-4">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold">🔐 Super Admin Dashboard</h2>
                <button
                    onClick={() => setShowSuperAdmin(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
                <SuperAdminDashboard />
            </div>
        </div>
    </div>
)}
```

---

## 📊 การใช้งาน Dashboard

### 1. เข้าสู่ Dashboard

1. Login ด้วยอีเมลที่เป็น Super Admin
2. คลิกที่ **เมนู User** (มุมขวาบน)
3. คลิก **"🔐 Super Admin"**

### 2. แท็บภาพรวม (Overview)

แสดงการ์ดสถิติ:
- **บริษัททั้งหมด** - จำนวนบริษัทที่มีในระบบ
- **ผู้ใช้ทั้งหมด** - Unique users
- **สมาชิกที่ใช้งาน** - Active members
- **คำเชิญรอการยอมรับ** - Pending invitations
- **เอกสารทั้งหมด** - ใบส่งงาน + ใบรับประกัน
- **สมาชิกทั้งหมด** - Total members

### 3. แท็บบริษัททั้งหมด (Companies)

**ตารางแสดง:**
- ชื่อบริษัท
- ที่อยู่
- จำนวนสมาชิก
- วันที่สร้าง

**การใช้งาน:**
- เรียงตามวันที่สร้าง (ล่าสุดก่อน)
- ดูรายละเอียดแต่ละบริษัท

### 4. แท็บสมาชิกทั้งหมด (Members)

**ตารางแสดง:**
- อีเมล
- ชื่อ
- บทบาท (Admin/Member)
- สถานะ (Active/Pending/Inactive)
- วันที่เข้าร่วม

**การใช้งาน:**
- ค้นหาด้วยอีเมลหรือชื่อ
- Filter members realtime

### 5. แท็บคำเชิญทั้งหมด (Invitations)

**ตารางแสดง:**
- อีเมลผู้ถูกเชิญ
- บริษัท
- บทบาท
- สถานะ (รอยอมรับ/ยอมรับแล้ว/ปฏิเสธ/หมดอายุ)
- วันหมดอายุ

**การใช้งาน:**
- ค้นหาด้วยอีเมลหรือชื่อบริษัท
- ดูสถานะคำเชิญ realtime

---

## 🛠️ การจัดการและ Monitoring

### การ Monitor ระบบ

#### 1. ตรวจสอบ Growth

**Daily:**
- จำนวนบริษัทใหม่
- จำนวน users ใหม่
- จำนวนเอกสารที่สร้าง

**Weekly:**
- Trend การเติบโต
- บริษัทที่มีสมาชิกมากที่สุด
- คำเชิญที่หมดอายุ

#### 2. ตรวจสอบปัญหา

**Pending Invitations:**
```sql
-- ดูคำเชิญที่รอนานเกิน 7 วัน
SELECT * FROM invitations 
WHERE status = 'pending' 
AND createdAt < NOW() - INTERVAL 7 DAY
```

**Inactive Members:**
```sql
-- ดูสมาชิกที่ไม่ active
SELECT * FROM companyMembers 
WHERE status = 'inactive'
```

#### 3. การทำ Clean Up

**ลบคำเชิญที่หมดอายุ:**
- ไปที่แท็บ Invitations
- Filter เฉพาะ "หมดอายุ"
- พิจารณาลบใน Firebase Console

**ปรับสถานะสมาชิก:**
- ตรวจสอบสมาชิกที่ Pending นาน
- พิจารณาเปลี่ยนเป็น Inactive

### Best Practices

1. **การเข้าถึง:**
   - จำกัด Super Admin ให้น้อยที่สุด (1-3 คน)
   - ใช้อีเมลที่เชื่อถือได้
   - Enable 2FA สำหรับ Super Admin

2. **การ Monitor:**
   - ตรวจสอบ Dashboard อย่างน้อยสัปดาห์ละครั้ง
   - สังเกตการเปลี่ยนแปลงที่ผิดปกติ
   - Monitor คำเชิญที่หมดอายุ

3. **Security:**
   - อย่าแชร์รหัสผ่าน Super Admin
   - ใช้รหัสผ่านที่แข็งแกร่ง
   - Log out เมื่อไม่ใช้งาน

---

## 📊 API และ Services

### Services ที่มีให้ใช้

```typescript
import {
    isSuperAdmin,              // ตรวจสอบว่าเป็น Super Admin
    getSuperAdmin,             // ดึงข้อมูล Super Admin
    getSystemStats,            // ดึงสถิติระบบ
    getAllCompanies,           // ดึงบริษัททั้งหมด
    getAllMembers,             // ดึงสมาชิกทั้งหมด
    getAllInvitations,         // ดึงคำเชิญทั้งหมด
    updateSuperAdminLastLogin, // อัปเดต Last Login
} from './services/superAdmin';
```

### ตัวอย่างการใช้งาน

```typescript
// ตรวจสอบว่าเป็น Super Admin
const isSuper = await isSuperAdmin(userId);

// ดึงสถิติระบบ
const stats = await getSystemStats();
console.log('Total Companies:', stats.totalCompanies);

// ดึงบริษัททั้งหมด
const companies = await getAllCompanies();

// ดึงสมาชิกของบริษัทหนึ่ง
const members = await getAllMembers('company-id');

// ดึงสมาชิกทั้งหมด
const allMembers = await getAllMembers();
```

---

## 🔐 Firestore Rules

### Rules สำหรับ Super Admins Collection

```javascript
// Super Admins (ผู้ดูแลระดับสูงสุด)
match /superAdmins/{adminId} {
  // อนุญาตให้อ่านได้เฉพาะ Super Admin
  allow read: if isAuthenticated();
  
  // อนุญาตให้สร้างได้เฉพาะ Super Admin
  allow create: if isAuthenticated();
  
  // อนุญาตให้แก้ไขได้เฉพาะตัวเอง
  allow update: if isAuthenticated() && isOwner(resource.data.userId);
  
  // ไม่อนุญาตให้ลบ
  allow delete: if false;
}
```

### การปรับแต่ง Rules

**สำหรับ Production:** ควรเข้มงวดขึ้น

```javascript
function isSuperAdmin() {
  return exists(/databases/$(database)/documents/superAdmins/$(request.auth.uid));
}

// เปลี่ยน rules ให้เข้มงวดขึ้น
match /superAdmins/{adminId} {
  allow read: if isSuperAdmin();
  allow create: if false;  // ห้ามสร้างผ่าน client
  allow update: if isSuperAdmin() && isOwner(resource.data.userId);
  allow delete: if false;
}
```

---

## ❓ คำถามที่พบบ่อย

### Q1: จะเพิ่ม Super Admin คนใหม่ได้อย่างไร?

**A:** ใช้ Script หรือเพิ่มใน Firebase Console:
```bash
npx ts-node scripts/setup-superadmin.ts
```

### Q2: Super Admin สามารถแก้ไขข้อมูลบริษัทได้ไหม?

**A:** ตอนนี้ยังไม่ได้ แต่สามารถดูข้อมูลทั้งหมดได้ ถ้าต้องการแก้ไข ต้องเพิ่มฟีเจอร์เพิ่มเติม

### Q3: จะลบ Super Admin ได้ไหม?

**A:** ตอนนี้ห้ามลบผ่าน UI เพื่อความปลอดภัย ต้องลบใน Firebase Console เท่านั้น

### Q4: Super Admin ต้อง login ด้วยอีเมลเฉพาะหรือไม่?

**A:** ไม่ Super Admin สามารถ login ด้วยวิธีใดก็ได้ (Email/Phone/Google) ที่สำคัญคือ userId ต้องตรงกับที่ตั้งไว้

### Q5: จะดู logs ของ Super Admin ได้ที่ไหน?

**A:** ดูใน Browser Console (F12) จะมี logs แบบนี้:
```
🔐 [SuperAdmin] Check for USER_ID: true
📊 [SuperAdmin] System Stats: {...}
```

### Q6: Dashboard โหลดช้า ทำไงดี?

**A:** Dashboard ดึงข้อมูลจำนวนมาก ถ้าโหลดช้า:
- เพิ่ม Index ใน Firestore
- ใช้ Pagination
- Cache ข้อมูลที่ไม่เปลี่ยนบ่อย

---

## 🚨 Troubleshooting

### ปัญหา: ไม่เห็นเมนู Super Admin

**สาเหตุ:**
- ยังไม่ได้เพิ่มใน superAdmins collection
- userId ไม่ตรงกัน
- Firestore Rules บล็อก

**วิธีแก้:**
```bash
# 1. ตรวจสอบใน Firestore Console
# 2. รัน script อีกครั้ง
npx ts-node scripts/setup-superadmin.ts

# 3. Deploy rules
firebase deploy --only firestore:rules
```

### ปัญหา: Dashboard แสดงข้อมูลไม่ครบ

**สาเหตุ:**
- Firestore Rules บล็อก
- Missing permissions
- Network error

**วิธีแก้:**
```bash
# 1. Check Browser Console (F12)
# 2. Check Firestore Rules
# 3. Deploy rules ใหม่
firebase deploy --only firestore:rules
```

### ปัญหา: "Missing or insufficient permissions"

**วิธีแก้:**
```bash
# Deploy rules ใหม่
firebase deploy --only firestore:rules

# ตรวจสอบว่าเป็น Super Admin
# ไปที่ Firestore Console → superAdmins collection
```

---

## 📚 เอกสารเพิ่มเติม

- [Multi-Company Guide](./MULTI_COMPANY_GUIDE.md)
- [User Management Guide](./USER_MANAGEMENT_GUIDE.md)
- [Invitation Guide](./INVITATION_GUIDE.md)
- [Firebase Setup](./FIREBASE_SETUP.md)

---

## 🎯 สรุป

**Super Admin** คือเครื่องมือที่ทรงพลังสำหรับ:
- 📊 Monitor ระบบทั้งหมด
- 🏢 จัดการบริษัททั้งหมด
- 👥 ดูและจัดการ users
- 📈 วิเคราะห์และปรับปรุงระบบ

**หมายเหตุสำคัญ:**
- ⚠️ จำกัดจำนวน Super Admin
- 🔒 ใช้รหัสผ่านที่แข็งแกร่ง
- 🛡️ Enable 2FA
- 📝 Monitor อย่างสม่ำเสมอ

---

**สร้างโดย:** ระบบจัดการเอกสารอัตโนมัติ  
**อัปเดตล่าสุด:** 30 มกราคม 2025  
**เวอร์ชัน:** 1.0.0

