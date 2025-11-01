/**
 * Invitations Service
 * บริการจัดการคำเชิญเข้าองค์กร (Invitation System)
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
} from 'firebase/firestore';
import { Invitation, InvitationStatus, UserRole } from '../types';
import { checkIsAdmin } from './companyMembers';

// Collection name
const INVITATIONS_COLLECTION = 'invitations';
const COMPANIES_COLLECTION = 'companies';

/**
 * สร้าง Token แบบสุ่มสำหรับคำเชิญ
 * @returns Token string
 */
const generateInvitationToken = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};

/**
 * สร้างคำเชิญเข้าองค์กร
 * @param companyId - ID ขององค์กร
 * @param companyName - ชื่อองค์กร
 * @param email - อีเมลของผู้ถูกเชิญ
 * @param role - บทบาท (admin หรือ member)
 * @param message - ข้อความจากผู้เชิญ (optional)
 * @returns Invitation object
 */
export const createInvitation = async (
    companyId: string,
    companyName: string,
    email: string,
    role: UserRole = 'member',
    message?: string
): Promise<Invitation> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนส่งคำเชิญ');
        }

        // ตรวจสอบว่าเป็น Admin หรือไม่
        const isAdmin = await checkIsAdmin(companyId, currentUser.uid);
        if (!isAdmin) {
            throw new Error('เฉพาะ Admin เท่านั้นที่สามารถเชิญสมาชิกได้');
        }

        // ตรวจสอบว่ามีคำเชิญที่ pending อยู่แล้วหรือไม่
        const existingInvitation = await getInvitationByEmail(companyId, email);
        if (existingInvitation && existingInvitation.status === 'pending') {
            throw new Error('มีคำเชิญที่รอการยอมรับสำหรับอีเมลนี้อยู่แล้ว');
        }

        // สร้าง Token
        const token = generateInvitationToken();

        // กำหนดวันหมดอายุ (7 วันจากตอนนี้)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // สร้าง ID
        const docRef = doc(collection(db, INVITATIONS_COLLECTION));
        const invitationId = docRef.id;

        // เตรียมข้อมูลคำเชิญ
        const invitationData: any = {
            companyId,
            companyName,
            email: email.toLowerCase(),
            role,
            status: 'pending' as InvitationStatus,
            invitedBy: currentUser.uid,
            invitedByName: currentUser.displayName || undefined,
            invitedByEmail: currentUser.email || undefined,
            token,
            expiresAt: Timestamp.fromDate(expiresAt),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // เพิ่มข้อความถ้ามี
        if (message) {
            invitationData.message = message;
        }

        // บันทึกข้อมูล
        await setDoc(docRef, invitationData);

        console.log('✅ สร้างคำเชิญสำเร็จ:', invitationId, '(Email:', email, ')');

        // Return invitation object
        return {
            id: invitationId,
            ...invitationData,
            expiresAt,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Invitation;
    } catch (error) {
        console.error('❌ สร้างคำเชิญล้มเหลว:', error);
        throw error;
    }
};

/**
 * ดึงคำเชิญตาม Token
 * @param token - Token ของคำเชิญ
 * @returns Invitation object หรือ null
 */
