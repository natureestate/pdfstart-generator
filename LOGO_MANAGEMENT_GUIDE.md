# 📸 คู่มือการจัดการโลโก้แบบ Hybrid

คู่มือนี้อธิบายวิธีการจัดการโลโก้ในระบบ PDF Document Generator โดยใช้วิธี **Hybrid Logo Management** ที่รวมจุดเด่นของทั้ง Default Logo และ Firebase Storage

---

## 🎯 ภาพรวมระบบ

ระบบโลโก้แบบ Hybrid มี 3 ระดับ:

1. **Default Logo** - โลโก้ที่มาพร้อมกับโปรเจค (ไม่ต้องอัปโหลด)
2. **Custom Logo (ชั่วคราว)** - โลโก้ที่อัปโหลดใหม่ กำลังรอบันทึกลง Cloud
3. **Uploaded Logo** - โลโก้ที่บันทึกไว้ใน Firebase Storage แล้ว

### ข้อดีของระบบ Hybrid

✅ **โหลดเร็ว** - มี default logo พร้อมใช้งาน  
✅ **ยืดหยุ่น** - อัปโหลดโลโก้ใหม่ได้ทันที  
✅ **ประหยัด** - ไม่เก็บ Base64 ขนาดใหญ่ใน Firestore  
✅ **มั่นคง** - โลโก้ถูกเก็บใน Cloud Storage ที่มี CDN  
✅ **Fallback** - มีโลโก้สำรองเมื่อไม่มีอินเทอร์เน็ต

---

## 📁 โครงสร้างไฟล์

```
/
├── public/
│   └── assets/
│       └── default-logo.svg          # โลโก้ Default
├── services/
│   ├── logoStorage.ts                # บริการจัดการ Firebase Storage
│   └── firestore.ts                  # บริการ Firestore (อัปเดตแล้ว)
├── components/
│   ├── LogoManager.tsx               # Component จัดการโลโก้
│   ├── DeliveryForm.tsx              # ใช้ LogoManager
│   ├── WarrantyForm.tsx              # ใช้ LogoManager
│   ├── DocumentPreview.tsx           # แสดงโลโก้แบบ Hybrid
│   └── WarrantyPreview.tsx           # แสดงโลโก้แบบ Hybrid
└── types.ts                          # เพิ่ม LogoType และ logoUrl
```

---

## 🔧 การใช้งาน

### 1. การอัปโหลดโลโก้ครั้งแรก

```typescript
// ผู้ใช้คลิกอัปโหลดโลโก้
1. เลือกไฟล์ (PNG, JPG, SVG สูงสุด 2MB)
2. ระบบแสดงโลโก้ทันที (Base64)
3. อัปโหลดไปยัง Firebase Storage ในพื้นหลัง
4. อัปเดต logoUrl เมื่ออัปโหลดสำเร็จ
```

### 2. การบันทึกเอกสาร

เมื่อกดปุ่ม "บันทึก":
- ถ้ามี `logoUrl` → บันทึกเฉพาะ URL (ไม่บันทึก Base64)
- ถ้าไม่มี `logoUrl` → บันทึก Base64 ไปก่อน

```typescript
// services/firestore.ts
const dataToSave = {
    ...data,
    // ถ้ามี logoUrl ให้ลบ Base64 ออก (ประหยัดพื้นที่)
    logo: data.logoUrl ? null : data.logo,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
};
```

### 3. การโหลดเอกสารจาก History

เมื่อโหลดเอกสารเก่า:
```typescript
// ระบบจะดึงโลโก้จาก logoUrl หรือ logo หรือ default
const displayLogo = data.logoUrl || data.logo || getDefaultLogoUrl();
```

---

## 🎨 LogoManager Component

### Props

| Props | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `currentLogo` | `string \| null` | ✅ | - | URL ปัจจุบันของโลโก้ (Base64 หรือ URL) |
| `logoUrl` | `string \| null` | ❌ | `null` | URL จาก Firebase Storage |
| `logoType` | `LogoType` | ❌ | `'default'` | ประเภทของโลโก้ (`'default'`, `'custom'`, `'uploaded'`) |
| `onChange` | `(logo, logoUrl, logoType) => void` | ✅ | - | Callback เมื่อโลโก้เปลี่ยนแปลง |
| `showLabel` | `boolean` | ❌ | `true` | แสดง label หรือไม่ |
| `label` | `string` | ❌ | `'โลโก้บริษัท'` | ข้อความ label |

