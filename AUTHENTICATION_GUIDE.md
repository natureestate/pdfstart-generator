# 🔐 คู่มือระบบ Firebase Authentication

## ภาพรวม

ระบบนี้ใช้ **Firebase Authentication** ด้วย **Google OAuth** เพื่อจัดการการ Login และความปลอดภัยของข้อมูล

### ✨ คุณสมบัติ

- ✅ Login ด้วย Google Account (OAuth)
- ✅ ป้องกันการเข้าถึงแอปโดยไม่ได้ Login
- ✅ แสดงข้อมูลผู้ใช้ (ชื่อ, อีเมล, รูปโปรไฟล์)
- ✅ ปุ่ม Logout พร้อม Dropdown Menu
- ✅ แยกข้อมูลตาม User (แต่ละคนเห็นเฉพาะข้อมูลของตัวเอง)
- ✅ Security Rules ที่ปลอดภัย

---

## 📋 สิ่งที่ต้องตั้งค่าใน Firebase Console

### 1. เปิดใช้งาน Google Sign-in

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจค `ecertonline-29a67`
3. ไปที่ **Authentication** > **Sign-in method**
4. เปิดใช้งาน **Google**
5. ตั้งค่า **Support email** (อีเมลของคุณ)
6. คลิก **Save**

### 2. เพิ่ม Authorized Domains

1. ใน **Authentication** > **Settings** > **Authorized domains**
2. เพิ่ม domain ที่คุณใช้งาน เช่น:
   - `localhost` (สำหรับ development)
   - `your-domain.com` (สำหรับ production)

### 3. ตั้งค่า OAuth Consent Screen (ถ้ายังไม่ได้ทำ)

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เลือกโปรเจคเดียวกับ Firebase
3. ไปที่ **APIs & Services** > **OAuth consent screen**
4. เลือก **External** (หรือ Internal ถ้าเป็น Google Workspace)
5. กรอกข้อมูล:
   - **App name**: เครื่องมือสร้างเอกสาร
   - **User support email**: อีเมลของคุณ
   - **Developer contact information**: อีเมลของคุณ
6. คลิก **Save and Continue**

---

## 🏗️ โครงสร้างโค้ด

### ไฟล์ที่สร้างใหม่

```
services/
  └── auth.ts                    # Authentication Service (Login, Logout, State)

contexts/
  └── AuthContext.tsx            # Auth Context Provider

components/
  ├── LoginPage.tsx              # หน้า Login ด้วย Google
  ├── ProtectedRoute.tsx         # Component ป้องกันการเข้าถึง
  └── Header.tsx                 # (แก้ไข) เพิ่ม User Info และ Logout

firestore.rules                  # (แก้ไข) Security Rules
storage.rules                    # (สร้างใหม่) Storage Security Rules
firestore.indexes.json           # (แก้ไข) Composite Indexes
```

---

## 🔧 วิธีการทำงาน

### 1. Authentication Flow

```
User เปิดแอป
    ↓
AuthProvider ตรวจสอบ Auth State
    ↓
    ├─→ ยังไม่ Login → แสดง LoginPage
    │                      ↓
    │                  คลิก "Sign in with Google"
    │                      ↓
    │                  Popup Google Login
    │                      ↓
    │                  Login สำเร็จ
    │                      ↓
    └─→ Login แล้ว → แสดงแอปปกติ
                         ↓
                    ใช้งานได้ทุกฟีเจอร์
```

### 2. Data Security

- **ทุกเอกสาร** มีฟิลด์ `userId` เก็บ UID ของผู้สร้าง
- **Firestore Rules** ตรวจสอบว่า:
  - ต้อง Login ก่อนถึงจะอ่าน/เขียนข้อมูลได้
  - แต่ละคนเห็นเฉพาะข้อมูลของตัวเอง (`userId == auth.uid`)
- **Storage Rules** ตรวจสอบว่า:
  - ต้อง Login ก่อนถึงจะอัปโหลดโลโก้ได้
  - ไฟล์ต้องเป็นรูปภาพและไม่เกิน 2MB

### 3. User Data Isolation

```typescript
// ตัวอย่าง: บันทึกเอกสาร
const dataToSave = {
    ...data,
    userId: auth.currentUser.uid,  // เพิ่ม userId
    createdAt: Timestamp.now(),
};

// ตัวอย่าง: ดึงเอกสาร (เฉพาะของ user นี้)
const q = query(
    collection(db, "deliveryNotes"),
    where("userId", "==", currentUser.uid),  // กรองตาม userId
    orderBy("createdAt", "desc")
);
```

---

## 🎨 UI Components

### LoginPage

หน้า Login สวยงามพร้อม:
- โลโก้แอป
- ปุ่ม "Sign in with Google" พร้อมไอคอน Google
- Loading state ระหว่าง Login
- Error message แบบภาษาไทย
- Gradient background

### Header (User Menu)

แสดงข้อมูลผู้ใช้:
- รูปโปรไฟล์ (จาก Google)
- ชื่อผู้ใช้
- อีเมล
- Dropdown menu พร้อมปุ่ม Logout
- Responsive (ซ่อนชื่อบนมือถือ)

### ProtectedRoute

