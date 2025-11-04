/**
 * Customer Migration Service
 * ใช้สำหรับ migrate ข้อมูลลูกค้าเก่าให้มี lastUsedAt
 */

import { collection, getDocs, doc, updateDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.config';

const CUSTOMERS_COLLECTION = 'customers';

/**
 * อัปเดตลูกค้าทั้งหมดของ company ให้มี lastUsedAt: null ถ้ายังไม่มี
 */
export const migrateCustomersLastUsedAt = async (companyId: string): Promise<void> => {
    try {
        console.log('🔄 [Migration] เริ่ม migrate ลูกค้าของ company:', companyId);

        // Query ลูกค้าทั้งหมดของ company
        const customersRef = collection(db, CUSTOMERS_COLLECTION);
        const q = query(
            customersRef,
            where('companyId', '==', companyId)
        );

        const querySnapshot = await getDocs(q);
        console.log('📋 [Migration] พบลูกค้าทั้งหมด:', querySnapshot.size, 'รายการ');

        // ใช้ batch update เพื่อความเร็ว
        const batch = writeBatch(db);
        let updateCount = 0;

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            
            // เช็คว่ามี lastUsedAt หรือไม่ (ถ้าไม่มีหรือเป็น undefined)
            if (!('lastUsedAt' in data)) {
                const docRef = doc(db, CUSTOMERS_COLLECTION, docSnapshot.id);
                batch.update(docRef, { lastUsedAt: null });
                updateCount++;
                console.log('✏️ [Migration] เพิ่ม lastUsedAt ให้:', data.customerName);
            }
        });

        if (updateCount > 0) {
            await batch.commit();
            console.log('✅ [Migration] อัปเดตสำเร็จ:', updateCount, 'รายการ');
        } else {
            console.log('✅ [Migration] ไม่มีข้อมูลที่ต้องอัปเดต');
        }
    } catch (error) {
        console.error('❌ [Migration] Error:', error);
        throw error;
    }
};

/**
 * ตรวจสอบว่าต้อง migrate หรือไม่
 */
export const checkNeedMigration = async (companyId: string): Promise<boolean> => {
    try {
        const customersRef = collection(db, CUSTOMERS_COLLECTION);
        const q = query(
            customersRef,
            where('companyId', '==', companyId)
        );

        const querySnapshot = await getDocs(q);
        
        // เช็คว่ามีลูกค้าที่ไม่มี lastUsedAt หรือไม่
        const needMigration = querySnapshot.docs.some(doc => {
            const data = doc.data();
            return !('lastUsedAt' in data);
        });

        return needMigration;
    } catch (error) {
        console.error('❌ [Migration] Error checking migration:', error);
        return false;
    }
};

