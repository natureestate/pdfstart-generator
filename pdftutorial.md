# PDF Tutorial - คู่มือการสร้างและจัดการ PDF สำหรับ LLM

## 📚 ภาพรวม

โปรเจคนี้ใช้ **jsPDF** และ **html2canvas** ในการสร้างเอกสาร PDF จาก HTML elements โดยรองรับฟอนต์ภาษาไทย (IBM Plex Sans Thai) เพื่อให้ตัวอักษรไทยแสดงผลได้อย่างถูกต้องใน PDF

---

## 🎯 สถาปัตยกรรมการสร้าง PDF

### ขั้นตอนการทำงาน

```
HTML Element → html2canvas → Canvas → Image → jsPDF → PDF File
```

1. **HTML Element**: สร้างเอกสารด้วย React Component
2. **html2canvas**: แปลง HTML เป็น Canvas
3. **Canvas to Image**: แปลง Canvas เป็น Image (JPEG format)
4. **jsPDF**: สร้าง PDF และฝังรูปภาพเข้าไป
5. **Font Embedding**: ฝังฟอนต์ภาษาไทยเพื่อรองรับการแสดงผล

---

## 📦 Dependencies ที่ใช้งาน

```json
{
  "jspdf": "^3.0.3",
  "html2canvas": "^1.4.1"
}
```

### การติดตั้ง

```bash
npm install jspdf html2canvas
```

---

## 🔧 ส่วนประกอบหลัก

### 1. ฟอนต์ภาษาไทย (Thai Font Configuration)

**ไฟล์**: `constants/IBMPlexSansThaiBase64.ts`

```typescript
// ฟอนต์ IBM Plex Sans Thai ถูกแปลงเป็น Base64 String
export const font = 'AAEAAAARAQAABAAQR0RFRgQsBFI...'; // Base64 encoded font
```

**ทำไมต้องใช้ Base64?**
- jsPDF ต้องการฟอนต์ในรูปแบบ Base64 เพื่อฝังเข้าไปใน PDF
- ป้องกันปัญหาการโหลดฟอนต์จาก external source
- ทำให้ PDF สามารถแสดงผลภาษาไทยได้ถูกต้องทุกครั้ง

**วิธีการแปลงฟอนต์เป็น Base64:**
```bash
# ใช้ command line
base64 -i IBMPlexSansThai-Regular.ttf -o font.txt

# หรือใช้ online converter
# https://transfonter.org/
```

---

### 2. PDF Generator Service

**ไฟล์**: `services/pdfGenerator.ts`

```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { font } from '../constants/IBMPlexSansThaiBase64';

export const generatePdf = async (
    element: HTMLElement, 
    filename: string
): Promise<void> => {
    // 1. เตรียม HTML Element
    const originalOverflow = element.style.overflow;
    element.style.overflow = 'visible'; // ซ่อน scrollbar

    // 2. แปลง HTML เป็น Canvas
    const canvas = await html2canvas(element, {
        scale: 2,           // ความละเอียด (2x = high resolution)
        useCORS: true,      // อนุญาตให้โหลดรูปภาพจาก cross-origin
        logging: false,     // ปิด console logs
    });

    // 3. คืนค่า overflow ให้เดิม
    element.style.overflow = originalOverflow;

    // 4. แปลง Canvas เป็น Image (JPEG)
    const imgData = canvas.toDataURL('image/jpeg', 0.95); 
    // 0.95 = quality (95%) เพื่อลดขนาดไฟล์

    // 5. สร้าง PDF Document
    const pdf = new jsPDF({
        orientation: 'portrait',  // แนวตั้ง
        unit: 'mm',              // หน่วยเป็น millimeters
        format: 'a4',            // ขนาด A4
    });

    // 6. เพิ่มฟอนต์ภาษาไทย
    pdf.addFileToVFS('IBMPlexSansThai-Regular.ttf', font);
    pdf.addFont('IBMPlexSansThai-Regular.ttf', 'IBMPlexSansThai', 'normal');
    pdf.setFont('IBMPlexSansThai');

    // 7. คำนวณขนาดรูปภาพให้พอดีกับหน้า A4
    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    let imgWidth = pdfWidth;
    let imgHeight = imgWidth / ratio;
    
    // ถ้ารูปสูงเกินหน้ากระดาษ ให้ปรับขนาด
    if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = imgHeight * ratio;
    }

    // 8. คำนวณตำแหน่งให้รูปภาพอยู่กึ่งกลางหน้า
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;
    
    // 9. เพิ่มรูปภาพเข้าไปใน PDF
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
    
    // 10. บันทึกไฟล์ PDF
    pdf.save(filename);
};
```