export const getInvitationByToken = async (token: string): Promise<Invitation | null> => {
    try {
        const q = query(
            collection(db, INVITATIONS_COLLECTION),
            where('token', '==', token)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
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
    } catch (error) {
        console.error('❌ ดึงคำเชิญล้มเหลว:', error);
        throw error;
    }
};

/**
 * ดึงคำเชิญตามอีเมล
 * @param companyId - ID ขององค์กร
 * @param email - อีเมลของผู้ถูกเชิญ
 * @returns Invitation object หรือ null
 */
export const getInvitationByEmail = async (
    companyId: string,
    email: string
): Promise<Invitation | null> => {
    try {
        const q = query(
            collection(db, INVITATIONS_COLLECTION),
            where('companyId', '==', companyId),
            where('email', '==', email.toLowerCase()),
            where('status', '==', 'pending')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
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
    } catch (error) {
        console.error('❌ ดึงคำเชิญล้มเหลว:', error);
        throw error;
    }
};

/**
 * ดึงรายการคำเชิญทั้งหมดขององค์กร
 * @param companyId - ID ขององค์กร
 * @returns Array ของ Invitation
 */
export const getCompanyInvitations = async (companyId: string): Promise<Invitation[]> => {
    try {
        const q = query(
            collection(db, INVITATIONS_COLLECTION),
            where('companyId', '==', companyId),
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

        console.log(`📋 ดึงคำเชิญในองค์กร ${companyId}: ${invitations.length} คำเชิญ`);
        return invitations;
    } catch (error) {
        console.error('❌ ดึงรายการคำเชิญล้มเหลว:', error);
        throw error;
    }
};

/**
 * ยอมรับคำเชิญ
 * @param token - Token ของคำเชิญ
 * @param userId - User ID ของผู้ยอมรับ
 * @returns Invitation object ที่อัปเดตแล้ว
 */
export const acceptInvitation = async (token: string, userId: string): Promise<Invitation> => {
    try {
        // ดึงข้อมูลคำเชิญ
        const invitation = await getInvitationByToken(token);

        if (!invitation) {
            throw new Error('ไม่พบคำเชิญนี้');
        }

        if (invitation.status !== 'pending') {
            throw new Error('คำเชิญนี้ถูกใช้งานไปแล้วหรือถูกปฏิเสธ');
        }

        // ตรวจสอบวันหมดอายุ
        if (invitation.expiresAt && invitation.expiresAt < new Date()) {
            // อัปเดตสถานะเป็น expired
            await updateDoc(doc(db, INVITATIONS_COLLECTION, invitation.id!), {
                status: 'expired' as InvitationStatus,
                updatedAt: Timestamp.now(),
            });
            throw new Error('คำเชิญนี้หมดอายุแล้ว');
        }

        // อัปเดตสถานะคำเชิญ
        await updateDoc(doc(db, INVITATIONS_COLLECTION, invitation.id!), {
            status: 'accepted' as InvitationStatus,
            acceptedAt: Timestamp.now(),
            acceptedBy: userId,
            updatedAt: Timestamp.now(),
        });

        console.log('✅ ยอมรับคำเชิญสำเร็จ:', invitation.id);

        // Return updated invitation
        return {
            ...invitation,
            status: 'accepted',
            acceptedAt: new Date(),
            acceptedBy: userId,
            updatedAt: new Date(),
        };
    } catch (error) {
        console.error('❌ ยอมรับคำเชิญล้มเหลว:', error);
        throw error;
    }
};

/**
 * ปฏิเสธคำเชิญ
 * @param token - Token ของคำเชิญ
 */
export const rejectInvitation = async (token: string): Promise<void> => {
    try {
        // ดึงข้อมูลคำเชิญ
        const invitation = await getInvitationByToken(token);

        if (!invitation) {
            throw new Error('ไม่พบคำเชิญนี้');
        }

        if (invitation.status !== 'pending') {
            throw new Error('คำเชิญนี้ถูกใช้งานไปแล้วหรือถูกปฏิเสธ');
        }

        // อัปเดตสถานะคำเชิญ
        await updateDoc(doc(db, INVITATIONS_COLLECTION, invitation.id!), {
            status: 'rejected' as InvitationStatus,
            updatedAt: Timestamp.now(),
        });

        console.log('✅ ปฏิเสธคำเชิญสำเร็จ:', invitation.id);
    } catch (error) {
        console.error('❌ ปฏิเสธคำเชิญล้มเหลว:', error);
        throw error;
    }
};

/**
 * ยกเลิกคำเชิญ (โดย Admin)
 * @param invitationId - ID ของคำเชิญ
 */
export const cancelInvitation = async (invitationId: string): Promise<void> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนยกเลิกคำเชิญ');
        }

        // ดึงข้อมูลคำเชิญ
        const invitationRef = doc(db, INVITATIONS_COLLECTION, invitationId);
        const invitationDoc = await getDoc(invitationRef);

        if (!invitationDoc.exists()) {
            throw new Error('ไม่พบคำเชิญนี้');
        }

        const invitationData = invitationDoc.data();

        // ตรวจสอบว่าเป็น Admin หรือไม่
        const isAdmin = await checkIsAdmin(invitationData.companyId, currentUser.uid);
        if (!isAdmin) {
            throw new Error('เฉพาะ Admin เท่านั้นที่สามารถยกเลิกคำเชิญได้');
        }

        // ลบคำเชิญ
        await deleteDoc(invitationRef);

        console.log('✅ ยกเลิกคำเชิญสำเร็จ:', invitationId);
    } catch (error) {
        console.error('❌ ยกเลิกคำเชิญล้มเหลว:', error);
        throw error;
    }
};

