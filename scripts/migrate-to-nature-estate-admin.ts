/**
 * Script สำหรับย้ายข้อมูล Firestore ทั้งหมดมาอยู่ใน Nature Estate Company
 * (ใช้ Firebase Admin SDK)
 * 
 * วิธีรัน:
 * 1. ดาวน์โหลด Service Account Key จาก Firebase Console
 * 2. วางไฟล์ไว้ที่ scripts/serviceAccountKey.json
 * 3. รัน: USER_ID=your-user-id npx ts-node scripts/migrate-to-nature-estate-admin.ts
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// กำหนดค่า User ID จาก environment variable
const TARGET_USER_ID = process.env.USER_ID || '';
const TARGET_COMPANY_NAME = "Nature Estate";

// ตรวจสอบว่ามี Service Account Key หรือไม่
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ ไม่พบไฟล์ serviceAccountKey.json');
    console.log('\n📝 วิธีดาวน์โหลด Service Account Key:');
    console.log('1. ไปที่ https://console.firebase.google.com/');
    console.log('2. เลือก Project: ecertonline-29a67');
    console.log('3. ไปที่ Project Settings > Service accounts');
    console.log('4. คลิก "Generate new private key"');
    console.log('5. บันทึกไฟล์เป็น "serviceAccountKey.json" ใน directory scripts/');
    process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://ecertonline-29a67.firebaseio.com`
});

const db = admin.firestore();

/**
 * หาหรือสร้าง Nature Estate Company
 */
async function findOrCreateNatureEstateCompany(userId: string): Promise<string> {
    console.log('\n🔍 ค้นหา Nature Estate Company...');
    
    // ค้นหา company ที่มีอยู่แล้ว
    const querySnapshot = await db.collection('companies')
        .where('name', '==', TARGET_COMPANY_NAME)
        .get();
    
    if (!querySnapshot.empty) {
        const companyDoc = querySnapshot.docs[0];
        console.log(`✅ พบ ${TARGET_COMPANY_NAME} แล้ว (ID: ${companyDoc.id})`);
        return companyDoc.id;
    }
    
    // สร้าง company ใหม่
    console.log(`📝 ไม่พบ ${TARGET_COMPANY_NAME}, กำลังสร้างใหม่...`);
    const newCompanyRef = db.collection('companies').doc();
    const companyId = newCompanyRef.id;
    
    await newCompanyRef.set({
        name: TARGET_COMPANY_NAME,
        address: '',
        userId: userId,
        logoUrl: null,
        logoType: 'default',
        defaultLogoUrl: null,
        memberCount: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // เพิ่ม admin member
    const memberRef = db.collection('companyMembers').doc();
    const userRecord = await admin.auth().getUser(userId);
    
    await memberRef.set({
        companyId: companyId,
        userId: userId,
        email: userRecord.email || '',
        phoneNumber: userRecord.phoneNumber || null,
        displayName: userRecord.displayName || 'Admin',
        role: 'admin',
        status: 'active',
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`✅ สร้าง ${TARGET_COMPANY_NAME} สำเร็จ (ID: ${companyId})`);
    return companyId;
}

/**
 * ย้ายข้อมูล Delivery Notes
 */
async function migrateDeliveryNotes(companyId: string, userId: string): Promise<number> {
    console.log('\n📦 กำลังย้าย Delivery Notes...');
    
    const snapshot = await db.collection('deliveryNotes')
        .where('userId', '==', userId)
        .get();
    
    let migratedCount = 0;
    const batch = db.batch();
    let batchCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // ข้าม document ที่มี companyId เป็น Nature Estate อยู่แล้ว
        if (data.companyId === companyId) {
            console.log(`⏭️  ${docSnapshot.id} อยู่ใน Nature Estate อยู่แล้ว`);
            continue;
        }
        
        // อัปเดต companyId
        batch.update(docSnapshot.ref, {
            companyId: companyId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`✅ ย้าย Delivery Note: ${docSnapshot.id} (${data.docNumber})`);
        migratedCount++;
        batchCount++;
        
        // Firestore batch limit is 500 operations
        if (batchCount >= 450) {
            await batch.commit();
            batchCount = 0;
        }
    }
    
    // Commit remaining batch
    if (batchCount > 0) {
        await batch.commit();
    }
    
    console.log(`✅ ย้าย Delivery Notes เรียบร้อย: ${migratedCount} รายการ`);
    return migratedCount;
}

/**
 * ย้ายข้อมูล Warranty Cards
 */
async function migrateWarrantyCards(companyId: string, userId: string): Promise<number> {
    console.log('\n🛡️  กำลังย้าย Warranty Cards...');
    
    const snapshot = await db.collection('warrantyCards')
        .where('userId', '==', userId)
        .get();
    
    let migratedCount = 0;
    const batch = db.batch();
    let batchCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // ข้าม document ที่มี companyId เป็น Nature Estate อยู่แล้ว
        if (data.companyId === companyId) {
            console.log(`⏭️  ${docSnapshot.id} อยู่ใน Nature Estate อยู่แล้ว`);
            continue;
        }
        
        // อัปเดต companyId
        batch.update(docSnapshot.ref, {
            companyId: companyId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`✅ ย้าย Warranty Card: ${docSnapshot.id} (${data.warrantyNumber || data.houseModel})`);
        migratedCount++;
        batchCount++;
        
        // Firestore batch limit is 500 operations
        if (batchCount >= 450) {
            await batch.commit();
            batchCount = 0;
        }
    }
    
    // Commit remaining batch
    if (batchCount > 0) {
        await batch.commit();
    }
    
    console.log(`✅ ย้าย Warranty Cards เรียบร้อย: ${migratedCount} รายการ`);
    return migratedCount;
}

/**
 * แสดงสถิติข้อมูลปัจจุบัน
 */
async function showCurrentStats(userId: string): Promise<void> {
    console.log('\n📊 สถิติข้อมูลปัจจุบัน:');
    
    // นับ Companies
    const companiesSnapshot = await db.collection('companies').get();
    console.log(`   📁 Companies: ${companiesSnapshot.size} องค์กร`);
    
    companiesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`      - ${data.name} (ID: ${doc.id}, Members: ${data.memberCount || 0})`);
    });
    
    // นับ Delivery Notes
    const deliveryNotesSnapshot = await db.collection('deliveryNotes')
        .where('userId', '==', userId)
        .get();
    console.log(`   📦 Delivery Notes: ${deliveryNotesSnapshot.size} รายการ`);
    
    // แสดงรายละเอียด delivery notes แบ่งตาม company
    const deliveryByCompany: { [key: string]: number } = {};
    deliveryNotesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const companyId = data.companyId || 'ไม่มี company';
        deliveryByCompany[companyId] = (deliveryByCompany[companyId] || 0) + 1;
    });
    Object.entries(deliveryByCompany).forEach(([companyId, count]) => {
        console.log(`      - ${companyId}: ${count} รายการ`);
    });
    
    // นับ Warranty Cards
    const warrantyCardsSnapshot = await db.collection('warrantyCards')
        .where('userId', '==', userId)
        .get();
    console.log(`   🛡️  Warranty Cards: ${warrantyCardsSnapshot.size} รายการ`);
    
    // แสดงรายละเอียด warranty cards แบ่งตาม company
    const warrantyByCompany: { [key: string]: number } = {};
    warrantyCardsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const companyId = data.companyId || 'ไม่มี company';
        warrantyByCompany[companyId] = (warrantyByCompany[companyId] || 0) + 1;
    });
    Object.entries(warrantyByCompany).forEach(([companyId, count]) => {
        console.log(`      - ${companyId}: ${count} รายการ`);
    });
    
    // นับ Company Members
    const membersSnapshot = await db.collection('companyMembers').get();
    console.log(`   👥 Company Members: ${membersSnapshot.size} รายการ`);
}