**พารามิเตอร์สำคัญ:**

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|------------|--------|----------|
| `element` | HTMLElement | HTML element ที่ต้องการแปลงเป็น PDF |
| `filename` | string | ชื่อไฟล์ PDF ที่ต้องการบันทึก (เช่น "delivery-note.pdf") |

**การปรับแต่ง html2canvas:**

```typescript
html2canvas(element, {
    scale: 2,              // ความละเอียด: 1=ปกติ, 2=สูง, 3=สูงมาก
    useCORS: true,         // สำหรับรูปภาพจาก external sources
    logging: false,        // เปิด/ปิด debug logs
    backgroundColor: null, // สีพื้นหลัง (null = โปร่งใส)
    windowWidth: 1200,     // กำหนดความกว้างของ viewport
    windowHeight: 800,     // กำหนดความสูงของ viewport
});
```

**การปรับแต่ง jsPDF:**

```typescript
const pdf = new jsPDF({
    orientation: 'portrait',  // 'portrait' หรือ 'landscape'
    unit: 'mm',              // 'mm', 'cm', 'in', 'px', 'pt'
    format: 'a4',            // 'a3', 'a4', 'a5', 'letter', [width, height]
    compress: true,          // บีบอัดไฟล์ (ลดขนาด)
});
```

---

### 3. Preview Components

#### ใบส่งมอบงาน (Delivery Note Preview)

**ไฟล์**: `components/DocumentPreview.tsx`

```typescript
import React, { forwardRef } from 'react';
import { DeliveryNoteData } from '../types';

const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(
    ({ data }, ref) => {
        const formatDate = (date: Date | null) => {
            if (!date) return '...........................';
            return new Intl.DateTimeFormat('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(date);
        };

        return (
            <div 
                ref={ref} 
                className="bg-white shadow-lg p-8 md:p-12 w-full aspect-[210/297]"
                id="printable-area"
            >
                {/* เนื้อหาเอกสาร */}
            </div>
        );
    }
);

export default DocumentPreview;
```

**คุณสมบัติสำคัญ:**

1. **forwardRef**: ใช้เพื่อส่ง ref ไปยัง DOM element
2. **ref**: ใช้สำหรับอ้างอิงถึง element นี้เพื่อแปลงเป็น PDF
3. **aspect-[210/297]**: สัดส่วนของกระดาษ A4
4. **id="printable-area"**: ID สำหรับระบุ element ที่จะพิมพ์

#### ใบรับประกันสินค้า (Warranty Preview)

**ไฟล์**: `components/WarrantyPreview.tsx`

โครงสร้างเหมือนกับ DocumentPreview แต่มีเนื้อหาและ layout ที่แตกต่างกัน

---

### 4. การใช้งานใน Component หลัก

**ไฟล์**: `App.tsx`

