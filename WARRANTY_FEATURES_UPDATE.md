# อัปเดตฟีเจอร์ใบรับประกัน (Warranty Features Update)

## 📅 วันที่อัปเดต: 10 ตุลาคม 2025

## ✨ ฟีเจอร์ใหม่

### 1. Checkbox สำหรับแสดง/ซ่อน Batch No. 
**ปัญหาเดิม:** Batch No. แสดงในเอกสารทุกครั้ง แม้ว่าจะไม่มีข้อมูล

**การแก้ไข:**
- เพิ่ม checkbox "แสดงหมายเลขการผลิต (Batch No.) ในเอกสาร" ในฟอร์ม
- Batch No. จะแสดงในเอกสารเฉพาะเมื่อ checkbox ถูกเลือก
- ค่า default คือ **ไม่แสดง** (unchecked)

**ไฟล์ที่เกี่ยวข้อง:**
- `types.ts` - เพิ่มฟิลด์ `showBatchNo?: boolean`
- `components/WarrantyForm.tsx` - เพิ่ม checkbox UI
- `components/WarrantyPreview.tsx` - แสดง Batch No. แบบมีเงื่อนไข
- `App.tsx` - เพิ่มค่า default `showBatchNo: false`

---

### 2. การรับประกันแบบงานรับสร้างบ้าน (Multiple Warranty Types)
**ปัญหาเดิม:** ระบบรองรับเฉพาะการรับประกันแบบเดียว (ระยะเวลาเดียว)

**การแก้ไข:**
- เพิ่มโหมด "การรับประกันแบบงานรับสร้างบ้าน" สำหรับงานก่อสร้างที่มีการรับประกันหลายประเภท
- สามารถเลือกประเภทการรับประกันได้ 3 ประเภท:
  - ✅ **รับประกันทั่วไป** - 1 ปี
  - ✅ **รับประกันงานหลังคา** - 3 ปี
  - ✅ **รับประกันงานโครงสร้าง** - 15 ปี

**ฟีเจอร์:**
- Checkbox หลักสำหรับเปิด/ปิดโหมดการรับประกันหลายประเภท
- เมื่อเปิดใช้งาน:
  - ฟิลด์ "ระยะเวลารับประกัน" จะถูก disable
  - แสดง checkbox ย่อยสำหรับเลือกประเภทการรับประกัน
  - แสดงผลในเอกสารแบบแยกประเภทพร้อมสีสันที่แตกต่างกัน
- เมื่อปิดใช้งาน: กลับไปใช้การรับประกันแบบปกติ

**ไฟล์ที่เกี่ยวข้อง:**
- `types.ts` - เพิ่มฟิลด์:
  - `useMultipleWarrantyTypes?: boolean`
  - `warrantyGeneral?: boolean`
  - `warrantyRoof?: boolean`
  - `warrantyStructure?: boolean`
- `components/WarrantyForm.tsx` - เพิ่ม UI สำหรับเลือกประเภทการรับประกัน
- `components/WarrantyPreview.tsx` - แสดงผลแบบมีเงื่อนไข (ปกติ vs หลายประเภท)
- `App.tsx` - เพิ่มค่า default สำหรับฟิลด์ใหม่

---

## 🐛 Bug Fixes

### แก้ไขปัญหา Service Templates ไม่ดึงข้อมูลครบ
**ปัญหา:** เมื่อเลือก Service Template ที่บันทึกไว้ ข้อมูล `productDetail` และ `batchNo` ไม่แสดงในฟอร์ม

**สาเหตุ:** ฟังก์ชัน `getUserServiceTemplates()` ใน `services/serviceTemplates.ts` ไม่ได้ดึงฟิลด์เหล่านี้จาก Firestore

**การแก้ไข:**
- เพิ่มการดึงฟิลด์ `productDetail` และ `batchNo` จาก Firestore
- เพิ่ม default value (`''`) สำหรับทุกฟิลด์เพื่อป้องกัน undefined

**ไฟล์ที่แก้ไข:**
- `services/serviceTemplates.ts` - ฟังก์ชัน `getUserServiceTemplates()`

---

## 📋 วิธีใช้งาน

### 1. การใช้ Checkbox แสดง Batch No.
1. กรอกข้อมูล Batch No. ในฟอร์ม
2. เลือก checkbox "แสดงหมายเลขการผลิต (Batch No.) ในเอกสาร"
3. Batch No. จะแสดงในเอกสารและ PDF

