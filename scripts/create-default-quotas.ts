/**
 * Migration Script: สร้าง Default Quota สำหรับบริษัทที่มีอยู่แล้ว
 * 
 * วิธีใช้:
 * 1. ติดตั้ง ts-node: npm install -g ts-node
 * 2. รันคำสั่ง: ts-node scripts/create-default-quotas.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';

// Firebase Configuration (คัดลอกจาก firebase.config.ts)
const firebaseConfig = {
    apiKey: "AIzaSyCpnW-q0MYKNfq_FcmLz_gG0uZa1fT-Cx8",
    authDomain: "pdfexportfordeliveryandcert.firebaseapp.com",
    projectId: "pdfexportfordeliveryandcert",
    storageBucket: "pdfexportfordeliveryandcert.firebasestorage.app",
    messagingSenderId: "906732652542",
    appId: "1:906732652542:web:9fd2bb5f0c9ba14e75c8d1",
    measurementId: "G-JZ4S0NRBR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Default Quota สำหรับ Free Plan
 */
const createDefaultQuota = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
        plan: 'free',
        status: 'active',
        
        // โควตาผู้ใช้งาน
        maxUsers: 3,
        currentUsers: 0,
        
        // โควตาเอกสาร
        maxDocuments: 50,
        currentDocuments: 0,
        documentResetDate: Timestamp.fromDate(nextMonth),
        
        // โควตาโลโก้
        maxLogos: 1,
        currentLogos: 0,
        allowCustomLogo: false,
        
        // โควตา Storage
        maxStorageMB: 100,
        currentStorageMB: 0,
        
        // Features
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
        
        // ข้อมูลการสมัคร
        startDate: Timestamp.fromDate(now),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
    };
};

/**
 * Main function
 */
const main = async () => {
    try {
        console.log('🚀 เริ่มต้น Migration: สร้าง Default Quota สำหรับบริษัททั้งหมด\n');

        // 1. ดึงรายการบริษัททั้งหมด
        console.log('📋 กำลังดึงรายการบริษัททั้งหมด...');
        const companiesRef = collection(db, 'companies');
        const companiesSnapshot = await getDocs(companiesRef);
        
        const totalCompanies = companiesSnapshot.size;
        console.log(`✅ พบบริษัททั้งหมด: ${totalCompanies} บริษัท\n`);

        if (totalCompanies === 0) {
            console.log('⚠️  ไม่พบบริษัทในระบบ');
            return;
        }

        // 2. ตรวจสอบ quota ที่มีอยู่แล้ว
        console.log('🔍 กำลังตรวจสอบ quota ที่มีอยู่แล้ว...');
        const quotasRef = collection(db, 'companyQuotas');
        const quotasSnapshot = await getDocs(quotasRef);
        const existingQuotaIds = new Set(quotasSnapshot.docs.map(doc => doc.id));
        console.log(`📊 พบ quota ที่มีอยู่แล้ว: ${existingQuotaIds.size} quota\n`);

        // 3. สร้าง quota สำหรับบริษัทที่ยังไม่มี
        let created = 0;
        let skipped = 0;
        let errors = 0;

        console.log('💾 กำลังสร้าง quota...\n');

        for (const companyDoc of companiesSnapshot.docs) {
            const companyId = companyDoc.id;
            const companyData = companyDoc.data();
            const companyName = companyData.name || 'ไม่มีชื่อ';

            // ตรวจสอบว่ามี quota อยู่แล้วหรือไม่
            if (existingQuotaIds.has(companyId)) {
                console.log(`⏭️  ข้าม: ${companyName} (${companyId}) - มี quota อยู่แล้ว`);
                skipped++;
                continue;
            }

            try {
                // สร้าง quota ใหม่
                const quotaData = createDefaultQuota();
                const quotaRef = doc(db, 'companyQuotas', companyId);
                await setDoc(quotaRef, quotaData);

                console.log(`✅ สร้างสำเร็จ: ${companyName} (${companyId}) - Free Plan`);
                created++;
            } catch (error) {
                console.error(`❌ ล้มเหลว: ${companyName} (${companyId})`, error);
                errors++;
            }
        }

        // 4. สรุปผลลัพธ์
        console.log('\n' + '='.repeat(50));
        console.log('📊 สรุปผลลัพธ์:');
        console.log('='.repeat(50));
        console.log(`📦 บริษัททั้งหมด:     ${totalCompanies} บริษัท`);
        console.log(`✅ สร้างสำเร็จ:        ${created} quota`);
        console.log(`⏭️  ข้าม (มีอยู่แล้ว): ${skipped} quota`);
        console.log(`❌ ล้มเหลว:           ${errors} quota`);
        console.log('='.repeat(50));

        if (created > 0) {
            console.log('\n🎉 Migration สำเร็จ! ตอนนี้สามารถดู quota ใน Super Admin Dashboard ได้แล้ว');
        } else if (skipped === totalCompanies) {
            console.log('\n✨ ทุกบริษัทมี quota อยู่แล้ว ไม่ต้อง migrate');
        } else {
            console.log('\n⚠️  Migration เสร็จสิ้น แต่มีบางรายการล้มเหลว กรุณาตรวจสอบ');
        }

    } catch (error) {
        console.error('\n❌ เกิดข้อผิดพลาดในการ migrate:', error);
        process.exit(1);
    }
};

// Run the script
main()
    .then(() => {
        console.log('\n✅ Script เสร็จสิ้น');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script ล้มเหลว:', error);
        process.exit(1);
    });

