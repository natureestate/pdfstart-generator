/**
 * Service Templates Service
 * จัดการ template สำหรับข้อมูลสินค้า/บริการที่ใช้บ่อย
 */

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { ServiceTemplate } from '../types';

const SERVICE_TEMPLATES_COLLECTION = 'serviceTemplates';

/**
 * บันทึก Service Template ใหม่
 */
export const saveServiceTemplate = async (template: Omit<ServiceTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, SERVICE_TEMPLATES_COLLECTION), {
            ...template,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        
        console.log('✅ บันทึก Service Template สำเร็จ:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error saving service template:', error);
        throw new Error('ไม่สามารถบันทึก template ได้');
    }
};

/**
 * อัปเดต Service Template
 */
export const updateServiceTemplate = async (id: string, updates: Partial<Omit<ServiceTemplate, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
    try {
        const templateRef = doc(db, SERVICE_TEMPLATES_COLLECTION, id);
        await updateDoc(templateRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
        
        console.log('✅ อัปเดต Service Template สำเร็จ:', id);
    } catch (error) {
        console.error('❌ Error updating service template:', error);
        throw new Error('ไม่สามารถอัปเดต template ได้');
    }
};

/**
 * ลบ Service Template
 */
export const deleteServiceTemplate = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, SERVICE_TEMPLATES_COLLECTION, id));
        console.log('✅ ลบ Service Template สำเร็จ:', id);
    } catch (error) {
        console.error('❌ Error deleting service template:', error);
        throw new Error('ไม่สามารถลบ template ได้');
    }
};

/**
 * ดึง Service Templates ทั้งหมดของ User
 */
export const getUserServiceTemplates = async (userId: string): Promise<ServiceTemplate[]> => {
    try {
        const q = query(
            collection(db, SERVICE_TEMPLATES_COLLECTION),
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const templates: ServiceTemplate[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            templates.push({
                id: doc.id,
                serviceName: data.serviceName,
                houseModel: data.houseModel,
                warrantyPeriod: data.warrantyPeriod,
                terms: data.terms,
                userId: data.userId,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
            });
        });

        console.log(`📋 พบ Service Templates ${templates.length} รายการ`);
        return templates;
    } catch (error) {
        console.error('❌ Error fetching service templates:', error);
        throw new Error('ไม่สามารถดึงข้อมูล templates ได้');
    }
};

/**
 * ค้นหา Service Template ตามชื่อบริการ
 */
export const searchServiceTemplates = async (userId: string, searchText: string): Promise<ServiceTemplate[]> => {
    try {
        const allTemplates = await getUserServiceTemplates(userId);
        
        // Filter ด้วย JavaScript เพราะ Firestore ไม่รองรับ text search
        const filtered = allTemplates.filter(template => 
            template.serviceName.toLowerCase().includes(searchText.toLowerCase()) ||
            template.houseModel.toLowerCase().includes(searchText.toLowerCase())
        );

        console.log(`🔍 พบ ${filtered.length} รายการจากการค้นหา "${searchText}"`);
        return filtered;
    } catch (error) {
        console.error('❌ Error searching service templates:', error);
        throw new Error('ไม่สามารถค้นหา templates ได้');
    }
};

/**
 * ดึง Service Template เดียว
 */
export const getServiceTemplate = async (id: string): Promise<ServiceTemplate | null> => {
    try {
        const templates = await getUserServiceTemplates(''); // จะ filter ด้วย id แทน
        return templates.find(t => t.id === id) || null;
    } catch (error) {
        console.error('❌ Error getting service template:', error);
        return null;
    }
};

