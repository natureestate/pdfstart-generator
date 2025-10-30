#!/usr/bin/env node

/**
 * Script ตรวจสอบข้อมูล Firestore (ใช้ Firebase CLI)
 * 
 * วิธีรัน:
 * node scripts/check-data.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBy4f-C66l03f4-ODOO_aGyseaIDmDb7tk",
    authDomain: "ecertonline-29a67.firebaseapp.com",
    projectId: "ecertonline-29a67",
    storageBucket: "ecertonline-29a67.firebasestorage.app",
    messagingSenderId: "457246107908",
    appId: "1:457246107908:web:1008539ce20637935c8851"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * รอให้ user login
 */
async function waitForAuth() {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            if (user) {
                resolve(user);
            } else {
                reject(new Error('กรุณา Login ก่อน'));
            }
        }, reject);
    });
}

/**
 * ตรวจสอบข้อมูล Companies
 */
async function checkCompanies() {
    console.log('\n📁 ตรวจสอบ Companies:');
    console.log('=' .repeat(80));
    
    const snapshot = await getDocs(collection(db, 'companies'));
    
    console.log(`พบทั้งหมด: ${snapshot.size} องค์กร\n`);
    
    snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.name}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Address: ${data.address || 'ไม่ระบุ'}`);
        console.log(`   User ID: ${data.userId}`);
        console.log(`   Members: ${data.memberCount || 0}`);
        console.log(`   Created: ${data.createdAt?.toDate().toLocaleString('th-TH') || 'ไม่ระบุ'}`);
        console.log('');
    });
}

/**
 * ตรวจสอบข้อมูล Delivery Notes
 */
async function checkDeliveryNotes(userId) {
    console.log('\n📦 ตรวจสอบ Delivery Notes:');
    console.log('=' .repeat(80));
    
    const q = query(collection(db, 'deliveryNotes'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    console.log(`พบทั้งหมด: ${snapshot.size} รายการ\n`);
    
    // จัดกลุ่มตาม companyId
    const notesByCompany = {};
    
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
        
        notes.slice(0, 3).forEach((note, index) => {
            console.log(`   ${index + 1}. ${note.docNumber}`);
            console.log(`      โครงการ: ${note.project || 'ไม่ระบุ'}`);
            console.log(`      จาก: ${note.fromCompany}`);
            console.log(`      ถึง: ${note.toCompany}`);
            console.log('');
        });
        
        if (notes.length > 3) {
            console.log(`   ... และอีก ${notes.length - 3} รายการ\n`);
        }
    }
}

/**
 * ตรวจสอบข้อมูล Warranty Cards
 */
async function checkWarrantyCards(userId) {
    console.log('\n🛡️  ตรวจสอบ Warranty Cards:');
    console.log('=' .repeat(80));
    
    const q = query(collection(db, 'warrantyCards'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    console.log(`พบทั้งหมด: ${snapshot.size} รายการ\n`);
    
    // จัดกลุ่มตาม companyId
    const cardsByCompany = {};
    
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
        
        cards.slice(0, 3).forEach((card, index) => {
            console.log(`   ${index + 1}. ${card.warrantyNumber || card.houseModel || 'ไม่ระบุ'}`);
            console.log(`      บริการ: ${card.serviceName || 'ไม่ระบุ'}`);
            console.log(`      ลูกค้า: ${card.customerName || 'ไม่ระบุ'}`);
            console.log('');
        });
        
        if (cards.length > 3) {
            console.log(`   ... และอีก ${cards.length - 3} รายการ\n`);
        }
    }
}

/**
 * แสดงสรุปข้อมูล
 */
async function showSummary(userId) {
    console.log('\n📊 สรุปข้อมูลทั้งหมด:');
    console.log('=' .repeat(80));
    
    const companiesCount = (await getDocs(collection(db, 'companies'))).size;
    const deliveryNotesCount = (await getDocs(query(collection(db, 'deliveryNotes'), where('userId', '==', userId)))).size;
    const warrantyCardsCount = (await getDocs(query(collection(db, 'warrantyCards'), where('userId', '==', userId)))).size;
    
    console.log(`📁 Companies: ${companiesCount} องค์กร`);
    console.log(`📦 Delivery Notes: ${deliveryNotesCount} รายการ`);
    console.log(`🛡️  Warranty Cards: ${warrantyCardsCount} รายการ`);
    console.log('=' .repeat(80));
}

/**
 * Main Function
 */
async function main() {
    console.log('🔍 ตรวจสอบข้อมูล Firestore');
    console.log('=' .repeat(80));
    console.log('\n⚠️  หมายเหตุ: Script นี้จะใช้ User ที่ Login อยู่ในระบบ');
    console.log('ถ้ายังไม่ได้ Login กรุณาเปิดแอปใน Browser และ Login ก่อน\n');
    
    try {
        console.log('⏳ รอ Authentication...');
        const user = await waitForAuth();
        
        console.log(`✅ Login แล้ว: ${user.email}`);
        console.log(`   User ID: ${user.uid}\n`);
        
        await showSummary(user.uid);
        await checkCompanies();
        await checkDeliveryNotes(user.uid);
        await checkWarrantyCards(user.uid);
        
        console.log('\n✅ ตรวจสอบข้อมูลเสร็จสิ้น!');
        console.log('\n💡 ทิป: ถ้าต้องการย้ายข้อมูล รันคำสั่ง:');
        console.log('   node scripts/migrate-data.js');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ เกิดข้อผิดพลาด:', error.message);
        console.log('\n💡 แก้ไข: เปิดแอปใน Browser และ Login ด้วย Google ก่อน');
        console.log('   URL: http://localhost:3000');
        process.exit(1);
    }
}

// เรียกใช้ main function
main();

