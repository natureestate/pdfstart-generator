/**
 * Script สำหรับตรวจสอบข้อมูลใน Firestore (ใช้ Firebase Admin SDK)
 * 
 * วิธีรัน:
 * 1. ดาวน์โหลด Service Account Key จาก Firebase Console
 * 2. วางไฟล์ไว้ที่ scripts/serviceAccountKey.json
 * 3. รัน: USER_ID=your-user-id npx ts-node scripts/check-firestore-admin.ts
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// กำหนดค่า User ID จาก environment variable
const TARGET_USER_ID = process.env.USER_ID || '';

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
    console.log('\nหรือรันคำสั่ง:');
    console.log('firebase login');
    console.log('firebase projects:list');
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
 * ตรวจสอบข้อมูล Companies
 */
async function checkCompanies(): Promise<void> {
    console.log('\n📁 ตรวจสอบ Companies:');
    console.log('=' .repeat(80));
    
    const snapshot = await db.collection('companies').get();
    
    console.log(`พบทั้งหมด: ${snapshot.size} องค์กร\n`);
    
    snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.name}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Address: ${data.address || 'ไม่ระบุ'}`);
        console.log(`   User ID: ${data.userId}`);
        console.log(`   Members: ${data.memberCount || 0}`);
        console.log(`   Logo Type: ${data.logoType || 'ไม่ระบุ'}`);
        console.log(`   Created: ${data.createdAt?.toDate().toLocaleString('th-TH') || 'ไม่ระบุ'}`);
        console.log('');
    });
}

/**
 * ตรวจสอบข้อมูล Company Members
 */
async function checkCompanyMembers(): Promise<void> {
    console.log('\n👥 ตรวจสอบ Company Members:');
    console.log('=' .repeat(80));
    
    const snapshot = await db.collection('companyMembers').get();
    
    console.log(`พบทั้งหมด: ${snapshot.size} สมาชิก\n`);
    
    // จัดกลุ่มตาม company
    const membersByCompany: { [key: string]: any[] } = {};
    
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!membersByCompany[data.companyId]) {
            membersByCompany[data.companyId] = [];
        }
        membersByCompany[data.companyId].push({
            id: doc.id,
            ...data
        });
    });
    
    // แสดงผล
    for (const [companyId, members] of Object.entries(membersByCompany)) {
        console.log(`Company ID: ${companyId}`);
        console.log(`จำนวนสมาชิก: ${members.length}\n`);
        
        members.forEach((member, index) => {
            console.log(`   ${index + 1}. ${member.displayName || member.email}`);
            console.log(`      Email: ${member.email}`);
            console.log(`      Role: ${member.role}`);
            console.log(`      Status: ${member.status}`);
            console.log(`      User ID: ${member.userId}`);
            console.log('');
        });
    }
}

/**
 * ตรวจสอบข้อมูล Delivery Notes
 */
async function checkDeliveryNotes(userId: string): Promise<void> {
    console.log('\n📦 ตรวจสอบ Delivery Notes:');
    console.log('=' .repeat(80));
    
    const snapshot = await db.collection('deliveryNotes')
        .where('userId', '==', userId)
        .get();
    
    console.log(`พบทั้งหมด: ${snapshot.size} รายการ\n`);
    
    // จัดกลุ่มตาม companyId
    const notesByCompany: { [key: string]: any[] } = {};
    
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const companyId = data.companyId || 'ไม่มี company';
        
        if (!notesByCompany[companyId]) {
            notesByCompany[companyId] = [];
        }
        notesByCompany[companyId].push({
            id: doc.id,
            ...data
        });
    });
    
    // แสดงผล
    for (const [companyId, notes] of Object.entries(notesByCompany)) {
        console.log(`Company ID: ${companyId}`);
        console.log(`จำนวน: ${notes.length} รายการ\n`);
        
        notes.slice(0, 5).forEach((note, index) => {
            console.log(`   ${index + 1}. ${note.docNumber}`);
            console.log(`      โครงการ: ${note.project || 'ไม่ระบุ'}`);
            console.log(`      จาก: ${note.fromCompany}`);
            console.log(`      ถึง: ${note.toCompany}`);
            console.log(`      วันที่: ${note.date?.toDate().toLocaleDateString('th-TH') || 'ไม่ระบุ'}`);
            console.log('');
        });
        
        if (notes.length > 5) {
            console.log(`   ... และอีก ${notes.length - 5} รายการ\n`);
        }
    }
}

/**
 * ตรวจสอบข้อมูล Warranty Cards
 */
async function checkWarrantyCards(userId: string): Promise<void> {
    console.log('\n🛡️  ตรวจสอบ Warranty Cards:');
    console.log('=' .repeat(80));
    
    const snapshot = await db.collection('warrantyCards')
        .where('userId', '==', userId)
        .get();
    
    console.log(`พบทั้งหมด: ${snapshot.size} รายการ\n`);
    
    // จัดกลุ่มตาม companyId
    const cardsByCompany: { [key: string]: any[] } = {};
    
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const companyId = data.companyId || 'ไม่มี company';
        
        if (!cardsByCompany[companyId]) {
            cardsByCompany[companyId] = [];
        }
        cardsByCompany[companyId].push({
            id: doc.id,
            ...data
        });
    });
    
    // แสดงผล
    for (const [companyId, cards] of Object.entries(cardsByCompany)) {
        console.log(`Company ID: ${companyId}`);
        console.log(`จำนวน: ${cards.length} รายการ\n`);
        
        cards.slice(0, 5).forEach((card, index) => {
            console.log(`   ${index + 1}. ${card.warrantyNumber || card.houseModel || 'ไม่ระบุ'}`);
            console.log(`      บริการ: ${card.serviceName || 'ไม่ระบุ'}`);
            console.log(`      โครงการ: ${card.projectName || 'ไม่ระบุ'}`);
            console.log(`      ลูกค้า: ${card.customerName || 'ไม่ระบุ'}`);
            console.log(`      ระยะรับประกัน: ${card.warrantyPeriod || 'ไม่ระบุ'}`);
            console.log('');
        });
        
        if (cards.length > 5) {
            console.log(`   ... และอีก ${cards.length - 5} รายการ\n`);
        }
    }
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
 * แสดงรายการ Users ทั้งหมด
 */
async function listAllUsers(): Promise<void> {
    console.log('\n👤 รายการ Users ทั้งหมด:');
    console.log('=' .repeat(80));
    
    const listUsersResult = await admin.auth().listUsers(10);
    
    listUsersResult.users.forEach((userRecord, index) => {
        console.log(`${index + 1}. ${userRecord.email || userRecord.phoneNumber}`);
        console.log(`   User ID: ${userRecord.uid}`);
        console.log(`   Display Name: ${userRecord.displayName || 'ไม่ระบุ'}`);
        console.log(`   Provider: ${userRecord.providerData.map(p => p.providerId).join(', ')}`);
        console.log(`   Created: ${userRecord.metadata.creationTime}`);
        console.log('');
    });
}

/**
 * แสดงสรุปข้อมูลทั้งหมด
 */
async function showSummary(userId: string): Promise<void> {
    console.log('\n📊 สรุปข้อมูลทั้งหมด:');
    console.log('=' .repeat(80));
    
    // นับจำนวนแต่ละ collection
    const companiesCount = (await db.collection('companies').get()).size;
    const membersCount = (await db.collection('companyMembers').get()).size;
    
    const deliveryNotesCount = (await db.collection('deliveryNotes')
        .where('userId', '==', userId)
        .get()).size;
    
    const warrantyCardsCount = (await db.collection('warrantyCards')
        .where('userId', '==', userId)
        .get()).size;
    
    console.log(`📁 Companies: ${companiesCount} องค์กร`);
    console.log(`👥 Company Members: ${membersCount} สมาชิก`);
    console.log(`📦 Delivery Notes: ${deliveryNotesCount} รายการ (ของ User นี้)`);
    console.log(`🛡️  Warranty Cards: ${warrantyCardsCount} รายการ (ของ User นี้)`);
    console.log('=' .repeat(80));
}

/**
 * Main Function
 */
async function main() {
    console.log('🔍 ตรวจสอบข้อมูล Firestore (Firebase Admin SDK)');
    console.log('=' .repeat(80));
    
    try {
        // แสดงรายการ Users
        await listAllUsers();
        
        // ถ้าไม่มี USER_ID ให้ถามผู้ใช้
        if (!TARGET_USER_ID) {
            console.error('\n❌ กรุณาระบุ USER_ID');
            console.log('\nตัวอย่าง:');
            console.log('USER_ID=abc123xyz npx ts-node scripts/check-firestore-admin.ts');
            console.log('\nหรือถ้ารู้ Email:');
            console.log('USER_EMAIL=your@email.com npx ts-node scripts/check-firestore-admin.ts');
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
        
        console.log(`\n🎯 กำลังตรวจสอบข้อมูลของ User ID: ${userId}`);
        
        // ตรวจสอบข้อมูลแต่ละส่วน
        await showSummary(userId);
        await checkCompanies();
        await checkCompanyMembers();
        await checkDeliveryNotes(userId);
        await checkWarrantyCards(userId);
        
        console.log('\n✅ ตรวจสอบข้อมูลเสร็จสิ้น!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ เกิดข้อผิดพลาด:', error);
        process.exit(1);
    }
}

// เรียกใช้ main function
main();