```typescript
import React, { useRef, useCallback } from 'react';
import { generatePdf } from './services/pdfGenerator';

const App: React.FC = () => {
    // สร้าง ref สำหรับอ้างอิง preview element
    const printableAreaRef = useRef<HTMLDivElement>(null);
    
    // ฟังก์ชันสำหรับ export PDF
    const handleExportPdf = useCallback(async () => {
        // ตรวจสอบว่า ref มีค่า
        if (!printableAreaRef.current) return;
        
        // แสดง loading state
        setIsLoading(true);
        showToast('กำลังสร้าง PDF...', 'info');

        // กำหนดชื่อไฟล์
        const filename = `delivery-note-${data.docNumber}.pdf`;

        try {
            // เรียกใช้ generatePdf
            await generatePdf(printableAreaRef.current, filename);
            showToast('สร้างไฟล์ PDF เรียบร้อยแล้ว', 'success');
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            showToast('ไม่สามารถสร้างไฟล์ PDF ได้', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [data.docNumber]);

    return (
        <div>
            {/* ปุ่ม Export */}
            <button onClick={handleExportPdf} disabled={isLoading}>
                {isLoading ? 'กำลังสร้าง...' : 'ดาวน์โหลด PDF'}
            </button>

            {/* Preview Component */}
            <DocumentPreview ref={printableAreaRef} data={data} />
        </div>
    );
};
```

---

## 🎨 Best Practices สำหรับ Preview Component

### 1. กำหนดสัดส่วนให้ตรงกับกระดาษ A4

```tsx
// A4 = 210mm x 297mm (aspect ratio = 210/297 = 0.707)
<div className="w-full aspect-[210/297]">
    {/* เนื้อหา */}
</div>
```

### 2. ใช้ Tailwind CSS สำหรับ Styling

```tsx
<div className="bg-white p-8 shadow-lg rounded-lg">
    <h1 className="text-2xl font-bold text-gray-800">หัวข้อ</h1>
    <p className="text-sm text-gray-600">รายละเอียด</p>
</div>
```

### 3. จัดการวันที่ด้วย Intl.DateTimeFormat

```typescript
const formatDate = (date: Date | null) => {
    if (!date) return '...........................';
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'long',    // 'มกราคม', 'กุมภาพันธ์', etc.
        day: 'numeric',
    }).format(date);
};

// Output: "30 กันยายน 2568" (พ.ศ.)
```

### 4. จัดการรูปภาพที่อัปโหลด

```typescript
const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            // แปลงเป็น Base64 Data URL
            setLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
};
```

### 5. ใช้ forwardRef สำหรับ Preview

```typescript
const Preview = forwardRef<HTMLDivElement, PreviewProps>((props, ref) => {
    return (
        <div ref={ref}>
            {/* เนื้อหา */}
        </div>
    );
});
```

---

## 🔍 Types และ Interfaces

**ไฟล์**: `types.ts`

```typescript
// สำหรับใบส่งมอบงาน
export interface WorkItem {
    description: string;  // รายละเอียดงาน
    quantity: number;     // จำนวน
    unit: string;        // หน่วย
    notes: string;       // หมายเหตุ
}

export interface DeliveryNoteData {
    logo: string | null;           // Base64 logo image
    fromCompany: string;           // ชื่อบริษัทผู้ส่ง
    fromAddress: string;           // ที่อยู่ผู้ส่ง
    toCompany: string;             // ชื่อบริษัทผู้รับ
    toAddress: string;             // ที่อยู่ผู้รับ
    docNumber: string;             // เลขที่เอกสาร
    date: Date | null;             // วันที่
    project: string;               // โครงการ/เรื่อง
    items: WorkItem[];             // รายการสิ่งของ
    senderName: string;            // ชื่อผู้ส่งมอบ
    receiverName: string;          // ชื่อผู้รับมอบ
}

// สำหรับใบรับประกันสินค้า
export interface WarrantyData {
    logo: string | null;           // Base64 logo image
    companyName: string;           // ชื่อบริษัท
    companyAddress: string;        // ที่อยู่บริษัท
    customerName: string;          // ชื่อลูกค้า
    customerContact: string;       // ข้อมูลติดต่อ
    productName: string;           // ชื่อสินค้า
    serialNumber: string;          // หมายเลขเครื่อง
    purchaseDate: Date | null;     // วันที่ซื้อ
    warrantyPeriod: string;        // ระยะเวลารับประกัน
    terms: string;                 // เงื่อนไขการรับประกัน
}
```

---

## ⚙️ ฟังก์ชันเสริม

### Date Utilities

**ไฟล์**: `utils/dateUtils.ts`

