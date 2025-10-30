/**
 * Customer Management Service
 * บริการจัดการข้อมูลลูกค้าแบบครบวงจร - ลดการกรอกข้อมูลซ้ำ
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
    updateDoc,
} from 'firebase/firestore';

// Collection name
const CUSTOMERS_COLLECTION = 'customers';

// Interface สำหรับ Customer
export interface Customer {
    id?: string;
    companyId: string;          // ID ของบริษัทที่สร้างลูกค้านี้
    userId: string;             // User ที่สร้างลูกค้านี้
    
    // ข้อมูลลูกค้าหลัก
    customerName: string;       // ชื่อลูกค้า/บริษัท
    customerType: 'individual' | 'company';  // ประเภท: บุคคล หรือ นิติบุคคล
    
    // ข้อมูลติดต่อ
    phone: string;              // เบอร์โทรศัพท์หลัก
    alternatePhone?: string;    // เบอร์สำรอง
    email?: string;             // อีเมล
    lineId?: string;            // Line ID
    
    // ที่อยู่
    address: string;            // ที่อยู่หลัก
    district?: string;          // ตำบล/แขวง
    amphoe?: string;            // อำเภอ/เขต
    province?: string;          // จังหวัด
    postalCode?: string;        // รหัสไปรษณีย์
    
    // ข้อมูลโครงการ (สำหรับธุรกิจก่อสร้าง/อสังหา)
    projectName?: string;       // ชื่อโครงการ (ถ้ามี)
    houseNumber?: string;       // บ้านเลขที่/ห้องเลขที่
    
    // Tags และหมายเหตุ
    tags?: string[];            // Tags สำหรับจัดกลุ่ม เช่น ['VIP', 'ลูกค้าประจำ']
    notes?: string;             // หมายเหตุเพิ่มเติม
    
    // Metadata
    lastUsedAt?: Date;          // ใช้ล่าสุดเมื่อไร (สำหรับ sorting)
    usageCount?: number;        // จำนวนครั้งที่ใช้ (สำหรับ suggestion)
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * บันทึกลูกค้าใหม่
 */
export const saveCustomer = async (
    customer: Omit<Customer, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount'>,
    companyId?: string
): Promise<string> => {
    try {
        // ตรวจสอบว่า user login แล้วหรือยัง
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนบันทึกข้อมูลลูกค้า');
        }
        
        // สร้าง ID
        const docId = `customer_${Date.now()}_${customer.customerName.replace(/\s+/g, '_').toLowerCase()}`;
        const docRef = doc(db, CUSTOMERS_COLLECTION, docId);

        await setDoc(docRef, {
            ...customer,
            userId: currentUser.uid,
            companyId: companyId || customer.companyId,
            usageCount: 0, // เริ่มต้นที่ 0
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        console.log('✅ บันทึกข้อมูลลูกค้าสำเร็จ:', docId);
        return docId;
    } catch (error) {
        console.error('❌ Error saving customer:', error);
        throw new Error('ไม่สามารถบันทึกข้อมูลลูกค้าได้');
    }
};

/**
 * ดึงรายการลูกค้าทั้งหมด - เฉพาะของ company ที่เลือก
 * @param companyId - ID ของบริษัท (required)
 */
export const getCustomers = async (companyId: string): Promise<Customer[]> => {
    try {
        // ตรวจสอบว่า user login แล้วหรือยัง
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('กรุณา Login ก่อนดูข้อมูลลูกค้า');
        }
        
        if (!companyId) {
            throw new Error('กรุณาเลือกบริษัทก่อน');
        }
        
        // Query: กรองเฉพาะบริษัทที่เลือก และเรียงตาม lastUsedAt
        const q = query(
            collection(db, CUSTOMERS_COLLECTION),
            where('companyId', '==', companyId),
            orderBy('lastUsedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const customers: Customer[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                companyId: data.companyId,
                userId: data.userId,
                customerName: data.customerName,
                customerType: data.customerType,
                phone: data.phone,
                alternatePhone: data.alternatePhone,
                email: data.email,
                lineId: data.lineId,
                address: data.address,
                district: data.district,
                amphoe: data.amphoe,
                province: data.province,
                postalCode: data.postalCode,
                projectName: data.projectName,
                houseNumber: data.houseNumber,
                tags: data.tags || [],
                notes: data.notes,
                lastUsedAt: data.lastUsedAt?.toDate(),
                usageCount: data.usageCount || 0,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as Customer;
        });

        console.log(`📋 พบลูกค้า ${customers.length} รายการ ในบริษัท ${companyId}`);
        return customers;
    } catch (error) {
        console.error('❌ Error getting customers:', error);
        throw new Error('ไม่สามารถดึงรายการลูกค้าได้');
    }
};

/**
 * ค้นหาลูกค้า
 */
