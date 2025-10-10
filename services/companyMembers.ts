/**
 * Company Members Service
 * บริการจัดการสมาชิกในองค์กร (Multi-user Management)
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
    where,
    orderBy,
    Timestamp,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';
import { CompanyMember, UserRole, MemberStatus } from '../types';

// Collection name
const MEMBERS_COLLECTION = 'companyMembers';
const COMPANIES_COLLECTION = 'companies';

/**
 * เพิ่มสมาชิกใหม่เข้าองค์กร
 * @param companyId - ID ขององค์กร
 * @param email - อีเมลของสมาชิก
 * @param role - บทบาท (admin หรือ member)
 * @returns ID ของสมาชิกที่เพิ่ม
 */
export const addCompanyMember = async (
    companyId: string,
    email: string,
    role: UserRole = 'member'
): Promise<string> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนเพิ่มสมาชิก');
        }

        // ตรวจสอบว่าเป็น Admin หรือไม่
        const isAdmin = await checkIsAdmin(companyId, currentUser.uid);
        if (!isAdmin) {
            throw new Error('เฉพาะ Admin เท่านั้นที่สามารถเพิ่มสมาชิกได้');
        }

        // สร้าง ID
        const docRef = doc(collection(db, MEMBERS_COLLECTION));
        const memberId = docRef.id;

        // เตรียมข้อมูลสมาชิก
        const memberData = {
            companyId,
            userId: '', // จะอัปเดตเมื่อ user login
            email: email.toLowerCase(),
            role,
            status: 'pending' as MemberStatus, // รอ user login เพื่อยืนยัน
            invitedBy: currentUser.uid,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // บันทึกข้อมูล
        await setDoc(docRef, memberData);

        console.log('✅ เพิ่มสมาชิกสำเร็จ:', memberId, '(Email:', email, ')');
        return memberId;
    } catch (error) {
        console.error('❌ เพิ่มสมาชิกล้มเหลว:', error);
        throw error;
    }
};

/**
 * เพิ่มสมาชิกแรก (Admin) เมื่อสร้างองค์กรใหม่
 * @param companyId - ID ขององค์กร
 * @param userId - User ID ของ Admin
 * @param email - อีเมลของ Admin
 * @param phoneNumber - เบอร์โทรศัพท์ (optional)
 * @param displayName - ชื่อแสดง (optional)
 * @returns ID ของสมาชิกที่เพิ่ม
 */
export const addFirstAdmin = async (
    companyId: string,
    userId: string,
    email: string,
    phoneNumber?: string,
    displayName?: string
): Promise<string> => {
    try {
        // สร้าง ID
        const docRef = doc(collection(db, MEMBERS_COLLECTION));
        const memberId = docRef.id;

        // เตรียมข้อมูล Admin คนแรก
        const memberData: any = {
            companyId,
            userId,
            email: email.toLowerCase(),
            role: 'admin' as UserRole,
            status: 'active' as MemberStatus,
            joinedAt: Timestamp.now(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // เพิ่ม optional fields
        if (phoneNumber) memberData.phoneNumber = phoneNumber;
        if (displayName) memberData.displayName = displayName;

        // บันทึกข้อมูล
        await setDoc(docRef, memberData);

        console.log('✅ เพิ่ม Admin คนแรกสำเร็จ:', memberId);
        return memberId;
    } catch (error) {
        console.error('❌ เพิ่ม Admin คนแรกล้มเหลว:', error);
        throw error;
    }
};

/**
 * ดึงรายการสมาชิกทั้งหมดในองค์กร
 * @param companyId - ID ขององค์กร
 * @returns Array ของ CompanyMember
 */
export const getCompanyMembers = async (companyId: string): Promise<CompanyMember[]> => {
    try {
        const q = query(
            collection(db, MEMBERS_COLLECTION),
            where('companyId', '==', companyId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const members = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                companyId: data.companyId,
                userId: data.userId,
                email: data.email,
                phoneNumber: data.phoneNumber,
                displayName: data.displayName,
                role: data.role,
                status: data.status,
                joinedAt: data.joinedAt?.toDate(),
                invitedBy: data.invitedBy,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as CompanyMember;
        });

        console.log(`📋 ดึงสมาชิกในองค์กร ${companyId}: ${members.length} คน`);
        return members;
    } catch (error) {
        console.error('❌ ดึงรายการสมาชิกล้มเหลว:', error);
        throw error;
    }
};

/**
 * ดึงรายการองค์กรที่ User เป็นสมาชิก
 * @param userId - User ID
 * @returns Array ของ CompanyMember
 */
export const getUserMemberships = async (userId: string): Promise<CompanyMember[]> => {
    try {
        const q = query(
            collection(db, MEMBERS_COLLECTION),
            where('userId', '==', userId),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const memberships = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                companyId: data.companyId,
                userId: data.userId,
                email: data.email,
                phoneNumber: data.phoneNumber,
                displayName: data.displayName,
                role: data.role,
                status: data.status,
                joinedAt: data.joinedAt?.toDate(),
                invitedBy: data.invitedBy,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as CompanyMember;
        });

        console.log(`📋 ดึงองค์กรของ User ${userId}: ${memberships.length} องค์กร`);
        return memberships;
    } catch (error) {
        console.error('❌ ดึงรายการองค์กรล้มเหลว:', error);
        throw error;
    }
};

/**
 * ตรวจสอบว่า User เป็น Admin ขององค์กรหรือไม่
 * @param companyId - ID ขององค์กร
 * @param userId - User ID
 * @returns true ถ้าเป็น Admin
 */
export const checkIsAdmin = async (companyId: string, userId: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, MEMBERS_COLLECTION),
            where('companyId', '==', companyId),
            where('userId', '==', userId),
            where('role', '==', 'admin'),
            where('status', '==', 'active')
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('❌ ตรวจสอบสิทธิ์ Admin ล้มเหลว:', error);
        return false;
    }
};