Component ที่ wrap เนื้อหาแอป:
- แสดง Loading Screen ระหว่างตรวจสอบ auth
- Redirect ไป LoginPage ถ้ายังไม่ Login
- แสดงเนื้อหาปกติถ้า Login แล้ว

---

## 🔐 Security Rules

### Firestore Rules

```javascript
// ตัวอย่าง Rules สำหรับ deliveryNotes
match /deliveryNotes/{documentId} {
    // ต้อง Login และเป็นเจ้าของเอกสาร
    allow read: if isAuthenticated() && isOwner(resource.data.userId);
    
    // สร้างใหม่ได้ถ้า Login และ userId ตรงกัน
    allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    
    // แก้ไข/ลบได้เฉพาะเจ้าของ
    allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
}
```

### Storage Rules

```javascript
// ตัวอย่าง Rules สำหรับโลโก้
match /logos/{userId}/{fileName} {
    // อ่านได้ทุกคน (เพื่อแสดงใน PDF)
    allow read: if true;
    
    // อัปโหลดได้เฉพาะเจ้าของ และต้องเป็นรูปภาพ ไม่เกิน 2MB
    allow create: if isAuthenticated() 
                  && request.auth.uid == userId 
                  && isImage() 
                  && isValidSize();
}
```

---

## 🧪 การทดสอบ

### ทดสอบ Login

1. เปิดแอป → ควรเห็นหน้า Login
2. คลิก "Sign in with Google"
3. เลือก Google Account
4. Login สำเร็จ → เห็นหน้าแอปปกติ
5. ตรวจสอบว่ามีชื่อและรูปโปรไฟล์มุมขวาบน

### ทดสอบ Logout

1. คลิกที่รูปโปรไฟล์มุมขวาบน
2. เห็น Dropdown Menu
3. คลิก "Logout"
4. กลับไปหน้า Login

### ทดสอบ Data Isolation

1. Login ด้วย Account A
2. สร้างเอกสาร
3. Logout
4. Login ด้วย Account B
5. ไม่ควรเห็นเอกสารของ Account A

### ทดสอบ Security

1. ลองเปิด Browser Console
2. ลองเรียก `firebase.auth().signOut()`
3. ควรถูก redirect ไปหน้า Login ทันที

---

## 🐛 การแก้ไขปัญหา

### ปัญหา: Popup ถูกบล็อก

**วิธีแก้:**
- อนุญาต popup ในเบราว์เซอร์
- หรือใช้ `signInWithRedirect` แทน `signInWithPopup`

### ปัญหา: "Unauthorized domain"

**วิธีแก้:**
- เพิ่ม domain ใน Firebase Console > Authentication > Authorized domains

### ปัญหา: "Missing or insufficient permissions"

**วิธีแก้:**
- ตรวจสอบว่า deploy rules แล้วหรือยัง: `firebase deploy --only firestore:rules`
- ตรวจสอบว่า indexes สร้างแล้วหรือยัง: `firebase deploy --only firestore:indexes`

### ปัญหา: ข้อมูลไม่แสดง

**วิธีแก้:**
- เปิด Browser Console ดู error
- ตรวจสอบว่า `userId` ถูกบันทึกใน Firestore หรือไม่
- ตรวจสอบว่า indexes สร้างเสร็จแล้วหรือยัง (อาจใช้เวลา 5-10 นาที)

---

## 📚 API Reference

### Auth Service (`services/auth.ts`)

```typescript
// Login ด้วย Google
await signInWithGoogle();

// Logout
await signOut();

// ติดตามสถานะ Login
onAuthStateChanged((user) => {
    if (user) {
        console.log('Login แล้ว:', user.displayName);
    }
});

// ดึงข้อมูลผู้ใช้ปัจจุบัน
const user = getCurrentUser();

// ตรวจสอบว่า Login แล้วหรือยัง
const isLoggedIn = isAuthenticated();
```

### Auth Context (`contexts/AuthContext.tsx`)

```typescript
// ใช้ใน Component
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
    const { user, loading, isAuthenticated } = useAuth();
    
    if (loading) return <div>กำลังโหลด...</div>;
    if (!isAuthenticated) return <div>กรุณา Login</div>;
    
    return <div>สวัสดี {user.displayName}</div>;
}
```

---

## 🚀 Next Steps

### ฟีเจอร์ที่อาจเพิ่มในอนาคต

- [ ] Email/Password Authentication
- [ ] Password Reset
- [ ] Email Verification
- [ ] Multi-factor Authentication (MFA)
- [ ] Social Login อื่นๆ (Facebook, Apple)
- [ ] User Profile Management
- [ ] Account Deletion

---

## 📝 หมายเหตุ

- ระบบนี้ใช้ **Google OAuth** เท่านั้น (ไม่ต้องจำ password)
- **ทุกหน้าต้อง Login** ก่อนใช้งาน
- ข้อมูลแต่ละคน**แยกกันโดยสมบูรณ์** (ไม่เห็นข้อมูลคนอื่น)
- Security Rules ถูก deploy แล้ว (**ปลอดภัย**)
- Indexes ถูกสร้างแล้ว (**Query เร็ว**)

---

## 🔗 Links

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Security Rules Docs](https://firebase.google.com/docs/rules)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)

---

**สร้างเมื่อ:** 4 ตุลาคม 2025  
**เวอร์ชัน:** 1.0.0  
**ผู้พัฒนา:** AI Assistant 🤖
