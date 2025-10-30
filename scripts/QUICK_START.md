# 🚀 Quick Start - ย้ายข้อมูลไป Nature Estate

## ขั้นตอนง่ายๆ เพียง 3 ขั้นตอน!

---

## 📥 ขั้นตอนที่ 1: ดาวน์โหลด Service Account Key

### 1.1 เข้า Firebase Console
👉 เปิด: https://console.firebase.google.com/project/ecertonline-29a67/settings/serviceaccounts/adminsdk

### 1.2 ดาวน์โหลด Key
- คลิกปุ่ม **"Generate new private key"**
- คลิก **"Generate key"**
- ไฟล์ JSON จะถูกดาวน์โหลด

### 1.3 วางไฟล์
```bash
# ย้ายไฟล์จาก Downloads มาไว้ใน scripts/
cd /Users/macbooknow/Ecertdoc/pdfexportforDeliveryandCert
mv ~/Downloads/ecertonline-29a67-*.json scripts/serviceAccountKey.json
```

✅ **เสร็จขั้นตอนที่ 1!**

---

## 🔍 ขั้นตอนที่ 2: ตรวจสอบข้อมูล

```bash
cd /Users/macbooknow/Ecertdoc/pdfexportforDeliveryandCert

# ถ้ารู้ Email ของคุณ (แนะนำ)
USER_EMAIL=your@email.com npx ts-node scripts/check-firestore-admin.ts

# หรือรู้ User ID
USER_ID=your-user-id npx ts-node scripts/check-firestore-admin.ts
```

**Output จะบอกว่ามีข้อมูลอะไรบ้าง:**
- จำนวน Companies
- จำนวน Delivery Notes
- จำนวน Warranty Cards

✅ **เสร็จขั้นตอนที่ 2!**

---

## 🚀 ขั้นตอนที่ 3: ย้ายข้อมูล

```bash
# ย้ายข้อมูลทั้งหมดไป Nature Estate
USER_EMAIL=your@email.com npx ts-node scripts/migrate-to-nature-estate-admin.ts
```

**Script จะ:**
1. แสดงสถิติข้อมูลปัจจุบัน
2. สร้าง Nature Estate Company (ถ้ายังไม่มี)
3. รอ 5 วินาที (กด Ctrl+C เพื่อยกเลิก)
4. ย้ายข้อมูลทั้งหมด
5. แสดงสถิติหลังย้าย

✅ **เสร็จทุกขั้นตอน!**

---

## 🎉 เสร็จสิ้น!

### ตรวจสอบในแอป:
1. เปิด https://ecertonline-29a67.web.app
2. Login ด้วย Google
3. เลือก Company: **Nature Estate**
4. ดูข้อมูลทั้งหมดของคุณ!

---

## 🔒 อย่าลืม!

```bash
# ลบ Service Account Key หลังใช้งานเสร็จ (เพื่อความปลอดภัย)
rm scripts/serviceAccountKey.json
```

---

## 🆘 มีปัญหา?

อ่านคู่มือฉบับเต็ม: `ADMIN_SDK_GUIDE.md`

---

**สรุป 3 คำสั่งหลัก:**

```bash
# 1. ย้ายไฟล์ Service Account Key
mv ~/Downloads/ecertonline-29a67-*.json scripts/serviceAccountKey.json

# 2. ตรวจสอบข้อมูล
USER_EMAIL=your@email.com npx ts-node scripts/check-firestore-admin.ts

# 3. ย้ายข้อมูล
USER_EMAIL=your@email.com npx ts-node scripts/migrate-to-nature-estate-admin.ts
```

**เปลี่ยน `your@email.com` เป็น Email ที่คุณใช้ Login Firebase!**

