# Firebase Setup Guide - คู่มือการตั้งค่า Firebase

## 📚 ภาพรวม

โปรเจคนี้ใช้ Firebase สำหรับ:
- **Firestore Database** - เก็บข้อมูลใบส่งมอบงานและใบรับประกันสินค้า
- **Firebase Authentication** - ระบบ authentication (พร้อมใช้งาน)
- **Firebase Storage** - เก็บไฟล์และรูปภาพ (พร้อมใช้งาน)

---

## 🚀 การติดตั้งและตั้งค่า

### 1. ติดตั้ง Firebase SDK

Firebase SDK ถูกติดตั้งแล้วผ่าน npm:

```bash
npm install firebase
```

**เวอร์ชันที่ติดตั้ง:** Firebase v10.x (latest)

---

## 🔧 การตั้งค่า Firebase Configuration

### 1. ไฟล์ Configuration

**ไฟล์:** `firebase.config.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBy4f-C66l03f4-ODOO_aGyseaIDmDb7tk",
  authDomain: "ecertonline-29a67.firebaseapp.com",
  projectId: "ecertonline-29a67",
  storageBucket: "ecertonline-29a67.firebasestorage.app",
  messagingSenderId: "457246107908",
  appId: "1:457246107908:web:1008539ce20637935c8851"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);      // Firestore
export const auth = getAuth(app);         // Authentication
export const storage = getStorage(app);   // Storage

export default app;
```

### 2. ตั้งค่า Environment Variables (แนะนำ)

สร้างไฟล์ `.env.local` และเพิ่ม:

```env
VITE_FIREBASE_API_KEY=AIzaSyBy4f-C66l03f4-ODOO_aGyseaIDmDb7tk
VITE_FIREBASE_AUTH_DOMAIN=ecertonline-29a67.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ecertonline-29a67
VITE_FIREBASE_STORAGE_BUCKET=ecertonline-29a67.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=457246107908
VITE_FIREBASE_APP_ID=1:457246107908:web:1008539ce20637935c8851
```

---

## 📦 Firestore Service Functions

### ไฟล์: `services/firestore.ts`

ไฟล์นี้มีฟังก์ชันสำหรับจัดการข้อมูลใน Firestore:

#### 📋 Delivery Notes Functions

| ฟังก์ชัน | คำอธิบาย | ตัวอย่างการใช้งาน |
|---------|----------|------------------|
| `saveDeliveryNote(data)` | บันทึกใบส่งมอบงานใหม่ | `const id = await saveDeliveryNote(deliveryData)` |
| `getDeliveryNote(id)` | ดึงข้อมูลใบส่งมอบงานตาม ID | `const note = await getDeliveryNote("abc123")` |
| `getDeliveryNotes(limit)` | ดึงรายการใบส่งมอบงานทั้งหมด | `const notes = await getDeliveryNotes(50)` |
| `updateDeliveryNote(id, data)` | อัปเดตใบส่งมอบงาน | `await updateDeliveryNote("abc123", { project: "..." })` |
| `deleteDeliveryNote(id)` | ลบใบส่งมอบงาน | `await deleteDeliveryNote("abc123")` |
| `searchDeliveryNoteByDocNumber(docNumber)` | ค้นหาตามเลขที่เอกสาร | `const notes = await searchDeliveryNoteByDocNumber("DN-2024-001")` |

#### 📄 Warranty Cards Functions

| ฟังก์ชัน | คำอธิบาย | ตัวอย่างการใช้งาน |
|---------|----------|------------------|
| `saveWarrantyCard(data)` | บันทึกใบรับประกันใหม่ | `const id = await saveWarrantyCard(warrantyData)` |
| `getWarrantyCard(id)` | ดึงข้อมูลใบรับประกันตาม ID | `const card = await getWarrantyCard("xyz789")` |
| `getWarrantyCards(limit)` | ดึงรายการใบรับประกันทั้งหมด | `const cards = await getWarrantyCards(50)` |
| `updateWarrantyCard(id, data)` | อัปเดตใบรับประกัน | `await updateWarrantyCard("xyz789", { productName: "..." })` |
| `deleteWarrantyCard(id)` | ลบใบรับประกัน | `await deleteWarrantyCard("xyz789")` |
| `searchWarrantyCardBySerialNumber(serialNumber)` | ค้นหาตามหมายเลขเครื่อง | `const cards = await searchWarrantyCardBySerialNumber("SN-123")` |

---

## 💡 ตัวอย่างการใช้งาน

### 1. บันทึกใบส่งมอบงาน

```typescript
import { saveDeliveryNote } from './services/firestore';

const handleSave = async () => {
    try {
        const id = await saveDeliveryNote(deliveryData);
        console.log('บันทึกสำเร็จ! Document ID:', id);
        alert('บันทึกใบส่งมอบงานสำเร็จ');
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาด');
    }
};
```

### 2. ดึงรายการใบส่งมอบงานทั้งหมด

```typescript
import { getDeliveryNotes } from './services/firestore';
import { useEffect, useState } from 'react';

function DeliveryNoteList() {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await getDeliveryNotes(50);
                setNotes(data);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        
        fetchNotes();
    }, []);

    return (
        <div>
            {notes.map(note => (
                <div key={note.id}>
                    <h3>{note.project}</h3>
                    <p>เลขที่: {note.docNumber}</p>
                </div>
            ))}
        </div>
    );
}
```

### 3. ค้นหาใบรับประกันตามหมายเลขเครื่อง