```typescript
// แปลง Date เป็น string สำหรับ <input type="date">
export const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    
    // ปรับ timezone offset
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzoffset)
        .toISOString()
        .slice(0, 10);
    
    return localISOTime; // Format: YYYY-MM-DD
};
```

---

## 🚀 ตัวอย่างการใช้งานเต็มรูปแบบ

### สร้างเอกสารใบส่งมอบงาน

```typescript
import { useState, useRef, useCallback } from 'react';
import { generatePdf } from './services/pdfGenerator';
import DocumentPreview from './components/DocumentPreview';

function App() {
    const [data, setData] = useState({
        logo: null,
        fromCompany: 'บริษัท ต้นทาง จำกัด',
        fromAddress: '123 ถนนสุขุมวิท กรุงเทพฯ',
        toCompany: 'บริษัท ปลายทาง จำกัด',
        toAddress: '456 ถนนสีลม กรุงเทพฯ',
        docNumber: 'DN-2024-001',
        date: new Date(),
        project: 'โครงการพัฒนา Web Application',
        items: [
            { description: 'ออกแบบ UI/UX', quantity: 1, unit: 'งาน', notes: '' },
            { description: 'พัฒนา Backend', quantity: 1, unit: 'งาน', notes: 'ทดสอบแล้ว' },
        ],
        senderName: 'สมชาย ใจดี',
        receiverName: '',
    });

    const previewRef = useRef<HTMLDivElement>(null);

    const handleExport = useCallback(async () => {
        if (!previewRef.current) return;
        
        try {
            await generatePdf(
                previewRef.current, 
                `delivery-note-${data.docNumber}.pdf`
            );
            alert('สร้าง PDF สำเร็จ!');
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาด');
        }
    }, [data.docNumber]);

    return (
        <div>
            <button onClick={handleExport}>ดาวน์โหลด PDF</button>
            <DocumentPreview ref={previewRef} data={data} />
        </div>
    );
}
```

---

## 🐛 การแก้ไขปัญหาที่พบบ่อย

### 1. ฟอนต์ภาษาไทยไม่แสดงใน PDF

**สาเหตุ**: ไม่ได้ฝังฟอนต์เข้าไปใน PDF

**วิธีแก้**:
```typescript
// ต้องเพิ่มฟอนต์ก่อนใช้งาน
pdf.addFileToVFS('IBMPlexSansThai-Regular.ttf', font);
pdf.addFont('IBMPlexSansThai-Regular.ttf', 'IBMPlexSansThai', 'normal');
pdf.setFont('IBMPlexSansThai');
```

### 2. รูปภาพไม่แสดงใน PDF

**สาเหตุ**: CORS policy หรือรูปภาพยังโหลดไม่เสร็จ

**วิธีแก้**:
```typescript
html2canvas(element, {
    useCORS: true,  // อนุญาต cross-origin images
});

// รอให้รูปโหลดเสร็จก่อน
await new Promise(resolve => setTimeout(resolve, 500));
```

### 3. PDF มีขนาดไฟล์ใหญ่เกินไป

**วิธีแก้**:
```typescript
// 1. ใช้ JPEG แทน PNG และลด quality
canvas.toDataURL('image/jpeg', 0.85);  // 85% quality

// 2. ลด scale ของ html2canvas
html2canvas(element, { scale: 1.5 });  // แทน scale: 2

// 3. เปิดการบีบอัด
const pdf = new jsPDF({ compress: true });
```

### 4. Layout ไม่ตรงกับที่เห็นบนหน้าจอ

**วิธีแก้**:
```typescript
// ซ่อน scrollbar ก่อนแปลงเป็น PDF
element.style.overflow = 'visible';

// หรือกำหนดขนาด viewport ที่ชัดเจน
html2canvas(element, {
    windowWidth: 1200,
    windowHeight: 1697,  // A4 ratio
});
```

### 5. Date แสดงเป็น Timezone ผิด

**วิธีแก้**:
```typescript
const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const tzoffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzoffset)
        .toISOString()
        .slice(0, 10);
};
```

