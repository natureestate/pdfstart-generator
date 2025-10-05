<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# เครื่องมือสร้างเอกสารใบส่งมอบงานและใบรับประกันสินค้า

แอปพลิเคชันสำหรับสร้างเอกสารใบส่งมอบงานและใบรับประกันสินค้าเป็นรูปแบบ PDF โดยใช้ React + TypeScript และไลบรารี jsPDF สำหรับการสร้าง PDF

View your app in AI Studio: https://ai.studio/apps/drive/1yhFfep4VwpvqkcV-CVUMEUjWccFIYz1X

## คุณสมบัติหลัก

- **ใบส่งมอบงาน**: สร้างเอกสารใบส่งมอบงานพร้อมรายการสิ่งของและรายละเอียดโครงการ
- **ใบรับประกันสินค้า**: สร้างใบรับประกันสินค้าพร้อมเงื่อนไขการรับประกัน
- **ตัวอย่างแบบเรียลไทม์**: ดูตัวอย่างเอกสารก่อนสร้าง PDF
- **ดาวน์โหลด PDF**: สร้างและดาวน์โหลดเอกสารเป็นไฟล์ PDF ทันที
- **รองรับภาษาไทย**: ออกแบบมาสำหรับใช้งานภาษาไทยโดยเฉพาะ
- **🆕 จัดการโลโก้แบบ Hybrid**: รองรับทั้ง Default Logo และการอัปโหลดโลโก้ไปยัง Firebase Storage
- **🖼️ คลังโลโก้**: เลือกใช้โลโก้จากคลังที่เคยอัปโหลด พร้อมลบโลโก้ที่ไม่ต้องการได้
- **☁️ บันทึกข้อมูลลง Cloud**: บันทึกเอกสารและโลโก้ลง Firebase Firestore และ Storage
- **🔐 ระบบ Authentication**: Login ด้วย Google OAuth พร้อม Security Rules ที่ปลอดภัย
- **👤 แยกข้อมูลตาม User**: แต่ละคนเห็นเฉพาะข้อมูลของตัวเอง
- **🛡️ reCAPTCHA v3**: ป้องกัน bot และ automated attacks ด้วย Google reCAPTCHA v3
- **✅ Firebase App Check**: ป้องกัน unauthorized clients ด้วย App Check enforcement

## โครงสร้างโปรเจค

```
/
├── components/          # คอมโพเนนต์ React
│   ├── DeliveryForm.tsx         # ฟอร์มใบส่งมอบงาน
│   ├── DocumentPreview.tsx      # ตัวอย่างใบส่งมอบงาน
│   ├── WarrantyForm.tsx         # ฟอร์มใบรับประกัน
│   ├── WarrantyPreview.tsx      # ตัวอย่างใบรับประกัน
│   ├── Header.tsx               # ส่วนหัว + User Menu
│   ├── LoginPage.tsx            # 🆕 หน้า Login
│   ├── ProtectedRoute.tsx       # 🆕 Protected Route
│   ├── LogoManager.tsx          # จัดการโลโก้
│   ├── CompanyProfileSelector.tsx  # เลือกข้อมูลบริษัท
│   └── HistoryList.tsx          # ประวัติเอกสาร
├── contexts/            # 🆕 React Contexts
│   └── AuthContext.tsx          # Auth Context Provider
├── services/
│   ├── pdfGenerator.ts          # บริการสร้าง PDF
│   ├── firestore.ts             # Firestore CRUD
│   ├── logoStorage.ts           # Firebase Storage สำหรับโลโก้
│   ├── auth.ts                  # 🆕 Authentication Service
│   └── companyProfiles.ts       # จัดการข้อมูลบริษัท
├── utils/
│   └── dateUtils.ts             # ยูทิลิตี้สำหรับจัดการวันที่
├── constants/
│   └── IBMPlexSansThaiBase64.ts  # ฟอนต์ภาษาไทยสำหรับ PDF
├── types.ts                     # กำหนดประเภทข้อมูล TypeScript
├── App.tsx                      # คอมโพเนนต์หลักของแอป
├── firebase.config.ts           # Firebase Configuration
├── firestore.rules              # 🆕 Firestore Security Rules
├── storage.rules                # 🆕 Storage Security Rules
└── firestore.indexes.json       # 🆕 Firestore Indexes
```