```typescript
import { searchWarrantyCardBySerialNumber } from './services/firestore';

const handleSearch = async (serialNumber: string) => {
    try {
        const cards = await searchWarrantyCardBySerialNumber(serialNumber);
        if (cards.length > 0) {
            console.log('พบใบรับประกัน:', cards[0]);
        } else {
            console.log('ไม่พบใบรับประกัน');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
```

### 4. อัปเดตข้อมูล

```typescript
import { updateDeliveryNote } from './services/firestore';

const handleUpdate = async (id: string) => {
    try {
        await updateDeliveryNote(id, {
            project: 'โครงการใหม่',
            receiverName: 'คุณสมชาย'
        });
        alert('อัปเดตสำเร็จ');
    } catch (error) {
        console.error('Error:', error);
    }
};
```

---

## 🗄️ โครงสร้างข้อมูลใน Firestore

### Collection: `deliveryNotes`

```typescript
{
  id: string,                    // Auto-generated
  logo: string | null,           // Base64 image
  fromCompany: string,
  fromAddress: string,
  toCompany: string,
  toAddress: string,
  docNumber: string,
  date: Timestamp,
  project: string,
  items: [
    {
      description: string,
      quantity: number,
      unit: string,
      notes: string
    }
  ],
  senderName: string,
  receiverName: string,
  createdAt: Timestamp,          // Auto-generated
  updatedAt: Timestamp           // Auto-generated
}
```

### Collection: `warrantyCards`

```typescript
{
  id: string,                    // Auto-generated
  logo: string | null,           // Base64 image
  companyName: string,
  companyAddress: string,
  customerName: string,
  customerContact: string,
  productName: string,
  serialNumber: string,
  purchaseDate: Timestamp,
  warrantyPeriod: string,
  terms: string,
  createdAt: Timestamp,          // Auto-generated
  updatedAt: Timestamp           // Auto-generated
}
```

---

## 🔒 Security Rules

### Firestore Security Rules (ตัวอย่าง)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users only
    match /deliveryNotes/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /warrantyCards/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**หมายเหตุ:** ตอนนี้ยังไม่มี authentication ดังนั้นอาจต้องเปิด rules ให้เป็น public ก่อน:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // สำหรับ development เท่านั้น
    }
  }
}
```

---

## 🛠️ การตั้งค่าใน Firebase Console

### 1. สร้าง Firestore Database

1. ไปที่ [Firebase Console](https://console.firebase.google.com)
2. เลือกโปรเจค: `ecertonline-29a67`
3. ไปที่ **Firestore Database**
4. คลิก **Create database**
5. เลือก **Start in production mode** หรือ **Start in test mode** (แนะนำ test mode สำหรับ development)
6. เลือก location: `asia-southeast1` (Singapore) หรือ `asia-northeast1` (Tokyo)

### 2. ตั้งค่า Security Rules (สำหรับ Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ คำเตือน:** Rules นี้เปิดให้ทุกคนเข้าถึงได้ ใช้สำหรับ development เท่านั้น!

---

## 📊 ตัวอย่างการใช้งานใน Component

### ปุ่มบันทึกข้อมูล

```typescript
import React, { useState } from 'react';
import { saveDeliveryNote } from './services/firestore';

function SaveButton({ data }) {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const id = await saveDeliveryNote(data);
            alert(`บันทึกสำเร็จ! ID: ${id}`);
        } catch (error) {
            alert('เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    return (
        <button onClick={handleSave} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกลง Firestore'}
        </button>
    );
}
```

---

## 🐛 การแก้ไขปัญหา

### 1. Error: "Missing or insufficient permissions"

**สาเหตุ:** Security rules ไม่อนุญาตให้เข้าถึงข้อมูล

**วิธีแก้:** ตั้งค่า Security Rules ให้ถูกต้อง

### 2. Error: "Firebase app not initialized"

**สาเหตุ:** ยังไม่ได้ import firebase.config.ts

**วิธีแก้:** ตรวจสอบว่า import แล้ว:
```typescript
import { db } from './firebase.config';
```

### 3. Error: "CORS policy"

**สาเหตุ:** Firebase configuration ไม่ถูกต้อง

**วิธีแก้:** ตรวจสอบ authDomain และ projectId

---

## ✅ Checklist การตั้งค่า

- [x] ติดตั้ง Firebase SDK
- [x] สร้างไฟล์ `firebase.config.ts`
- [x] สร้าง Firestore service functions
- [x] เพิ่ม `.env.example`
- [x] อัปเดต `.gitignore`
- [ ] สร้าง Firestore Database ใน Firebase Console
- [ ] ตั้งค่า Security Rules
- [ ] ทดสอบการบันทึกและดึงข้อมูล

---

## 🚀 ขั้นตอนถัดไป

1. **สร้าง Firestore Database** ใน Firebase Console
2. **ตั้งค่า Security Rules** (เริ่มจาก test mode ก่อน)
3. **ทดสอบฟังก์ชัน** ในการบันทึกและดึงข้อมูล
4. **เพิ่มฟีเจอร์** เช่น:
   - หน้ารายการเอกสารที่บันทึกไว้
   - ปุ่มบันทึกลง Firestore
   - ระบบค้นหาเอกสาร
   - Authentication สำหรับ user management

---

**หมายเหตุ:** ไฟล์นี้สร้างขึ้นเพื่อให้ทีมพัฒนาและ LLM เข้าใจการตั้งค่า Firebase ในโปรเจคนี้
