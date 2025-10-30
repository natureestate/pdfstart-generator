#!/usr/bin/env node

/**
 * Script ย้ายข้อมูลไป Nature Estate (ใช้ร่วมกับ Firebase CLI)
 * 
 * ต้อง Login Firebase CLI ก่อน: firebase login
 * 
 * วิธีรัน:
 * node scripts/migrate-simple.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

// ใช้ Application Default Credentials จาก Firebase CLI
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.HOME + '/.config/firebase/sinanan.ac.th_gmail.com_application_default_credentials.json';

// Initialize Admin SDK with Application Default Credentials
try {
    admin.initializeApp({
        projectId: 'ecertonline-29a67'
    });
    console.log('✅ เชื่อมต่อ Firebase สำเร็จ!');
} catch (error) {
    console.error('❌ ไม่สามารถเชื่อมต่อ Firebase:', error.message);
    console.log('\n💡 แก้ไข: รันคำสั่ง:');
    console.log('   firebase login');
    process.exit(1);
}

const db = admin.firestore();
const TARGET_COMPANY_NAME = "Nature Estate";

// สร้าง readline interface สำหรับรับ input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * ถามคำถาม
 */
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

/**
 * หา User ID จาก Email
 */
async function getUserIdFromEmail() {
    const email = await question('\n📧 กรุณาใส่ Email ที่คุณใช้ Login (sinanan.ac.th@gmail.com): ');
    const emailToUse = email.trim() || 'sinanan.ac.th@gmail.com';
    
    try {
        const userRecord = await admin.auth().getUserByEmail(emailToUse);
        return userRecord.uid;
    } catch (error) {
        console.error(`❌ ไม่พบ User ด้วย email: ${emailToUse}`);
        throw error;
    }
}

/**
 * แสดงสถิติข้อมูล
 */