/**
 * ส่งคำเชิญใหม่ (Resend)
 * @param invitationId - ID ของคำเชิญ
 * @returns Invitation object ที่อัปเดตแล้ว
 */
export const resendInvitation = async (invitationId: string): Promise<Invitation> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนส่งคำเชิญใหม่');
        }

        // ดึงข้อมูลคำเชิญ
        const invitationRef = doc(db, INVITATIONS_COLLECTION, invitationId);
        const invitationDoc = await getDoc(invitationRef);

        if (!invitationDoc.exists()) {
            throw new Error('ไม่พบคำเชิญนี้');
        }

        const invitationData = invitationDoc.data();

        // ตรวจสอบว่าเป็น Admin หรือไม่
        const isAdmin = await checkIsAdmin(invitationData.companyId, currentUser.uid);
        if (!isAdmin) {
            throw new Error('เฉพาะ Admin เท่านั้นที่สามารถส่งคำเชิญใหม่ได้');
        }

        // สร้าง Token ใหม่
        const newToken = generateInvitationToken();

        // กำหนดวันหมดอายุใหม่ (7 วันจากตอนนี้)
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 7);

        // อัปเดตคำเชิญ
        await updateDoc(invitationRef, {
            token: newToken,
            expiresAt: Timestamp.fromDate(newExpiresAt),
            status: 'pending' as InvitationStatus,
            updatedAt: Timestamp.now(),
        });

        console.log('✅ ส่งคำเชิญใหม่สำเร็จ:', invitationId);

        // Return updated invitation
        return {
            id: invitationId,
            companyId: invitationData.companyId,
            companyName: invitationData.companyName,
            email: invitationData.email,
            role: invitationData.role,
            status: 'pending',
            invitedBy: invitationData.invitedBy,
            invitedByName: invitationData.invitedByName,
            invitedByEmail: invitationData.invitedByEmail,
            token: newToken,
            expiresAt: newExpiresAt,
            message: invitationData.message,
            createdAt: invitationData.createdAt?.toDate(),
            updatedAt: new Date(),
        } as Invitation;
    } catch (error) {
        console.error('❌ ส่งคำเชิญใหม่ล้มเหลว:', error);
        throw error;
    }
};

/**
 * ตรวจสอบและอัปเดตคำเชิญที่หมดอายุ
 * @param companyId - ID ขององค์กร
 */
export const checkExpiredInvitations = async (companyId: string): Promise<void> => {
    try {
        const q = query(
            collection(db, INVITATIONS_COLLECTION),
            where('companyId', '==', companyId),
            where('status', '==', 'pending')
        );

        const querySnapshot = await getDocs(q);
        const now = new Date();

        // อัปเดตคำเชิญที่หมดอายุ
        const updatePromises = querySnapshot.docs
            .filter(doc => {
                const expiresAt = doc.data().expiresAt?.toDate();
                return expiresAt && expiresAt < now;
            })
            .map(doc =>
                updateDoc(doc.ref, {
                    status: 'expired' as InvitationStatus,
                    updatedAt: Timestamp.now(),
                })
            );

        await Promise.all(updatePromises);

        console.log(`✅ ตรวจสอบคำเชิญที่หมดอายุ: ${updatePromises.length} คำเชิญ`);
    } catch (error) {
        console.error('❌ ตรวจสอบคำเชิญที่หมดอายุล้มเหลว:', error);
    }
};

