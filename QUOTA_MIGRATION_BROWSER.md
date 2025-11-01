# 🌐 สร้าง Quota ผ่าน Browser (วิธีง่ายที่สุด)

## 📋 ปัญหา

บริษัท NATURE ESTATE มีอยู่แล้ว แต่ยังไม่มี Quota

---

## ✅ วิธีแก้ไข (ใช้ Browser Console)

### ขั้นตอนที่ 1: เปิด Super Admin Dashboard

1. เปิดเบราว์เซอร์ไปที่ Super Admin Dashboard
2. Login ด้วยบัญชี Super Admin (`sinanan.ac.th@gmail.com`)

### ขั้นตอนที่ 2: เปิด Browser Console

- **Chrome/Edge:** กด `Ctrl+Shift+J` (Windows) หรือ `Cmd+Option+J` (Mac)
- **Firefox:** กด `Ctrl+Shift+K` (Windows) หรือ `Cmd+Option+K` (Mac)

### ขั้นตอนที่ 3: วาง Code นี้ลงใน Console

```javascript
// Import functions ที่จำเป็น
import { collection, doc, setDoc, getDocs, Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ฟังก์ชันสร้าง quota
async function createQuotasForAllCompanies() {
    const db = getFirestore();
    
    try {
        console.log('🚀 เริ่มสร้าง Quota...');
        
        // ดึงรายการบริษัททั้งหมด
        const companiesRef = collection(db, 'companies');
        const companiesSnap = await getDocs(companiesRef);
        
        console.log(`📋 พบบริษัททั้งหมด: ${companiesSnap.size} บริษัท`);
        
        // ตรวจสอบ quota ที่มีอยู่
        const quotasRef = collection(db, 'companyQuotas');
        const quotasSnap = await getDocs(quotasRef);
        const existingQuotas = new Set(quotasSnap.docs.map(d => d.id));
        
        console.log(`💎 มี Quota อยู่แล้ว: ${existingQuotas.size} quota`);
        
        let created = 0;
        let skipped = 0;
        
        // สร้าง quota สำหรับแต่ละบริษัท
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            const companyName = companyDoc.data().name || 'ไม่มีชื่อ';
            
            // ข้ามถ้ามี quota แล้ว
            if (existingQuotas.has(companyId)) {
                console.log(`⏭️  ข้าม: ${companyName} (มี quota แล้ว)`);
                skipped++;
                continue;
            }
            
            // สร้าง quota ใหม่
            const now = new Date();
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            
            const quotaData = {
                plan: 'free',
                status: 'active',
                maxUsers: 3,
                currentUsers: 0,
                maxDocuments: 50,
                currentDocuments: 0,
                documentResetDate: Timestamp.fromDate(nextMonth),
                maxLogos: 1,
                currentLogos: 0,
                allowCustomLogo: false,
                maxStorageMB: 100,
                currentStorageMB: 0,
                features: {
                    multipleProfiles: false,
                    apiAccess: false,
                    customDomain: false,
                    prioritySupport: false,
                    exportPDF: true,
                    exportExcel: false,
                    advancedReports: false,
                    customTemplates: false,
                },
                startDate: Timestamp.fromDate(now),
                createdAt: Timestamp.fromDate(now),
                updatedAt: Timestamp.fromDate(now),
            };
            
            const quotaRef = doc(db, 'companyQuotas', companyId);
            await setDoc(quotaRef, quotaData);
            
            console.log(`✅ สร้างสำเร็จ: ${companyName} - Free Plan`);
            created++;
        }
        
        // สรุปผล
        console.log('\n' + '='.repeat(50));
        console.log('📊 สรุปผลลัพธ์:');
        console.log('='.repeat(50));
        console.log(`✅ สร้างสำเร็จ: ${created} quota`);
        console.log(`⏭️  ข้าม: ${skipped} quota`);
        console.log('='.repeat(50));
        console.log('\n🎉 เสร็จสิ้น! รีเฟรชหน้าเพื่อดูผลลัพธ์');
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error);
    }
}

// เรียกใช้ฟังก์ชัน
createQuotasForAllCompanies();
```

### ขั้นตอนที่ 4: กด Enter และรอ

จะเห็น Output ใน Console:
```
🚀 เริ่มสร้าง Quota...
📋 พบบริษัททั้งหมด: 1 บริษัท
💎 มี Quota อยู่แล้ว: 0 quota
✅ สร้างสำเร็จ: NATURE ESTATE - Free Plan

==================================================
📊 สรุปผลลัพธ์:
==================================================
✅ สร้างสำเร็จ: 1 quota
⏭️  ข้าม: 0 quota
==================================================

🎉 เสร็จสิ้น! รีเฟรชหน้าเพื่อดูผลลัพธ์
```

### ขั้นตอนที่ 5: รีเฟรชหน้า

กด `F5` หรือ `Ctrl+R` (Windows) / `Cmd+R` (Mac)

### ขั้นตอนที่ 6: ตรวจสอบผลลัพธ์

คลิกแท็บ **"💎 โควตา & แผน"** จะเห็น:

```
💎 โควตาและแผนการใช้งาน (1)

บริษัท: NATURE ESTATE
แผน: FREE
สถานะ: ✅ Active
ผู้ใช้: 0 / 3
เอกสาร/เดือน: 0 / 50
โลโก้: 0 / 1
Storage (MB): 0.0 / 100
```

---

## 🎯 สำเร็จ!

ตอนนี้บริษัท NATURE ESTATE มี quota แล้ว และบริษัทใหม่ที่สร้างต่อจากนี้จะได้รับ quota อัตโนมัติ! ✨

---

## 📝 หมายเหตุ

- วิธีนี้ทำงานได้เพราะคุณ Login ด้วยบัญชี Super Admin แล้ว
- Firestore Rules อนุญาตให้ Super Admin สร้าง quota ได้
- ปลอดภัยและไม่ต้องติดตั้งอะไรเพิ่ม

