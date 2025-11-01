/**
 * Super Admin Service
 * บริการจัดการระบบโดย Super Admin (System-wide management)
 */

import { db, auth } from '../firebase.config';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    query,
    where,
    orderBy,
    Timestamp,
    updateDoc,
    limit,
} from 'firebase/firestore';
import { SuperAdmin, SystemStats, Company, CompanyMember, Invitation } from '../types';

// Collection names
const SUPER_ADMINS_COLLECTION = 'superAdmins';
const COMPANIES_COLLECTION = 'companies';
const MEMBERS_COLLECTION = 'companyMembers';
const INVITATIONS_COLLECTION = 'invitations';
const DELIVERY_NOTES_COLLECTION = 'deliveryNotes';
const WARRANTY_CARDS_COLLECTION = 'warrantyCards';

/**
 * ตรวจสอบว่า User เป็น Super Admin หรือไม่
 * @param userId - User ID
 * @returns true ถ้าเป็น Super Admin
 */
export const isSuperAdmin = async (userId: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, SUPER_ADMINS_COLLECTION),
            where('userId', '==', userId),
            where('role', '==', 'superadmin')
        );

        const querySnapshot = await getDocs(q);
        const isSuper = !querySnapshot.empty;
        
        console.log(`🔐 [SuperAdmin] Check for ${userId}:`, isSuper);
        return isSuper;
    } catch (error) {
        console.error('❌ ตรวจสอบ Super Admin ล้มเหลว:', error);
        return false;
    }
};

/**
 * ดึงข้อมูล Super Admin
 * @param userId - User ID
 * @returns SuperAdmin object หรือ null
 */
export const getSuperAdmin = async (userId: string): Promise<SuperAdmin | null> => {
    try {
        const q = query(
            collection(db, SUPER_ADMINS_COLLECTION),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();

        return {
            id: doc.id,
            userId: data.userId,
            email: data.email,
            displayName: data.displayName,
            role: data.role,
            permissions: data.permissions || [],
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            lastLoginAt: data.lastLoginAt?.toDate(),
        } as SuperAdmin;
    } catch (error) {
        console.error('❌ ดึงข้อมูล Super Admin ล้มเหลว:', error);
        return null;
    }
};

/**
 * ดึงสถิติภาพรวมระบบ
 * @returns SystemStats object
 */
export const getSystemStats = async (): Promise<SystemStats> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อน');
        }

        // ตรวจสอบว่าเป็น Super Admin หรือไม่
        const isSuper = await isSuperAdmin(currentUser.uid);
        if (!isSuper) {
            throw new Error('เฉพาะ Super Admin เท่านั้นที่สามารถดูสถิติได้');
        }

        // นับจำนวนบริษัท
        const companiesSnapshot = await getDocs(collection(db, COMPANIES_COLLECTION));
        const totalCompanies = companiesSnapshot.size;

        // นับจำนวนสมาชิก
        const membersSnapshot = await getDocs(collection(db, MEMBERS_COLLECTION));
        const totalMembers = membersSnapshot.size;
        const activeMembers = membersSnapshot.docs.filter(
            doc => doc.data().status === 'active'
        ).length;

        // นับจำนวนคำเชิญ
        const invitationsSnapshot = await getDocs(collection(db, INVITATIONS_COLLECTION));
        const totalInvitations = invitationsSnapshot.size;
        const pendingInvitations = invitationsSnapshot.docs.filter(
            doc => doc.data().status === 'pending'
        ).length;

        // นับจำนวนเอกสาร
        const deliveryNotesSnapshot = await getDocs(
            query(collection(db, DELIVERY_NOTES_COLLECTION), limit(1000))
        );
        const warrantyCardsSnapshot = await getDocs(
            query(collection(db, WARRANTY_CARDS_COLLECTION), limit(1000))
        );
        const totalDocuments = deliveryNotesSnapshot.size + warrantyCardsSnapshot.size;

        // รวม unique users จาก email ของสมาชิก
        const uniqueEmails = new Set(
            membersSnapshot.docs.map(doc => doc.data().email)
        );
        const totalUsers = uniqueEmails.size;

        const stats: SystemStats = {
            totalCompanies,
            totalUsers,
            totalMembers,
            totalInvitations,
            totalDocuments,
            activeUsers: activeMembers,
            pendingInvitations,
        };

        console.log('📊 [SuperAdmin] System Stats:', stats);
        return stats;
    } catch (error) {
        console.error('❌ ดึงสถิติระบบล้มเหลว:', error);
        throw error;
    }
};

