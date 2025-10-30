/**
 * Script สำหรับตรวจสอบข้อมูลใน Firestore
 * 
 * วิธีรัน:
 * FIREBASE_EMAIL=your@email.com FIREBASE_PASSWORD=yourpassword npx ts-node scripts/check-firestore-data.ts
 */

import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    getDocs,
    query,
    where,
    orderBy
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

/**
 * ตรวจสอบข้อมูล Companies
 */
async function checkCompanies(): Promise<void> {
    console.log('\n📁 ตรวจสอบ Companies:');
    console.log('=' .repeat(80));
    
    const companiesRef = collection(db, 'companies');
    const snapshot = await getDocs(companiesRef);
    
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
    
    const membersRef = collection(db, 'companyMembers');
    const snapshot = await getDocs(membersRef);
    
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
    
    const deliveryNotesRef = collection(db, 'deliveryNotes');
    const q = query(deliveryNotesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
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
    
    const warrantyCardsRef = collection(db, 'warrantyCards');
    const q = query(warrantyCardsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
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
 * แสดงสรุปข้อมูลทั้งหมด
 */
async function showSummary(userId: string): Promise<void> {
    console.log('\n📊 สรุปข้อมูลทั้งหมด:');
    console.log('=' .repeat(80));
    
    // นับจำนวนแต่ละ collection
    const companiesCount = (await getDocs(collection(db, 'companies'))).size;
    const membersCount = (await getDocs(collection(db, 'companyMembers'))).size;
    
    const deliveryNotesQuery = query(collection(db, 'deliveryNotes'), where('userId', '==', userId));
    const deliveryNotesCount = (await getDocs(deliveryNotesQuery)).size;
    
    const warrantyCardsQuery = query(collection(db, 'warrantyCards'), where('userId', '==', userId));
    const warrantyCardsCount = (await getDocs(warrantyCardsQuery)).size;
    
    console.log(`📁 Companies: ${companiesCount} องค์กร`);
    console.log(`👥 Company Members: ${membersCount} สมาชิก`);
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
    
    try {
        // ขอข้อมูล login
        const email = process.env.FIREBASE_EMAIL || '';
        const password = process.env.FIREBASE_PASSWORD || '';
        
        if (!email || !password) {
            console.error('❌ กรุณาตั้งค่า FIREBASE_EMAIL และ FIREBASE_PASSWORD environment variables');
            console.log('\nตัวอย่าง:');
            console.log('FIREBASE_EMAIL=your@email.com FIREBASE_PASSWORD=yourpassword npx ts-node scripts/check-firestore-data.ts');
            process.exit(1);
        }
        
        // Login
        console.log(`🔐 กำลัง Login ด้วย: ${email}`);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        console.log(`✅ Login สำเร็จ (User ID: ${userId})\n`);
        
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

