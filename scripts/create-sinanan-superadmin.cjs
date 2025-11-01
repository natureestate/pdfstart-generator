/**
 * Script สร้าง Super Admin สำหรับ sinanan.ac.th@gmail.com
 * รัน: node scripts/create-sinanan-superadmin.cjs
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
    admin.initializeApp();
    console.log('✅ Firebase Admin initialized');
} catch (error) {
    console.log('ℹ️  Firebase Admin already initialized');
}

const db = admin.firestore();

// ข้อมูล Super Admin
const SUPER_ADMIN_EMAIL = 'sinanan.ac.th@gmail.com';
const DISPLAY_NAME = 'Sin a nan';

async function main() {
    console.log('='.repeat(60));
    console.log('🔐 สร้าง Super Admin สำหรับ', SUPER_ADMIN_EMAIL);
    console.log('='.repeat(60));
    console.log();

    try {
        // 1. ค้นหา user จากอีเมล
        console.log('🔍 กำลังค้นหา user...');
        let userRecord;
        
        try {
            userRecord = await admin.auth().getUserByEmail(SUPER_ADMIN_EMAIL);
            console.log('✅ พบ user:', userRecord.email);
            console.log('🔑 User ID:', userRecord.uid);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log('ℹ️  ไม่พบ user นี้ในระบบ กำลังสร้างใหม่...');
                
                // สร้าง user ใหม่
                userRecord = await admin.auth().createUser({
                    email: SUPER_ADMIN_EMAIL,
                    password: 'Sinananr99', // รหัสผ่านชั่วคราว
                    displayName: DISPLAY_NAME,
                    emailVerified: true,
                });
                
                console.log('✅ สร้าง user สำเร็จ:', userRecord.email);
                console.log('🔑 User ID:', userRecord.uid);
                console.log('🔒 รหัสผ่าน: Sinananr99');
            } else {
                throw error;
            }
        }

        // 2. ตรวจสอบและทำความสะอาด Super Admin documents เก่า
        console.log();
        console.log('🧹 ตรวจสอบและทำความสะอาด Super Admin...');
        const snapshot = await db.collection('superAdmins')
            .where('userId', '==', userRecord.uid)
            .get();

        // ลบ documents เก่าที่ไม่ใช้ userId เป็น document ID
        let deletedOldDocs = 0;
        for (const doc of snapshot.docs) {
            if (doc.id !== userRecord.uid) {
                console.log('🗑️  ลบ document เก่า:', doc.id);
                await doc.ref.delete();
                deletedOldDocs++;
            }
        }
        
        if (deletedOldDocs > 0) {
            console.log(`✅ ลบ document เก่าแล้ว ${deletedOldDocs} document(s)`);
        }

        // ตรวจสอบว่ามี document ที่ใช้ userId เป็น document ID อยู่แล้วหรือไม่
        const correctDoc = await db.collection('superAdmins').doc(userRecord.uid).get();
        if (correctDoc.exists) {
            console.log('✅ Super Admin document (รูปแบบใหม่) มีอยู่แล้ว');
            console.log();
            console.log('='.repeat(60));
            console.log('ℹ️  ข้อมูลการเข้าใช้งาน:');
            console.log('='.repeat(60));
            console.log('📧 อีเมล:', SUPER_ADMIN_EMAIL);
            console.log('🔒 รหัสผ่าน: Sinananr99');
            console.log('🔗 URL: http://localhost:5173/superadmin');
            console.log('   หรือ: https://ecertonline-29a67.web.app/superadmin');
            console.log();
            process.exit(0);
        }

        // 3. สร้าง Super Admin โดยใช้ userId เป็น document ID
        console.log('📝 กำลังสร้าง Super Admin...');
        const superAdminData = {
            userId: userRecord.uid,
            email: SUPER_ADMIN_EMAIL.toLowerCase(),
            displayName: DISPLAY_NAME,
            role: 'superadmin',
            permissions: [
                'view_all',
                'manage_users',
                'manage_companies',
                'manage_invitations',
                'view_stats',
            ],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // ใช้ userId เป็น document ID เพื่อให้ Firestore Rules ตรวจสอบได้
        await db.collection('superAdmins').doc(userRecord.uid).set(superAdminData);

        console.log('✅ สร้าง Super Admin สำเร็จ!');
        console.log();
        console.log('='.repeat(60));
        console.log('🎉 เสร็จสมบูรณ์!');
        console.log('='.repeat(60));
        console.log();
        console.log('📧 อีเมล:', SUPER_ADMIN_EMAIL);
        console.log('🔒 รหัสผ่าน: Sinananr99');
        console.log('👤 ชื่อ:', DISPLAY_NAME);
        console.log('🔑 User ID:', userRecord.uid);
        console.log();
        console.log('🔗 เข้าใช้งานที่:');
        console.log('   http://localhost:5173/superadmin');
        console.log('   หรือ');
        console.log('   https://ecertonline-29a67.web.app/superadmin');
        console.log();
        console.log('📝 ขั้นตอนต่อไป:');
        console.log('   1. เปิด browser');
        console.log('   2. ไปที่ http://localhost:5173');
        console.log('   3. Login ด้วย:');
        console.log('      อีเมล: sinanan.ac.th@gmail.com');
        console.log('      รหัสผ่าน: Sinananr99');
        console.log('   4. ไปที่ http://localhost:5173/superadmin');
        console.log();

    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        process.exit(1);
    }

    process.exit(0);
}

// Run
main().catch((error) => {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
});

