# คู่มือการตั้งค่า Default Logo แยกตามองค์กร

## 📋 ภาพรวม

ระบบรองรับการตั้งค่า **Default Logo** แยกตามแต่ละองค์กร ทำให้แต่ละองค์กรสามารถมีโลโก้เริ่มต้นของตัวเองได้ โดยไม่ต้องใช้โลโก้เริ่มต้นของระบบร่วมกัน

## 🎯 ฟีเจอร์หลัก

### 1. Default Logo แยกตามองค์กร
- แต่ละองค์กรสามารถตั้งค่า default logo ของตัวเองได้
- ถ้าองค์กรไม่มี default logo จะใช้ default logo ของระบบ (`/assets/default-logo.svg`)
- Default logo ของแต่ละองค์กรจะถูกบันทึกใน Firestore

### 2. การจัดการ Default Logo
- **อัปโหลดโลโก้ใหม่**: อัปโหลดโลโก้จากไฟล์ (PNG, JPG, SVG สูงสุด 2MB)
- **ตั้งเป็น Default**: ตั้งค่าโลโก้ปัจจุบันเป็น default logo ของบริษัท
- **ใช้ Default**: กลับไปใช้ default logo ของบริษัท
- **เลือกจากคลัง**: เลือกโลโก้จากคลังที่อัปโหลดไว้แล้ว

## 🔧 โครงสร้างข้อมูล

### Company Interface
```typescript
export interface Company {
    id?: string;
    name: string;
    address?: string;
    userId: string;
    logoUrl?: string | null;           // โลโก้ปัจจุบัน
    logoType?: LogoType;                // ประเภทโลโก้
    defaultLogoUrl?: string | null;     // ⭐ Default logo ของแต่ละองค์กร (ใหม่!)
    memberCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
```

## 📝 วิธีใช้งาน

### สำหรับผู้ใช้งาน

#### 1. ตั้งค่า Default Logo ของบริษัท

1. อัปโหลดโลโก้ที่ต้องการใช้เป็น default
2. รอให้โลโก้อัปโหลดเสร็จ (สถานะจะเปลี่ยนเป็น "☁️ ใน Cloud")
3. คลิกปุ่ม **ตั้งเป็น Default** (ปุ่มสีม่วง ✓)
4. ยืนยันการตั้งค่า
5. โลโก้นี้จะกลายเป็น default logo ของบริษัท

#### 2. ใช้ Default Logo

- คลิกปุ่ม **ใช้โลโก้ Default** (ปุ่มสีเทา 🔄)
- ระบบจะใช้ default logo ของบริษัท (ถ้ามี) หรือ default logo ของระบบ

#### 3. เปลี่ยน Default Logo

1. อัปโหลดโลโก้ใหม่
2. คลิกปุ่ม **ตั้งเป็น Default** อีกครั้ง
3. Default logo เดิมจะถูกแทนที่ด้วยโลโก้ใหม่

### สำหรับนักพัฒนา

#### 1. ตั้งค่า Default Logo

```typescript
import { setCompanyDefaultLogo } from './services/companies';

// ตั้งค่า default logo ของบริษัท
await setCompanyDefaultLogo(companyId, logoUrl);
```

#### 2. ดึง Default Logo URL

```typescript
import { getDefaultLogoUrl } from './services/logoStorage';

// ดึง default logo URL (ใช้ของ company ถ้ามี, ไม่งั้นใช้ของระบบ)
const defaultUrl = getDefaultLogoUrl(company?.defaultLogoUrl);
```

#### 3. ใช้งานใน Component

```typescript
<LogoManager
    currentLogo={currentLogo}
    logoUrl={logoUrl}
    logoType={logoType}
    companyDefaultLogoUrl={company?.defaultLogoUrl}  // ส่ง default logo ของ company
    onChange={handleLogoChange}
    onSetDefaultLogo={handleSetDefaultLogo}          // callback สำหรับตั้งค่า default
    showLabel={true}
    label="โลโก้บริษัท"
/>
```

## 🎨 UI Components

### ปุ่มในระบบ

1. **ปุ่มเปลี่ยนโลโก้** (สีน้ำเงิน 🖊️)
   - เปลี่ยนโลโก้ปัจจุบัน

2. **ปุ่มตั้งเป็น Default** (สีม่วง ✓)
   - แสดงเฉพาะเมื่อโลโก้ถูกอัปโหลดแล้ว
   - ตั้งค่าโลโก้ปัจจุบันเป็น default logo ของบริษัท

3. **ปุ่มใช้ Default** (สีเทา 🔄)
   - กลับไปใช้ default logo ของบริษัท

4. **ปุ่มลบ** (สีแดง ✕)
   - ลบโลโก้ปัจจุบันและใช้ default แทน

## 🔄 Flow การทำงาน