---

## 📊 Performance Optimization

### 1. ใช้ useMemo สำหรับ Preview

```typescript
const preview = useMemo(() => (
    <DocumentPreview ref={previewRef} data={data} />
), [data]);
```

### 2. Debounce การ Preview

```typescript
import { debounce } from 'lodash';

const updatePreview = debounce(() => {
    // Update preview
}, 300);
```

### 3. Lazy Load html2canvas และ jsPDF

```typescript
const generatePdf = async (element: HTMLElement, filename: string) => {
    const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
    ]);
    
    // ใช้งานตามปกติ
};
```

---

## 🎓 ตัวอย่างการขยายความสามารถ

### เพิ่มการสร้าง PDF แบบหลายหน้า

```typescript
export const generateMultiPagePdf = async (
    elements: HTMLElement[], 
    filename: string
): Promise<void> => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    for (let i = 0; i < elements.length; i++) {
        const canvas = await html2canvas(elements[i], { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) pdf.addPage(); // เพิ่มหน้าใหม่
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }
    
    pdf.save(filename);
};
```

### เพิ่ม Watermark

```typescript
const addWatermark = (pdf: jsPDF, text: string) => {
    pdf.setFontSize(50);
    pdf.setTextColor(200, 200, 200);
    pdf.text(text, 105, 150, {
        align: 'center',
        angle: 45,
        opacity: 0.3,
    });
};
```

### สร้าง PDF พร้อม Metadata

```typescript
const pdf = new jsPDF();

// เพิ่ม metadata
pdf.setProperties({
    title: 'ใบส่งมอบงาน',
    subject: 'Delivery Note',
    author: 'บริษัท ABC จำกัด',
    keywords: 'delivery, note, pdf',
    creator: 'PDF Generator App',
});
```

---

## 📝 Checklist สำหรับการสร้าง PDF

- [ ] ฝังฟอนต์ภาษาไทยแล้ว
- [ ] กำหนดขนาดกระดาษ (A4)
- [ ] ตั้งค่า scale ของ html2canvas (แนะนำ 2)
- [ ] ใช้ JPEG format พร้อม quality 0.85-0.95
- [ ] ตรวจสอบ CORS สำหรับรูปภาพ
- [ ] ซ่อน scrollbar ก่อนแปลง
- [ ] คำนวณ aspect ratio ให้ถูกต้อง
- [ ] จัดการ error handling
- [ ] แสดง loading state ขณะสร้าง PDF
- [ ] ทดสอบกับข้อมูลจริง

---

## 🌟 สรุป

โปรเจคนี้ใช้เทคนิคการสร้าง PDF โดย:

1. **แปลง HTML → Canvas** ด้วย html2canvas
2. **แปลง Canvas → Image** (JPEG format)
3. **สร้าง PDF Document** ด้วย jsPDF
4. **ฝังฟอนต์ภาษาไทย** จาก Base64 string
5. **บันทึกไฟล์** ให้ผู้ใช้ดาวน์โหลด

**ข้อดี:**
- รองรับภาษาไทย 100%
- สร้าง PDF ได้บน client-side (ไม่ต้องใช้ server)
- Responsive และใช้งานง่าย
- ปรับแต่งได้ตามต้องการ

**ข้อควรระวัง:**
- ขนาดไฟล์อาจใหญ่ถ้าใช้ scale สูงเกินไป
- ต้องรอให้รูปภาพโหลดเสร็จก่อนสร้าง PDF
- CORS policy อาจเป็นปัญหากับรูปภาพจาก external sources

---

## 📚 เอกสารอ้างอิง

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [IBM Plex Sans Thai Font](https://fonts.google.com/specimen/IBM+Plex+Sans+Thai)
- [Base64 Font Converter](https://transfonter.org/)

---

**หมายเหตุ**: เอกสารนี้สร้างขึ้นเพื่อให้ LLM เข้าใจและสามารถใช้งาน PDF generation functions ในโปรเจคนี้ได้อย่างถูกต้อง
