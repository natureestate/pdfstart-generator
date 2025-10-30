/**
 * Script สำหรับย้ายข้อมูล Firestore ทั้งหมดมาอยู่ใน Nature Estate Company
 * 
 * การทำงาน:
 * 1. ค้นหา Nature Estate company หรือสร้างใหม่ถ้ายังไม่มี
 * 2. ย้ายข้อมูล deliveryNotes ทั้งหมดมาใส่ companyId ของ Nature Estate
 * 3. ย้ายข้อมูล warrantyCards ทั้งหมดมาใส่ companyId ของ Nature Estate
 * 
 * วิธีรัน:
 * npx ts-node scripts/migrate-to-nature-estate.ts
 */

import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    updateDoc,
    query,
    where,
    Timestamp,
    setDoc
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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

// ชื่อ Company ที่ต้องการย้ายข้อมูลไป
const TARGET_COMPANY_NAME = "Nature Estate";

/**
 * หาหรือสร้าง Nature Estate Company
 */
async function findOrCreateNatureEstateCompany(userId: string): Promise<string> {
    console.log('\n🔍 ค้นหา Nature Estate Company...');
    
    // ค้นหา company ที่มีอยู่แล้ว
    const companiesRef = collection(db, 'companies');
    const q = query(companiesRef, where('name', '==', TARGET_COMPANY_NAME));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        const companyDoc = querySnapshot.docs[0];
        console.log(`✅ พบ ${TARGET_COMPANY_NAME} แล้ว (ID: ${companyDoc.id})`);
        return companyDoc.id;
    }
    
    // สร้าง company ใหม่
    console.log(`📝 ไม่พบ ${TARGET_COMPANY_NAME}, กำลังสร้างใหม่...`);
    const newCompanyRef = doc(collection(db, 'companies'));
    const companyId = newCompanyRef.id;
    
    await setDoc(newCompanyRef, {
        name: TARGET_COMPANY_NAME,
        address: '',
        userId: userId,
        logoUrl: null,
        logoType: 'default',
        defaultLogoUrl: null,
        memberCount: 1,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    
    // เพิ่ม admin member
    const memberRef = doc(collection(db, 'companyMembers'));
    await setDoc(memberRef, {
        companyId: companyId,
        userId: userId,
        email: auth.currentUser?.email || '',
        phoneNumber: auth.currentUser?.phoneNumber || null,
        displayName: auth.currentUser?.displayName || 'Admin',
        role: 'admin',
        status: 'active',
        joinedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    
    console.log(`✅ สร้าง ${TARGET_COMPANY_NAME} สำเร็จ (ID: ${companyId})`);
    return companyId;
}

/**
 * ย้ายข้อมูล Delivery Notes
 */
async function migrateDeliveryNotes(companyId: string, userId: string): Promise<number> {
    console.log('\n📦 กำลังย้าย Delivery Notes...');
    
    const deliveryNotesRef = collection(db, 'deliveryNotes');
    const q = query(deliveryNotesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    let migratedCount = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        
        // ข้าม document ที่มี companyId เป็น Nature Estate อยู่แล้ว
        if (data.companyId === companyId) {
            console.log(`⏭️  ${docSnapshot.id} อยู่ใน Nature Estate อยู่แล้ว`);
            continue;
        }
        
        // อัปเดต companyId
        await updateDoc(doc(db, 'deliveryNotes', docSnapshot.id), {
            companyId: companyId,
            updatedAt: Timestamp.now(),
        });
        
        console.log(`✅ ย้าย Delivery Note: ${docSnapshot.id} (${data.docNumber})`);
        migratedCount++;
    }
    
    console.log(`✅ ย้าย Delivery Notes เรียบร้อย: ${migratedCount} รายการ`);
    return migratedCount;
}

/**
 * ย้ายข้อมูล Warranty Cards
 */
async function migrateWarrantyCards(companyId: string, userId: string): Promise<number> {
    console.log('\n🛡️  กำลังย้าย Warranty Cards...');
    
    const warrantyCardsRef = collection(db, 'warrantyCards');
    const q = query(warrantyCardsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    let migratedCount = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        
        // ข้าม document ที่มี companyId เป็น Nature Estate อยู่แล้ว
        if (data.companyId === companyId) {
            console.log(`⏭️  ${docSnapshot.id} อยู่ใน Nature Estate อยู่แล้ว`);
            continue;
        }
        
        // อัปเดต companyId
        await updateDoc(doc(db, 'warrantyCards', docSnapshot.id), {
            companyId: companyId,
            updatedAt: Timestamp.now(),
        });
        
        console.log(`✅ ย้าย Warranty Card: ${docSnapshot.id} (${data.warrantyNumber || data.houseModel})`);
        migratedCount++;
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
    const companiesRef = collection(db, 'companies');
    const companiesSnapshot = await getDocs(companiesRef);
    console.log(`   📁 Companies: ${companiesSnapshot.size} องค์กร`);
    
    companiesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`      - ${data.name} (ID: ${doc.id}, Members: ${data.memberCount || 0})`);
    });
    
    // นับ Delivery Notes
    const deliveryNotesRef = collection(db, 'deliveryNotes');
    const deliveryNotesQuery = query(deliveryNotesRef, where('userId', '==', userId));
    const deliveryNotesSnapshot = await getDocs(deliveryNotesQuery);
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
    const warrantyCardsRef = collection(db, 'warrantyCards');
    const warrantyCardsQuery = query(warrantyCardsRef, where('userId', '==', userId));
    const warrantyCardsSnapshot = await getDocs(warrantyCardsQuery);
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
    const membersRef = collection(db, 'companyMembers');
    const membersSnapshot = await getDocs(membersRef);
    console.log(`   👥 Company Members: ${membersSnapshot.size} รายการ`);
}

/**
 * Main Migration Function
 */
async function main() {
    console.log('🚀 เริ่มต้น Migration Script');
    console.log('=' .repeat(60));
    
    try {
        // ขอข้อมูล login
        console.log('\n📧 กรุณากรอกข้อมูล Login:');
        const email = process.env.FIREBASE_EMAIL || '';
        const password = process.env.FIREBASE_PASSWORD || '';
        
        if (!email || !password) {
            console.error('❌ กรุณาตั้งค่า FIREBASE_EMAIL และ FIREBASE_PASSWORD environment variables');
            console.log('\nตัวอย่าง:');
            console.log('FIREBASE_EMAIL=your@email.com FIREBASE_PASSWORD=yourpassword npx ts-node scripts/migrate-to-nature-estate.ts');
            process.exit(1);
        }
        
        // Login
        console.log(`\n🔐 กำลัง Login ด้วย: ${email}`);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        console.log(`✅ Login สำเร็จ (User ID: ${userId})`);
        
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

