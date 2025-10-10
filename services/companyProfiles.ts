/**
 * Company Profiles Service
 * บริการจัดการข้อมูลบริษัท/ที่อยู่ที่ใช้บ่อย
 */

import { db, auth } from '../firebase.config';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore';

// Collection name
const COMPANY_PROFILES_COLLECTION = 'companyProfiles';

// Interface สำหรับ Company Profile
export interface CompanyProfile {
    id?: string;
    name: string;              // ชื่อ profile (เช่น "บริษัทเรา", "ลูกค้า A")
    companyName: string;       // ชื่อบริษัท
    address: string;           // ที่อยู่
    type: 'sender' | 'receiver' | 'both';  // ประเภท: ผู้ส่ง, ผู้รับ, หรือทั้งสองอย่าง
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * บันทึก Company Profile ใหม่
 * @param profile - ข้อมูล profile
 * @param companyId - ID ของบริษัท (optional)
 */
export const saveCompanyProfile = async (
    profile: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>,
    companyId?: string
): Promise<string> => {
    try {
        // ตรวจสอบว่า user login แล้วหรือยัง
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนบันทึกข้อมูล');
        }
        
        // สร้าง ID จากชื่อ profile
        const docId = `profile_${Date.now()}_${profile.name.replace(/\s+/g, '_').toLowerCase()}`;
        const docRef = doc(db, COMPANY_PROFILES_COLLECTION, docId);

        await setDoc(docRef, {
            ...profile,
            userId: currentUser.uid, // เพิ่ม userId
            companyId: companyId || null, // เพิ่ม companyId
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return docId;
    } catch (error) {
        console.error('Error saving company profile:', error);
        throw new Error('ไม่สามารถบันทึก Company Profile ได้');
    }
};

/**
 * ดึงรายการ Company Profiles ทั้งหมด - เฉพาะของ user และ company ที่เลือก
 * @param companyId - ID ของบริษัท (optional) ถ้าไม่ระบุจะดึงทั้งหมด
 */
export const getCompanyProfiles = async (companyId?: string): Promise<CompanyProfile[]> => {
    try {
        // ตรวจสอบว่า user login แล้วหรือยัง
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนดูข้อมูล');
        }
        
        // สร้าง query constraints
        const constraints = [
            where('userId', '==', currentUser.uid), // กรองเฉพาะของ user นี้
        ];
        
        // ถ้ามี companyId ให้กรองเฉพาะบริษัทนั้น
        if (companyId) {
            constraints.push(where('companyId', '==', companyId));
        }
        
        constraints.push(orderBy('createdAt', 'desc'));
        
        const q = query(collection(db, COMPANY_PROFILES_COLLECTION), ...constraints);

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                companyName: data.companyName,
                address: data.address,
                type: data.type,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as CompanyProfile;
        });
    } catch (error) {
        console.error('Error getting company profiles:', error);
        throw new Error('ไม่สามารถดึงรายการ Company Profiles ได้');
    }
};

/**
 * ลบ Company Profile
 */
export const deleteCompanyProfile = async (id: string): Promise<void> => {
    try {
        const docRef = doc(db, COMPANY_PROFILES_COLLECTION, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting company profile:', error);
        throw new Error('ไม่สามารถลบ Company Profile ได้');
    }
};

/**
 * อัปเดต Company Profile
 */
export const updateCompanyProfile = async (
    id: string,
    profile: Partial<Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
    try {
        const docRef = doc(db, COMPANY_PROFILES_COLLECTION, id);
        await setDoc(docRef, {
            ...profile,
            updatedAt: Timestamp.now(),
        }, { merge: true });
    } catch (error) {
        console.error('Error updating company profile:', error);
        throw new Error('ไม่สามารถอัปเดต Company Profile ได้');
    }
};

/**
 * ดึง profiles ตามประเภท
 */
export const getProfilesByType = (profiles: CompanyProfile[], type: 'sender' | 'receiver'): CompanyProfile[] => {
    return profiles.filter(p => p.type === type || p.type === 'both');
};