export const searchCustomers = async (companyId: string, searchText: string): Promise<Customer[]> => {
    try {
        const allCustomers = await getCustomers(companyId);
        
        // Filter ด้วย JavaScript
        const searchLower = searchText.toLowerCase();
        const filtered = allCustomers.filter(customer => 
            customer.customerName.toLowerCase().includes(searchLower) ||
            customer.phone.includes(searchText) ||
            (customer.projectName && customer.projectName.toLowerCase().includes(searchLower)) ||
            (customer.email && customer.email.toLowerCase().includes(searchLower))
        );

        console.log(`🔍 พบ ${filtered.length} รายการจากการค้นหา "${searchText}"`);
        return filtered;
    } catch (error) {
        console.error('❌ Error searching customers:', error);
        throw new Error('ไม่สามารถค้นหาลูกค้าได้');
    }
};

/**
 * อัปเดตข้อมูลลูกค้า
 */
export const updateCustomer = async (
    id: string,
    updates: Partial<Omit<Customer, 'id' | 'userId' | 'companyId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
    try {
        const docRef = doc(db, CUSTOMERS_COLLECTION, id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: Timestamp.now(),
        });
        
        console.log('✅ อัปเดตข้อมูลลูกค้าสำเร็จ:', id);
    } catch (error) {
        console.error('❌ Error updating customer:', error);
        throw new Error('ไม่สามารถอัปเดตข้อมูลลูกค้าได้');
    }
};

/**
 * ลบลูกค้า
 */
export const deleteCustomer = async (id: string): Promise<void> => {
    try {
        const docRef = doc(db, CUSTOMERS_COLLECTION, id);
        await deleteDoc(docRef);
        
        console.log('✅ ลบข้อมูลลูกค้าสำเร็จ:', id);
    } catch (error) {
        console.error('❌ Error deleting customer:', error);
        throw new Error('ไม่สามารถลบข้อมูลลูกค้าได้');
    }
};

/**
 * อัปเดตการใช้งานลูกค้า (เรียกทุกครั้งที่เลือกใช้ลูกค้า)
 * เพื่อเก็บสถิติและแสดง suggestion ที่แม่นยำ
 */
export const updateCustomerUsage = async (id: string): Promise<void> => {
    try {
        const docRef = doc(db, CUSTOMERS_COLLECTION, id);
        
        // ดึงข้อมูลปัจจุบัน
        const customers = await getCustomers(''); // ต้องแก้ไขให้รับ companyId
        const customer = customers.find(c => c.id === id);
        
        if (!customer) {
            throw new Error('ไม่พบข้อมูลลูกค้า');
        }
        
        await updateDoc(docRef, {
            lastUsedAt: Timestamp.now(),
            usageCount: (customer.usageCount || 0) + 1,
            updatedAt: Timestamp.now(),
        });
        
        console.log('✅ อัปเดตการใช้งานลูกค้าสำเร็จ:', id);
    } catch (error) {
        console.error('❌ Error updating customer usage:', error);
        // ไม่ throw error เพื่อไม่ให้กระทบการทำงานหลัก
    }
};

/**
 * ดึงลูกค้าที่ใช้บ่อย (Top 10)
 */
export const getFrequentCustomers = async (companyId: string, limit: number = 10): Promise<Customer[]> => {
    try {
        const allCustomers = await getCustomers(companyId);
        
        // เรียงตาม usageCount จากมากไปน้อย
        const sorted = allCustomers
            .filter(c => (c.usageCount || 0) > 0)
            .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
            .slice(0, limit);

        console.log(`⭐ พบลูกค้าที่ใช้บ่อย ${sorted.length} รายการ`);
        return sorted;
    } catch (error) {
        console.error('❌ Error getting frequent customers:', error);
        return [];
    }
};

/**
 * ดึงลูกค้าที่ใช้ล่าสุด (Recent 10)
 */
export const getRecentCustomers = async (companyId: string, limit: number = 10): Promise<Customer[]> => {
    try {
        const allCustomers = await getCustomers(companyId);
        
        // เรียงตาม lastUsedAt จากใหม่ไปเก่า
        const sorted = allCustomers
            .filter(c => c.lastUsedAt)
            .sort((a, b) => {
                const dateA = a.lastUsedAt?.getTime() || 0;
                const dateB = b.lastUsedAt?.getTime() || 0;
                return dateB - dateA;
            })
            .slice(0, limit);

        console.log(`🕒 พบลูกค้าที่ใช้ล่าสุด ${sorted.length} รายการ`);
        return sorted;
    } catch (error) {
        console.error('❌ Error getting recent customers:', error);
        return [];
    }
};

/**
 * ดึงลูกค้าตาม tags
 */
export const getCustomersByTags = async (companyId: string, tags: string[]): Promise<Customer[]> => {
    try {
        const allCustomers = await getCustomers(companyId);
        
        // กรองลูกค้าที่มี tags ที่ระบุ
        const filtered = allCustomers.filter(customer => 
            customer.tags && customer.tags.some(tag => tags.includes(tag))
        );

        console.log(`🏷️ พบลูกค้าที่มี tags ${tags.join(', ')}: ${filtered.length} รายการ`);
        return filtered;
    } catch (error) {
        console.error('❌ Error getting customers by tags:', error);
        return [];
    }
};