### ตัวอย่างการใช้งาน

```typescript
import LogoManager from './LogoManager';

const MyForm = ({ data, setData }) => {
    const handleLogoChange = (logo, logoUrl, logoType) => {
        setData(prev => ({
            ...prev,
            logo,
            logoUrl,
            logoType,
        }));
    };

    return (
        <LogoManager
            currentLogo={data.logo}
            logoUrl={data.logoUrl}
            logoType={data.logoType}
            onChange={handleLogoChange}
        />
    );
};
```

---

## ⚙️ Logo Storage Service

### ฟังก์ชันหลัก

#### 1. `uploadLogoFile(file, customName?)`
อัปโหลดโลโก้จาก File object

```typescript
const file = event.target.files[0];
const logoUrl = await uploadLogoFile(file);
```

#### 2. `uploadLogoBase64(base64String, customName?)`
อัปโหลดโลโก้จาก Base64 string

```typescript
const logoUrl = await uploadLogoBase64('data:image/png;base64,...');
```

#### 3. `deleteLogo(logoUrl)`
ลบโลโก้จาก Storage

```typescript
await deleteLogo('https://firebasestorage.googleapis.com/...');
```

#### 4. `getLogoUrl(logoPath)`
ดึง URL จาก Storage path

```typescript
const url = await getLogoUrl('logos/logo-123456.jpg');
```

#### 5. `getDefaultLogoUrl()`
ดึง URL ของ Default Logo

```typescript
const defaultUrl = getDefaultLogoUrl(); // '/assets/default-logo.svg'
```

#### 6. `isDefaultLogo(logoUrl)`
ตรวจสอบว่าเป็น Default Logo หรือไม่

```typescript
if (isDefaultLogo(logoUrl)) {
    console.log('ใช้โลโก้ Default');
}
```

---

## 🔄 Flow การทำงาน

### การอัปโหลดโลโก้

```
[ผู้ใช้เลือกไฟล์]
    ↓
[อ่านเป็น Base64]
    ↓
[อัปเดต State ด้วย Base64] ← แสดงโลโก้ทันที
    ↓
[อัปโหลดไปยัง Firebase Storage]
    ↓
[ได้ Storage URL]
    ↓
[อัปเดต State ด้วย Storage URL] ← เปลี่ยนเป็นใช้ URL แทน
```

### การบันทึกลง Firestore

```
[กดปุ่มบันทึก]
    ↓
[ตรวจสอบ logoUrl]
    ↓
มี logoUrl?
    YES → บันทึก { logoUrl, logoType, logo: null }
    NO  → บันทึก { logo: base64, logoType }
    ↓
[บันทึกสำเร็จ]
```

### การแสดงผลโลโก้

```
[Preview Component]
    ↓
[คำนวณ displayLogo]
    ↓
displayLogo = logoUrl || logo || getDefaultLogoUrl()
    ↓
[แสดงรูปภาพ]
```

---

## 🛡️ Firebase Storage Rules