## การติดตั้งและใช้งาน

### ข้อกำหนดเบื้องต้น
- Node.js (เวอร์ชัน 18 ขึ้นไป)
- npm หรือ yarn

### การติดตั้ง

1. **ติดตั้ง dependencies:**
   ```bash
   npm install
   ```

2. **ตั้งค่า environment variables (ถ้าต้องการใช้ Gemini API):**
   สร้างไฟล์ `.env.local` และเพิ่ม:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **รันแอปพลิเคชัน:**
   ```bash
   npm run dev
   ```

## คำสั่งที่ใช้งานได้

### การพัฒนา (Development)

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | รัน dev server บน port 3000 |
| `npm run dev:host` | รัน dev server พร้อมเปิดให้เข้าถึงจากเครือข่ายภายนอก |
| `npm run restart` | หยุด process ที่ใช้ port 3000 แล้วรัน dev server ใหม่ |
| `npm run restart:host` | หยุด process แล้วรัน dev server ในโหมด network |

### การจัดการ Port

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run kill-port` | หยุด process ที่ใช้ port 3000 อย่างสุภาพ |
| `npm run kill-port:force` | บังคับหยุด process ที่ใช้ port 3000 |

### การ Build และ Deploy

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run build` | สร้างไฟล์สำหรับ production |
| `npm run build:analyze` | สร้างไฟล์พร้อมวิเคราะห์ bundle size |
| `npm run preview` | ทดสอบไฟล์ที่ build แล้วบน port 4173 |
| `npm run preview:host` | ทดสอบไฟล์ที่ build แล้วในโหมด network |

### การดูแลรักษา

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run clean` | ลบไฟล์ dist และ cache |
| `npm run setup` | ติดตั้ง dependencies และ clean โปรเจค |

### สคริปต์สำหรับจัดการ Development Server

นอกจากคำสั่ง npm แล้ว โปรเจคนี้ยังมีสคริปต์สำหรับจัดการ development server ที่สะดวกมากขึ้น:

#### การรันด้วยสคริปต์ (วิธีที่สะดวกกว่า)

```bash
# รัน development server (หยุด process อัตโนมัติถ้าจำเป็น)
./scripts/dev.sh