/**
 * หา User ID จาก Email
 */
async function findUserIdByEmail(email: string): Promise<string | null> {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        return userRecord.uid;
    } catch (error) {
        console.error(`❌ ไม่พบ User ด้วย email: ${email}`);
        return null;
    }
}

/**
 * Main Migration Function
 */
async function main() {
    console.log('🚀 เริ่มต้น Migration Script (Firebase Admin SDK)');
    console.log('=' .repeat(60));
    
    try {
        // ถ้าไม่มี USER_ID ให้ถามผู้ใช้
        if (!TARGET_USER_ID && !process.env.USER_EMAIL) {
            console.error('\n❌ กรุณาระบุ USER_ID หรือ USER_EMAIL');
            console.log('\nตัวอย่าง:');
            console.log('USER_ID=abc123xyz npx ts-node scripts/migrate-to-nature-estate-admin.ts');
            console.log('หรือ');
            console.log('USER_EMAIL=your@email.com npx ts-node scripts/migrate-to-nature-estate-admin.ts');
            process.exit(1);
        }
        
        let userId = TARGET_USER_ID;
        
        // ถ้าใช้ EMAIL แทน USER_ID
        if (process.env.USER_EMAIL) {
            console.log(`\n🔍 ค้นหา User ID จาก Email: ${process.env.USER_EMAIL}`);
            const foundUserId = await findUserIdByEmail(process.env.USER_EMAIL);
            if (foundUserId) {
                userId = foundUserId;
                console.log(`✅ พบ User ID: ${userId}`);
            } else {
                process.exit(1);
            }
        }
        
        console.log(`\n🎯 กำลัง Migrate ข้อมูลของ User ID: ${userId}`);
        
        // แสดงสถิติก่อน migration
        await showCurrentStats(userId);
        
        // หา/สร้าง Nature Estate Company
        const natureEstateId = await findOrCreateNatureEstateCompany(userId);
        
        // ยืนยันก่อน migration
        console.log('\n⚠️  คุณต้องการย้ายข้อมูลทั้งหมดไปยัง Nature Estate หรือไม่?');
        console.log('   กด Ctrl+C เพื่อยกเลิก หรือรอ 5 วินาทีเพื่อดำเนินการต่อ...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // เริ่ม Migration
        console.log('\n🔄 เริ่มต้น Migration...');
        console.log('=' .repeat(60));
        
        const deliveryCount = await migrateDeliveryNotes(natureEstateId, userId);
        const warrantyCount = await migrateWarrantyCards(natureEstateId, userId);
        
        // แสดงสถิติหลัง migration
        console.log('\n' + '=' .repeat(60));
        await showCurrentStats(userId);
        
        // สรุปผล
        console.log('\n' + '=' .repeat(60));
        console.log('✅ Migration เสร็จสิ้น!');
        console.log(`   📦 ย้าย Delivery Notes: ${deliveryCount} รายการ`);
        console.log(`   🛡️  ย้าย Warranty Cards: ${warrantyCount} รายการ`);
        console.log(`   🎯 ปลายทาง: ${TARGET_COMPANY_NAME} (ID: ${natureEstateId})`);
        console.log('=' .repeat(60));
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ เกิดข้อผิดพลาด:', error);
        process.exit(1);
    }
}

// เรียกใช้ main function
main();