ตั้งค่า Security Rules สำหรับ `/logos`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /logos/{logoId} {
      // อนุญาตให้อ่านได้ทุกคน
      allow read: if true;
      
      // อนุญาตให้อัปโหลดเฉพาะผู้ใช้ที่ login
      allow write: if request.auth != null
                   && request.resource.size < 2 * 1024 * 1024  // จำกัด 2MB
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 📊 ข้อมูลที่เก็บใน Firestore

### ก่อนระบบ Hybrid (เก่า)
```json
{
  "logo": "data:image/png;base64,iVBORw0KGgoAAAANS..." // ขนาดใหญ่มาก!
}
```

### หลังระบบ Hybrid (ใหม่)
```json
{
  "logo": null,  // ไม่เก็บ Base64 แล้ว
  "logoUrl": "https://firebasestorage.googleapis.com/v0/b/project/o/logos%2Flogo-123.jpg",
  "logoType": "uploaded"
}
```

**ประหยัดพื้นที่ได้ถึง 90%!** 🎉

---

## 🎭 ประเภทของโลโก้ (LogoType)

| Type | คำอธิบาย | สถานะ |
|------|---------|-------|
| `'default'` | ใช้โลโก้ Default จาก `/public/assets/` | พร้อมใช้งานทันที |
| `'custom'` | อัปโหลดใหม่ กำลังบันทึกลง Storage | กำลังอัปโหลด... |
| `'uploaded'` | บันทึกใน Firebase Storage แล้ว | ☁️ ใน Cloud |

---

## 💡 Tips และ Best Practices

### 1. ขนาดโลโก้ที่แนะนำ
- **ความกว้าง**: 200-400px
- **ความสูง**: 80-150px  
- **ขนาดไฟล์**: < 200KB (ระบบจำกัดที่ 2MB)
- **รูปแบบ**: PNG (มีพื้นหลังโปร่งใส) หรือ SVG

### 2. การเปลี่ยนโลโก้ Default

แก้ไขไฟล์ `/public/assets/default-logo.svg`:
```svg
<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
  <!-- ใส่โค้ด SVG ของคุณที่นี่ -->
</svg>
```

### 3. การจัดการ Error

```typescript
try {
    const logoUrl = await uploadLogoBase64(base64);
    onChange(logoUrl, logoUrl, 'uploaded');
} catch (error) {
    console.error('Upload failed:', error);
    // ยังคงใช้ Base64 ได้ถ้าอัปโหลดไม่สำเร็จ
    onChange(base64, null, 'custom');
}
```

### 4. การลบโลโก้เก่าก่อนอัปโหลดใหม่

```typescript
// ลบโลโก้เก่าจาก Storage ก่อนอัปโหลดใหม่
if (logoUrl && !isDefaultLogo(logoUrl)) {
    await deleteLogo(logoUrl);
}
const newLogoUrl = await uploadLogoBase64(newBase64);
```

---

## 🐛 การแก้ไขปัญหา

### ปัญหา: โลโก้ไม่แสดง
**วิธีแก้**:
1. ตรวจสอบว่า `/public/assets/default-logo.svg` มีอยู่จริง
2. เช็ค Network tab ว่า URL ถูกต้อง
3. ตรวจสอบ CORS settings ใน Firebase Storage

### ปัญหา: อัปโหลดไม่สำเร็จ
**วิธีแก้**:
1. ตรวจสอบ Firebase Storage Rules
2. เช็คว่า file size < 2MB
3. ตรวจสอบ internet connection

### ปัญหา: โลโก้เบลอในรูป PDF
**วิธีแก้**:
1. ใช้โลโก้ความละเอียดสูง (2x ขนาดที่แสดง)
2. ใช้ไฟล์ SVG แทน PNG/JPG
3. เพิ่ม `scale` ใน html2canvas

---

## 📈 การ Optimize Performance

### 1. Lazy Loading โลโก้
```typescript
const [logoLoaded, setLogoLoaded] = useState(false);

<img 
    src={displayLogo} 
    alt="Logo"
    loading="lazy"
    onLoad={() => setLogoLoaded(true)}
/>
```

### 2. Caching
Firebase Storage มี CDN caching อัตโนมัติ - โลโก้จะถูก cache ที่ edge location ใกล้ผู้ใช้

### 3. Image Compression
ก่อนอัปโหลด ลดขนาดรูปภาพ:
```typescript
import imageCompression from 'browser-image-compression';

const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 400,
});
```

---

## 🔐 Security Considerations

1. **ตรวจสอบประเภทไฟล์**: รับเฉพาะ image/* เท่านั้น
2. **จำกัดขนาด**: สูงสุด 2MB
3. **Authentication**: ต้อง login ก่อนอัปโหลด
4. **Sanitize filenames**: ป้องกัน path traversal
5. **Rate limiting**: จำกัดจำนวนการอัปโหลดต่อนาที

---

## 📚 อ้างอิง

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [React FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [Base64 Encoding](https://developer.mozilla.org/en-US/docs/Glossary/Base64)
- [SVG Optimization](https://jakearchibald.github.io/svgomg/)

---

**สร้างโดย**: PDF Document Generator Team  
**วันที่อัปเดต**: 2 ตุลาคม 2025  
**เวอร์ชัน**: 2.0 (Hybrid Logo Management)

