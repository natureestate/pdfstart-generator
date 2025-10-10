/**
 * Companies Service
 * บริการจัดการบริษัทของ User
 */

import { db, auth } from '../firebase.config';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    updateDoc,
} from 'firebase/firestore';
import { Company } from '../types';

// Collection name
const COMPANIES_COLLECTION = 'companies';

/**
 * สร้างบริษัทใหม่
 * @param company - ข้อมูลบริษัท
 * @returns ID ของบริษัทที่สร้าง
 */
export const createCompany = async (
    company: Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
    try {
        // ตรวจสอบว่า user login แล้วหรือยัง
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนสร้างบริษัท');
        }

        // สร้าง ID
        const docRef = doc(collection(db, COMPANIES_COLLECTION));
        const companyId = docRef.id;

        // เตรียมข้อมูลสำหรับบันทึก - ลบ undefined fields
        const dataToSave: any = {
            name: company.name,
            userId: currentUser.uid, // คนที่สร้าง = Admin (มีสิทธิ์ลบ)
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // เพิ่ม optional fields เฉพาะที่มีค่า
        if (company.address) {
            dataToSave.address = company.address;
        }
        if (company.logoUrl !== undefined) {
            dataToSave.logoUrl = company.logoUrl;
        }
        if (company.logoType) {
            dataToSave.logoType = company.logoType;
        }

        // บันทึกข้อมูล
        await setDoc(docRef, dataToSave);

        console.log('✅ สร้างบริษัทสำเร็จ:', companyId, '(Admin:', currentUser.uid, ')');
        return companyId;
    } catch (error) {
        console.error('❌ สร้างบริษัทล้มเหลว:', error);
        throw new Error('ไม่สามารถสร้างบริษัทได้');
    }
};

/**
 * ดึงรายการบริษัททั้งหมด (ทุกคนเห็นบริษัททั้งหมด)
 * @returns Array ของ Company
 */
export const getUserCompanies = async (): Promise<Company[]> => {
    try {
        // ตรวจสอบว่า user login แล้วหรือยัง
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนดูข้อมูล');
        }

        // ดึงบริษัททั้งหมด (ไม่กรองตาม userId)
        const q = query(
            collection(db, COMPANIES_COLLECTION),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const companies = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                address: data.address,
                userId: data.userId, // Admin ที่สร้างบริษัท
                logoUrl: data.logoUrl,
                logoType: data.logoType,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as Company;
        });

        console.log(`📋 ดึงบริษัททั้งหมด: ${companies.length} บริษัท`);
        return companies;
    } catch (error) {
        console.error('❌ ดึงรายการบริษัทล้มเหลว:', error);
        throw new Error('ไม่สามารถดึงรายการบริษัทได้');
    }
};

/**
 * ดึงข้อมูลบริษัทตาม ID
 * @param companyId - ID ของบริษัท
 * @returns Company หรือ null ถ้าไม่พบ
 */
export const getCompanyById = async (companyId: string): Promise<Company | null> => {
    try {
        const docRef = doc(db, COMPANIES_COLLECTION, companyId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            address: data.address,
            userId: data.userId,
            logoUrl: data.logoUrl,
            logoType: data.logoType,
            isDefault: data.isDefault || false,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as Company;
    } catch (error) {
        console.error('❌ ดึงข้อมูลบริษัทล้มเหลว:', error);
        throw new Error('ไม่สามารถดึงข้อมูลบริษัทได้');
    }
};

/**
 * อัปเดตข้อมูลบริษัท
 * @param companyId - ID ของบริษัท
 * @param updates - ข้อมูลที่ต้องการอัปเดต
 */
export const updateCompany = async (
    companyId: string,
    updates: Partial<Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
    try {
        const docRef = doc(db, COMPANIES_COLLECTION, companyId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: Timestamp.now(),
        });

        console.log('✅ อัปเดตบริษัทสำเร็จ:', companyId);
    } catch (error) {
        console.error('❌ อัปเดตบริษัทล้มเหลว:', error);
        throw new Error('ไม่สามารถอัปเดตบริษัทได้');
    }
};

/**
 * ลบบริษัท
 * @param companyId - ID ของบริษัท
 */
export const deleteCompany = async (companyId: string): Promise<void> => {
    try {
        const docRef = doc(db, COMPANIES_COLLECTION, companyId);
        await deleteDoc(docRef);

        console.log('✅ ลบบริษัทสำเร็จ:', companyId);
    } catch (error) {
        console.error('❌ ลบบริษัทล้มเหลว:', error);
        throw new Error('ไม่สามารถลบบริษัทได้');
    }
};

// ลบฟังก์ชัน default company - ไม่ใช้แล้ว