```
1. ผู้ใช้อัปโหลดโลโก้
   ↓
2. โลโก้ถูกบันทึกใน Firebase Storage
   ↓
3. ระบบแปลงเป็น Base64 เพื่อหลีกเลี่ยงปัญหา CORS
   ↓
4. ผู้ใช้คลิก "ตั้งเป็น Default"
   ↓
5. logoUrl ถูกบันทึกใน company.defaultLogoUrl
   ↓
6. ครั้งต่อไปที่ใช้ "ใช้ Default" จะได้โลโก้นี้
```

## 📊 ตัวอย่างการใช้งาน

### Scenario 1: บริษัทใหม่ (ยังไม่มี default logo)

```typescript
// company.defaultLogoUrl = null
const defaultUrl = getDefaultLogoUrl(null);
// Result: "/assets/default-logo.svg" (ใช้ของระบบ)
```

### Scenario 2: บริษัทที่มี default logo แล้ว

```typescript
// company.defaultLogoUrl = "https://firebasestorage.../logo.jpg"
const defaultUrl = getDefaultLogoUrl(company.defaultLogoUrl);
// Result: "https://firebasestorage.../logo.jpg" (ใช้ของบริษัท)
```

## 🛠️ Services ที่เกี่ยวข้อง

### 1. `companies.ts`
- `setCompanyDefaultLogo()`: ตั้งค่า default logo
- `getCompanyById()`: ดึงข้อมูลบริษัท (รวม defaultLogoUrl)
- `getUserCompanies()`: ดึงรายการบริษัท (รวม defaultLogoUrl)

### 2. `logoStorage.ts`
- `getDefaultLogoUrl()`: ดึง default logo URL (รองรับ company default)
- `uploadLogoBase64()`: อัปโหลดโลโก้
- `convertStorageUrlToBase64()`: แปลง URL เป็น Base64

### 3. `LogoManager.tsx`
- Component หลักสำหรับจัดการโลโก้
- รองรับการตั้งค่า default logo

## 🔐 Security Rules

ตรวจสอบว่า Firestore Rules อนุญาตให้อัปเดต `defaultLogoUrl`:

```javascript
match /companies/{companyId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth != null && 
                   (resource.data.userId == request.auth.uid || 
                    isMemberOfCompany(companyId, request.auth.uid));
  allow delete: if request.auth != null && 
                   resource.data.userId == request.auth.uid;
}
```

## 📈 Benefits

1. **แยกองค์กรชัดเจน**: แต่ละองค์กรมีโลโก้เริ่มต้นของตัวเอง
2. **ประหยัดเวลา**: ไม่ต้องอัปโหลดโลโก้ทุกครั้งที่สร้างเอกสาร
3. **Consistency**: โลโก้ที่ใช้ในเอกสารจะสอดคล้องกันตลอด
4. **Flexibility**: สามารถเปลี่ยน default logo ได้ตามต้องการ

## 🐛 Troubleshooting

### ปัญหา: ไม่เห็นปุ่ม "ตั้งเป็น Default"

**สาเหตุ**: โลโก้ยังไม่ได้อัปโหลดไปยัง Storage

**แก้ไข**: 
1. รอให้โลโก้อัปโหลดเสร็จ
2. ตรวจสอบว่า `logoType === 'uploaded'` และมี `logoUrl`

### ปัญหา: Default logo ไม่เปลี่ยน

**สาเหตุ**: Context ยังไม่ refresh

**แก้ไข**:
1. Refresh หน้าเว็บ
2. หรือเพิ่ม `refreshCompanies()` ใน CompanyContext

### ปัญหา: CORS Error เมื่อแสดงโลโก้

**สาเหตุ**: Firebase Storage CORS ไม่ถูกต้อง

**แก้ไข**: ดูคู่มือ `CORS_SETUP_STEP_BY_STEP.md`

## 📚 เอกสารที่เกี่ยวข้อง

- `LOGO_MANAGEMENT_GUIDE.md`: คู่มือการจัดการโลโก้โดยรวม
- `LOGO_GALLERY_GUIDE.md`: คู่มือการใช้งานคลังโลโก้
- `CORS_SETUP_STEP_BY_STEP.md`: การตั้งค่า CORS สำหรับ Firebase Storage
- `MULTI_COMPANY_GUIDE.md`: คู่มือระบบ Multi-Company

## 🎉 สรุป

ระบบ Default Logo แยกตามองค์กรช่วยให้:
- แต่ละองค์กรมีเอกลักษณ์ของตัวเอง
- ลดขั้นตอนการสร้างเอกสาร
- เพิ่มความสะดวกในการใช้งาน
- รองรับการทำงานแบบ Multi-Company อย่างสมบูรณ์

---

**Version**: 1.0.0  
**Last Updated**: October 10, 2025  
**Author**: Ecertdoc Development Team