### 2. การใช้การรับประกันแบบงานรับสร้างบ้าน
1. ในส่วน "การรับประกัน" เลือก checkbox "🏠 ใช้การรับประกันแบบงานรับสร้างบ้าน (หลายประเภท)"
2. เลือกประเภทการรับประกันที่ต้องการ:
   - รับประกันทั่วไป (1 ปี)
   - รับประกันงานหลังคา (3 ปี)
   - รับประกันงานโครงสร้าง (15 ปี)
3. สามารถเลือกได้หลายประเภทพร้อมกัน
4. ในเอกสารจะแสดงประเภทการรับประกันที่เลือกไว้พร้อมระยะเวลา

---

## 🎨 UI/UX Improvements

### WarrantyForm
- เพิ่ม checkbox สำหรับ Batch No. ด้วย label ที่ชัดเจน
- เพิ่มกล่องสีฟ้า (blue-50) สำหรับส่วนการรับประกันแบบงานรับสร้างบ้าน
- แสดงข้อความแจ้งเตือนเมื่อใช้การรับประกันหลายประเภท
- ใช้สีที่แตกต่างกันสำหรับแต่ละประเภท:
  - เขียว (green) - รับประกันทั่วไป
  - น้ำเงิน (blue) - รับประกันงานหลังคา
  - ม่วง (purple) - รับประกันงานโครงสร้าง

### WarrantyPreview
- Batch No. แสดงเฉพาะเมื่อ `showBatchNo === true`
- การรับประกันแสดงแบบมีเงื่อนไข:
  - **โหมดปกติ:** แสดงระยะเวลาและวันสิ้นสุด
  - **โหมดหลายประเภท:** แสดงรายการประเภทที่เลือกพร้อมกล่องสี

---

## 🔧 Technical Details

### ฟิลด์ใหม่ใน WarrantyData Interface
```typescript
export interface WarrantyData {
    // ... ฟิลด์เดิม ...
    
    // ฟิลด์ใหม่
    showBatchNo?: boolean;         // แสดง Batch No. ในเอกสารหรือไม่
    useMultipleWarrantyTypes?: boolean;  // ใช้การรับประกันหลายประเภทหรือไม่
    warrantyGeneral?: boolean;     // รับประกันทั่วไป (1 ปี)
    warrantyRoof?: boolean;        // รับประกันงานหลังคา (3 ปี)
    warrantyStructure?: boolean;   // รับประกันงานโครงสร้าง (15 ปี)
}
```

### การบันทึกข้อมูล
- ฟิลด์ใหม่จะถูกบันทึกใน Firestore อัตโนมัติ
- PDF Generator จะใช้ html2canvas แปลง WarrantyPreview เป็น PDF
- รองรับ backward compatibility (ข้อมูลเก่าที่ไม่มีฟิลด์ใหม่ยังใช้งานได้)

---

## ✅ Testing Checklist

- [x] Checkbox Batch No. ทำงานถูกต้อง (แสดง/ซ่อน)
- [x] การรับประกันแบบปกติยังทำงานได้ตามเดิม
- [x] การรับประกันแบบหลายประเภทแสดงผลถูกต้อง
- [x] Service Templates ดึงข้อมูลครบถ้วน (productDetail, batchNo)
- [x] บันทึกข้อมูลลง Firestore สำเร็จ
- [x] สร้าง PDF ได้ถูกต้อง
- [x] ไม่มี linter errors
- [x] รองรับข้อมูลเก่า (backward compatible)

---

## 📝 Notes

1. **Default Values:**
   - `showBatchNo` = `false` (ไม่แสดง Batch No.)
   - `useMultipleWarrantyTypes` = `false` (ใช้การรับประกันแบบปกติ)
   - `warrantyGeneral`, `warrantyRoof`, `warrantyStructure` = `false`

2. **Behavior:**
   - เมื่อเปิด `useMultipleWarrantyTypes` ฟิลด์ `warrantyPeriod` จะถูก disable และล้างค่า
   - สามารถเลือกประเภทการรับประกันได้หลายประเภทพร้อมกัน
   - ถ้าไม่เลือกประเภทใดเลย จะแสดงข้อความ "ยังไม่ได้เลือกประเภทการรับประกัน"

3. **Future Enhancements:**
   - อาจเพิ่มการกำหนดระยะเวลารับประกันแบบ custom ได้
   - อาจเพิ่มประเภทการรับประกันอื่นๆ
   - อาจเพิ่มการคำนวณวันสิ้นสุดสำหรับแต่ละประเภท

---

## 🙏 Credits
อัปเดตโดย: AI Assistant  
วันที่: 10 ตุลาคม 2025  
Version: 2.0

