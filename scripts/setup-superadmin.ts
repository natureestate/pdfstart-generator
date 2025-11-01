/**
 * Script สำหรับตั้งค่า Super Admin
 * ใช้สำหรับเพิ่ม Super Admin คนแรกในระบบ
 * 
 * วิธีใช้:
 * 1. แก้ไข EMAIL และ DISPLAY_NAME ด้านล่าง
 * 2. รัน: npx ts-node scripts/setup-superadmin.ts
 */

import * as admin from 'firebase-admin';
import * as readline from 'readline';

// Initialize Firebase Admin
try {
    admin.initializeApp();
    console.log('✅ Firebase Admin initialized');
} catch (error) {
    console.log('ℹ️ Firebase Admin already initialized');
}

const db = admin.firestore();

// ========================================
// ⚠️ แก้ไขข้อมูลตรงนี้
// ========================================
const SUPER_ADMIN_EMAIL = 'YOUR_EMAIL@example.com';  // เปลี่ยนเป็นอีเมลของคุณ
const DISPLAY_NAME = 'Super Admin';                   // เปลี่ยนเป็นชื่อของคุณ
// ========================================

/**
 * ถามคำตอบจาก user
 */
function question(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => {
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

/**
 * ตรวจสอบว่ามี Super Admin คนนี้อยู่แล้วหรือไม่
 */
async function checkExistingSuperAdmin(userId: string): Promise<boolean> {
    try {
        const snapshot = await db.collection('superAdmins')
            .where('userId', '==', userId)
            .get();
        
        return !snapshot.empty;
    } catch (error) {
        console.error('❌ เช็ค Super Admin ล้มเหลว:', error);
        return false;
    }
}

/**
 * สร้าง Super Admin
 */
async function createSuperAdmin(userId: string, email: string, displayName: string) {
    try {
        const superAdminData = {
            userId,
            email: email.toLowerCase(),
            displayName,
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

        await db.collection('superAdmins').add(superAdminData);

        console.log('✅ สร้าง Super Admin สำเร็จ!');
        console.log('📧 อีเมล:', email);
        console.log('👤 ชื่อ:', displayName);
        console.log('🔑 User ID:', userId);
    } catch (error) {
        console.error('❌ สร้าง Super Admin ล้มเหลว:', error);
        throw error;
    }
}

/**
 * Main function
 */
async function main() {
    console.log('='.repeat(60));
    console.log('🔐 Setup Super Admin Script');
    console.log('='.repeat(60));
    console.log();

    // ตรวจสอบว่าแก้ไขอีเมลแล้วหรือยัง
    if (SUPER_ADMIN_EMAIL === 'YOUR_EMAIL@example.com') {
        console.error('❌ กรุณาแก้ไขอีเมลใน script ก่อน!');
        console.error('   เปิดไฟล์: scripts/setup-superadmin.ts');
        console.error('   แก้ไข SUPER_ADMIN_EMAIL และ DISPLAY_NAME');
        process.exit(1);
    }

    console.log('📧 อีเมล Super Admin:', SUPER_ADMIN_EMAIL);
    console.log('👤 ชื่อแสดง:', DISPLAY_NAME);
    console.log();

    // ยืนยัน
    const confirm = await question('ต้องการดำเนินการต่อหรือไม่? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
        console.log('❌ ยกเลิกการทำงาน');
        process.exit(0);
    }

    console.log();
    console.log('🔍 กำลังค้นหา user...');

    try {
        // ค้นหา user จากอีเมล
        const userRecord = await admin.auth().getUserByEmail(SUPER_ADMIN_EMAIL);
        console.log('✅ พบ user:', userRecord.email);
        console.log('🔑 User ID:', userRecord.uid);

        // ตรวจสอบว่ามี Super Admin อยู่แล้วหรือไม่
        const exists = await checkExistingSuperAdmin(userRecord.uid);
        if (exists) {
            console.log('⚠️ User นี้เป็น Super Admin อยู่แล้ว');
            process.exit(0);
        }

        // สร้าง Super Admin
        console.log();
        console.log('📝 กำลังสร้าง Super Admin...');
        await createSuperAdmin(userRecord.uid, userRecord.email!, DISPLAY_NAME);

        console.log();
        console.log('='.repeat(60));
        console.log('🎉 เสร็จสมบูรณ์!');
        console.log('='.repeat(60));
        console.log();
        console.log('ขั้นตอนต่อไป:');
        console.log('1. Deploy Firestore Rules:');
        console.log('   firebase deploy --only firestore:rules');
        console.log();
        console.log('2. Login ด้วยอีเมล:', SUPER_ADMIN_EMAIL);
        console.log('3. เข้า Super Admin Dashboard');
        console.log();

    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.error('❌ ไม่พบ user นี้ในระบบ');
            console.error('   กรุณาสร้างบัญชีก่อน หรือตรวจสอบอีเมล');
        } else {
            console.error('❌ เกิดข้อผิดพลาด:', error.message);
        }
        process.exit(1);
    }

    process.exit(0);
}

// Run
main().catch((error) => {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
});