async function showStats(userId) {
    console.log('\n📊 สถิติข้อมูล:');
    console.log('='.repeat(60));
    
    // นับ Companies
    const companiesSnapshot = await db.collection('companies').get();
    console.log(`📁 Companies: ${companiesSnapshot.size} องค์กร`);
    companiesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name} (ID: ${doc.id})`);
    });
    
    // นับ Delivery Notes
    const deliverySnapshot = await db.collection('deliveryNotes')
        .where('userId', '==', userId)
        .get();
    console.log(`\n📦 Delivery Notes: ${deliverySnapshot.size} รายการ`);
    
    // แบ่งตาม company
    const deliveryByCompany = {};
    deliverySnapshot.docs.forEach(doc => {
        const companyId = doc.data().companyId || 'ไม่มี company';
        deliveryByCompany[companyId] = (deliveryByCompany[companyId] || 0) + 1;
    });
    Object.entries(deliveryByCompany).forEach(([companyId, count]) => {
        console.log(`   - ${companyId}: ${count} รายการ`);
    });
    
    // นับ Warranty Cards
    const warrantySnapshot = await db.collection('warrantyCards')
        .where('userId', '==', userId)
        .get();
    console.log(`\n🛡️  Warranty Cards: ${warrantySnapshot.size} รายการ`);
    
    // แบ่งตาม company
    const warrantyByCompany = {};
    warrantySnapshot.docs.forEach(doc => {
        const companyId = doc.data().companyId || 'ไม่มี company';
        warrantyByCompany[companyId] = (warrantyByCompany[companyId] || 0) + 1;
    });
    Object.entries(warrantyByCompany).forEach(([companyId, count]) => {
        console.log(`   - ${companyId}: ${count} รายการ`);
    });
    
    console.log('='.repeat(60));
}

/**
 * หาหรือสร้าง Nature Estate Company
 */
async function findOrCreateNatureEstate(userId) {
    console.log(`\n🔍 ค้นหา ${TARGET_COMPANY_NAME}...`);
    
    const snapshot = await db.collection('companies')
        .where('name', '==', TARGET_COMPANY_NAME)
        .get();
    
    if (!snapshot.empty) {
        const companyId = snapshot.docs[0].id;
        console.log(`✅ พบ ${TARGET_COMPANY_NAME} แล้ว (ID: ${companyId})`);
        return companyId;
    }
    
    // สร้างใหม่
    console.log(`📝 สร้าง ${TARGET_COMPANY_NAME} ใหม่...`);
    const companyRef = db.collection('companies').doc();
    const companyId = companyRef.id;
    
    await companyRef.set({
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
    
    // เพิ่ม member
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
    
    console.log(`✅ สร้าง ${TARGET_COMPANY_NAME} สำเร็จ!`);
    return companyId;
}

/**
 * ย้ายข้อมูล
 */
async function migrateData(companyId, userId) {
    console.log('\n🔄 เริ่มย้ายข้อมูล...');
    console.log('='.repeat(60));
    
    // ย้าย Delivery Notes
    console.log('\n📦 ย้าย Delivery Notes...');
    const deliverySnapshot = await db.collection('deliveryNotes')
        .where('userId', '==', userId)
        .get();
    
    let deliveryCount = 0;
    const batch = db.batch();
    
    deliverySnapshot.docs.forEach(doc => {
        if (doc.data().companyId !== companyId) {
            batch.update(doc.ref, {
                companyId: companyId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            deliveryCount++;
        }
    });
    
    await batch.commit();
    console.log(`✅ ย้าย ${deliveryCount} รายการ`);
    
    // ย้าย Warranty Cards
    console.log('\n🛡️  ย้าย Warranty Cards...');
    const warrantySnapshot = await db.collection('warrantyCards')
        .where('userId', '==', userId)
        .get();
    
    let warrantyCount = 0;
    const batch2 = db.batch();
    
    warrantySnapshot.docs.forEach(doc => {
        if (doc.data().companyId !== companyId) {
            batch2.update(doc.ref, {
                companyId: companyId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            warrantyCount++;
        }
    });
    
    await batch2.commit();
    console.log(`✅ ย้าย ${warrantyCount} รายการ`);
    
    return { deliveryCount, warrantyCount };
}

/**
 * Main Function
 */
async function main() {
    console.log('\n🚀 Migration Script - ย้ายข้อมูลไป Nature Estate');
    console.log('='.repeat(60));
    
    try {
        // 1. หา User ID
        const userId = await getUserIdFromEmail();
        console.log(`✅ User ID: ${userId}`);
        
        // 2. แสดงสถิติก่อนย้าย
        console.log('\n📊 ก่อนย้าย:');
        await showStats(userId);
        
        // 3. ยืนยัน
        const confirm = await question('\n⚠️  ต้องการย้ายข้อมูลทั้งหมดไป Nature Estate? (yes/no): ');
        if (confirm.toLowerCase() !== 'yes') {
            console.log('❌ ยกเลิกการย้าย');
            rl.close();
            process.exit(0);
        }
        
        // 4. หา/สร้าง Nature Estate
        const companyId = await findOrCreateNatureEstate(userId);
        
        // 5. ย้ายข้อมูล
        const { deliveryCount, warrantyCount } = await migrateData(companyId, userId);
        
        // 6. แสดงสถิติหลังย้าย
        console.log('\n📊 หลังย้าย:');
        await showStats(userId);
        
        // 7. สรุป
        console.log('\n' + '='.repeat(60));
        console.log('✅ Migration เสร็จสิ้น!');
        console.log(`   📦 ย้าย Delivery Notes: ${deliveryCount} รายการ`);
        console.log(`   🛡️  ย้าย Warranty Cards: ${warrantyCount} รายการ`);
        console.log(`   🎯 ไปยัง: ${TARGET_COMPANY_NAME}`);
        console.log('='.repeat(60));
        
        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ เกิดข้อผิดพลาด:', error);
        rl.close();
        process.exit(1);
    }
}

// Run
main();