# รีสตาร์ท development server
./scripts/restart.sh
```

ดูรายละเอียดเพิ่มเติมได้ที่ [scripts/README.md](scripts/README.md)

## การใช้งานแอปพลิเคชัน

1. **เลือกประเภทเอกสาร**: คลิกที่แท็บ "ใบส่งมอบงาน" หรือ "ใบรับประกันสินค้า"
2. **กรอกข้อมูล**: กรอกข้อมูลในฟอร์มที่ให้ไว้
3. **ดูตัวอย่าง**: ตรวจสอบตัวอย่างเอกสารในส่วนด้านขวา
4. **ดาวน์โหลด PDF**: คลิกปุ่ม "ดาวน์โหลด PDF" เพื่อสร้างและดาวน์โหลดเอกสาร

## เทคโนโลยีที่ใช้

- **React 19** - ไลบรารีสำหรับสร้าง user interface
- **TypeScript** - เพิ่ม type safety ให้กับ JavaScript
- **Vite** - Build tool ที่รวดเร็ว
- **jsPDF** - ไลบรารีสำหรับสร้าง PDF
- **html2canvas** - แปลง HTML เป็นรูปภาพสำหรับ PDF
- **PrimeReact** - ชุดคอมโพเนนต์ UI สำหรับ React
- **Tailwind CSS** - กรอบงาน CSS สำหรับการออกแบบ
- **Firebase** - Backend Services (Firestore, Storage, Authentication)

## การแก้ไขปัญหา

### ปัญหา Port ถูกใช้งาน

ถ้าพอร์ต 3000 ถูกใช้งานอยู่ สามารถใช้คำสั่ง:
```bash
npm run restart  # แนะนำ - ปลอดภัยและสุภาพ
# หรือ
npm run kill-port  # ถ้าต้องการหยุดอย่างเดียว
```

### การแก้ไขข้อผิดพลาด

1. **ตรวจสอบ dependencies**: รัน `npm install` เพื่อติดตั้ง packages ที่หายไป
2. **ล้าง cache**: รัน `npm run clean` แล้วรัน `npm run dev` ใหม่
3. **ตรวจสอบ Node.js version**: ต้องใช้ Node.js 18 ขึ้นไป

## การพัฒนาเพิ่มเติม

โปรเจคนี้สามารถพัฒนาต่อได้โดย:
- เพิ่มประเภทเอกสารใหม่ๆ
- ปรับปรุงการออกแบบ UI/UX
- ✅ ~~เพิ่มการเชื่อมต่อกับฐานข้อมูล~~ (เสร็จแล้ว - Firebase Firestore)
- ✅ ~~เพิ่มระบบ authentication~~ (เสร็จแล้ว - Google OAuth)
- เพิ่มการส่งออกเอกสารในรูปแบบอื่นๆ (เช่น Word, Excel)
- เพิ่ม Email/Password Authentication
- เพิ่มระบบแชร์เอกสารระหว่าง Users

## 📖 เอกสารเพิ่มเติม

- **[pdftutorial.md](pdftutorial.md)** - คู่มือการสร้างและจัดการ PDF สำหรับ LLM
  - การใช้งาน jsPDF และ html2canvas
  - การตั้งค่าฟอนต์ภาษาไทย
  - Best practices และการแก้ไขปัญหา
  - ตัวอย่างโค้ดแบบเต็มรูปแบบ

- **[LOGO_MANAGEMENT_GUIDE.md](LOGO_MANAGEMENT_GUIDE.md)** - คู่มือการจัดการโลโก้แบบ Hybrid
  - ระบบจัดการโลโก้ที่รวม Default Logo และ Firebase Storage
  - วิธีการอัปโหลดและจัดการโลโก้
  - การใช้งาน LogoManager Component
  - Tips และ Best Practices

- **[LOGO_GALLERY_GUIDE.md](LOGO_GALLERY_GUIDE.md)** - คู่มือคลังโลโก้ 🆕
  - เลือกใช้โลโก้จากคลังที่เคยอัปโหลด
  - ลบโลโก้ที่ไม่ต้องการออกจากระบบ
  - จัดการโลโก้ทั้งหมดในที่เดียว
  - ตัวอย่างการใช้งานและการแก้ปัญหา

- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - คู่มือระบบ Firebase Authentication
  - ระบบ Login ด้วย Google OAuth
  - Security Rules สำหรับ Firestore และ Storage
  - การแยกข้อมูลตาม User
  - การแก้ไขปัญหาและ Troubleshooting

- **[RECAPTCHA_GUIDE.md](RECAPTCHA_GUIDE.md)** - คู่มือ Google reCAPTCHA v3
  - ระบบป้องกัน bot และ automated attacks
  - Score-based verification
  - Firebase Cloud Function integration
  - Monitoring และ Troubleshooting

- **[APP_CHECK_SETUP.md](APP_CHECK_SETUP.md)** - คู่มือ Firebase App Check 🆕
  - App Check enforcement สำหรับ Cloud Functions
  - ป้องกัน unauthorized clients
  - วิธีตั้งค่าใน Firebase Console
  - Troubleshooting