/**
 * ตรวจสอบว่า User เป็นสมาชิกขององค์กรหรือไม่
 * @param companyId - ID ขององค์กร
 * @param userId - User ID
 * @returns true ถ้าเป็นสมาชิก
 */
export const checkIsMember = async (companyId: string, userId: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, MEMBERS_COLLECTION),
            where('companyId', '==', companyId),
            where('userId', '==', userId),
            where('status', '==', 'active')
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('❌ ตรวจสอบสมาชิกล้มเหลว:', error);
        return false;
    }
};

/**
 * อัปเดตบทบาทของสมาชิก
 * @param memberId - ID ของสมาชิก
 * @param role - บทบาทใหม่
 */
export const updateMemberRole = async (memberId: string, role: UserRole): Promise<void> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนแก้ไขบทบาท');
        }

        // ดึงข้อมูลสมาชิกที่จะแก้ไข
        const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
        const memberDoc = await getDoc(memberRef);

        if (!memberDoc.exists()) {
            throw new Error('ไม่พบสมาชิกนี้');
        }

        const memberData = memberDoc.data();

        // ตรวจสอบว่าเป็น Admin หรือไม่
        const isAdmin = await checkIsAdmin(memberData.companyId, currentUser.uid);
        if (!isAdmin) {
            throw new Error('เฉพาะ Admin เท่านั้นที่สามารถแก้ไขบทบาทได้');
        }

        // อัปเดตบทบาท
        await updateDoc(memberRef, {
            role,
            updatedAt: Timestamp.now(),
        });

        console.log('✅ อัปเดตบทบาทสำเร็จ:', memberId, '→', role);
    } catch (error) {
        console.error('❌ อัปเดตบทบาทล้มเหลว:', error);
        throw error;
    }
};

/**
 * ลบสมาชิกออกจากองค์กร
 * @param memberId - ID ของสมาชิก
 */
export const removeMember = async (memberId: string): Promise<void> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนลบสมาชิก');
        }

        // ดึงข้อมูลสมาชิกที่จะลบ
        const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
        const memberDoc = await getDoc(memberRef);

        if (!memberDoc.exists()) {
            throw new Error('ไม่พบสมาชิกนี้');
        }

        const memberData = memberDoc.data();

        // ตรวจสอบว่าเป็น Admin หรือไม่
        const isAdmin = await checkIsAdmin(memberData.companyId, currentUser.uid);
        if (!isAdmin) {
            throw new Error('เฉพาะ Admin เท่านั้นที่สามารถลบสมาชิกได้');
        }

        // ห้ามลบตัวเองถ้าเป็น Admin คนเดียว
        const members = await getCompanyMembers(memberData.companyId);
        const admins = members.filter(m => m.role === 'admin' && m.status === 'active');
        
        if (admins.length === 1 && memberData.userId === currentUser.uid) {
            throw new Error('ไม่สามารถลบ Admin คนเดียวได้ กรุณาเพิ่ม Admin คนอื่นก่อน');
        }

        // ลบสมาชิก
        await deleteDoc(memberRef);

        console.log('✅ ลบสมาชิกสำเร็จ:', memberId);
    } catch (error) {
        console.error('❌ ลบสมาชิกล้มเหลว:', error);
        throw error;
    }
};

/**
 * ยืนยันการเข้าร่วมองค์กร (เมื่อ User login ครั้งแรก)
 * @param email - อีเมลของ User
 * @param userId - User ID
 * @param phoneNumber - เบอร์โทรศัพท์ (optional)
 * @param displayName - ชื่อแสดง (optional)
 */
export const confirmMembership = async (
    email: string,
    userId: string,
    phoneNumber?: string,
    displayName?: string
): Promise<void> => {
    try {
        // ค้นหา pending membership ที่ตรงกับอีเมล
        const q = query(
            collection(db, MEMBERS_COLLECTION),
            where('email', '==', email.toLowerCase()),
            where('status', '==', 'pending')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('ℹ️ ไม่พบคำเชิญเข้าองค์กรสำหรับอีเมลนี้');
            return;
        }

        // อัปเดตทุก pending membership
        const batch = writeBatch(db);

        querySnapshot.docs.forEach(doc => {
            const updateData: any = {
                userId,
                status: 'active' as MemberStatus,
                joinedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            if (phoneNumber) updateData.phoneNumber = phoneNumber;
            if (displayName) updateData.displayName = displayName;

            batch.update(doc.ref, updateData);
        });

        await batch.commit();

        console.log('✅ ยืนยันการเข้าร่วมองค์กรสำเร็จ:', querySnapshot.docs.length, 'องค์กร');
    } catch (error) {
        console.error('❌ ยืนยันการเข้าร่วมองค์กรล้มเหลว:', error);
        throw error;
    }
};

/**
 * อัปเดตจำนวนสมาชิกในองค์กร
 * @param companyId - ID ขององค์กร
 */
export const updateMemberCount = async (companyId: string): Promise<void> => {
    try {
        const members = await getCompanyMembers(companyId);
        const activeMembers = members.filter(m => m.status === 'active');

        const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
        await updateDoc(companyRef, {
            memberCount: activeMembers.length,
            updatedAt: Timestamp.now(),
        });

        console.log('✅ อัปเดตจำนวนสมาชิกสำเร็จ:', companyId, '→', activeMembers.length, 'คน');
    } catch (error) {
        console.error('❌ อัปเดตจำนวนสมาชิกล้มเหลว:', error);
    }
};