/**
 * ดึงรายการบริษัททั้งหมดในระบบ
 * @returns Array ของ Company
 */
export const getAllCompanies = async (): Promise<Company[]> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อน');
        }

        // ตรวจสอบว่าเป็น Super Admin หรือไม่
        const isSuper = await isSuperAdmin(currentUser.uid);
        if (!isSuper) {
            throw new Error('เฉพาะ Super Admin เท่านั้นที่สามารถดูบริษัททั้งหมดได้');
        }

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
                userId: data.userId,
                logoUrl: data.logoUrl,
                logoType: data.logoType,
                defaultLogoUrl: data.defaultLogoUrl,
                memberCount: data.memberCount || 0,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as Company;
        });

        console.log(`🏢 [SuperAdmin] All Companies: ${companies.length} บริษัท`);
        return companies;
    } catch (error) {
        console.error('❌ ดึงรายการบริษัทล้มเหลว:', error);
        throw error;
    }
};

/**
 * ดึงรายการสมาชิกทั้งหมดในระบบ
 * @param companyId - ถ้าระบุจะดึงเฉพาะบริษัทนั้น
 * @returns Array ของ CompanyMember
 */
export const getAllMembers = async (companyId?: string): Promise<CompanyMember[]> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อน');
        }

        // ตรวจสอบว่าเป็น Super Admin หรือไม่
        const isSuper = await isSuperAdmin(currentUser.uid);
        if (!isSuper) {
            throw new Error('เฉพาะ Super Admin เท่านั้นที่สามารถดูสมาชิกทั้งหมดได้');
        }

        let q;
        if (companyId) {
            q = query(
                collection(db, MEMBERS_COLLECTION),
                where('companyId', '==', companyId),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                collection(db, MEMBERS_COLLECTION),
                orderBy('createdAt', 'desc')
            );
        }

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

        console.log(`👥 [SuperAdmin] All Members: ${members.length} คน${companyId ? ` (Company: ${companyId})` : ''}`);
        return members;
    } catch (error) {
        console.error('❌ ดึงรายการสมาชิกล้มเหลว:', error);
        throw error;
    }
};

/**
 * ดึงรายการคำเชิญทั้งหมดในระบบ
 * @returns Array ของ Invitation
 */
export const getAllInvitations = async (): Promise<Invitation[]> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อน');
        }

        // ตรวจสอบว่าเป็น Super Admin หรือไม่
        const isSuper = await isSuperAdmin(currentUser.uid);
        if (!isSuper) {
            throw new Error('เฉพาะ Super Admin เท่านั้นที่สามารถดูคำเชิญทั้งหมดได้');
        }

        const q = query(
            collection(db, INVITATIONS_COLLECTION),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const invitations = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                companyId: data.companyId,
                companyName: data.companyName,
                email: data.email,
                role: data.role,
                status: data.status,
                invitedBy: data.invitedBy,
                invitedByName: data.invitedByName,
                invitedByEmail: data.invitedByEmail,
                token: data.token,
                expiresAt: data.expiresAt?.toDate(),
                acceptedAt: data.acceptedAt?.toDate(),
                acceptedBy: data.acceptedBy,
                message: data.message,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as Invitation;
        });

        console.log(`📨 [SuperAdmin] All Invitations: ${invitations.length} คำเชิญ`);
        return invitations;
    } catch (error) {
        console.error('❌ ดึงรายการคำเชิญล้มเหลว:', error);
        throw error;
    }
};

/**
 * อัปเดต Last Login ของ Super Admin
 * @param userId - User ID
 */
export const updateSuperAdminLastLogin = async (userId: string): Promise<void> => {
    try {
        const q = query(
            collection(db, SUPER_ADMINS_COLLECTION),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, {
                lastLoginAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            console.log('✅ [SuperAdmin] อัปเดต Last Login สำเร็จ');
        }
    } catch (error) {
        console.error('❌ อัปเดต Last Login ล้มเหลว:', error);
    }
};

