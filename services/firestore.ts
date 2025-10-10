// Firestore Service - บริการสำหรับจัดการข้อมูลใน Firestore
// ไฟล์นี้รวมฟังก์ชันสำหรับ CRUD operations กับ Firestore

import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    QueryConstraint
} from "firebase/firestore";
import { db, auth } from "../firebase.config";
import { DeliveryNoteData, WarrantyData } from "../types";

// Collection names
const DELIVERY_NOTES_COLLECTION = "deliveryNotes";
const WARRANTY_CARDS_COLLECTION = "warrantyCards";

/**
 * สร้าง Document ID ที่อ่านง่าย สำหรับใบส่งมอบงาน
 * รูปแบบ: YYMMDD_DN-XXXX (เช่น 250930_DN-2025-001)
 */
const generateDeliveryNoteId = (docNumber: string): string => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    
    // ลบ "DN-" ออกจาก docNumber ถ้ามี แล้วใส่กลับในรูปแบบที่ต้องการ
    const cleanDocNumber = docNumber.replace(/^DN-/i, '');
    return `${yy}${mm}${dd}_DN-${cleanDocNumber}`;
};

/**
 * สร้าง Document ID ที่อ่านง่าย สำหรับใบรับประกันสินค้า
 * รูปแบบ: YYMMDD_MODEL-XXXX (เช่น 251010_A01)
 */
const generateWarrantyCardId = (houseModel: string): string => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    
    // ทำความสะอาด houseModel (ลบอักขระพิเศษออก)
    const cleanModel = houseModel.replace(/[^a-zA-Z0-9]/g, '');
    return `${yy}${mm}${dd}_${cleanModel}`;
};

// Interface สำหรับเอกสารที่บันทึกใน Firestore
export interface FirestoreDocument {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DeliveryNoteDocument extends DeliveryNoteData, FirestoreDocument {}
export interface WarrantyDocument extends WarrantyData, FirestoreDocument {}

// ==================== Delivery Notes Functions ====================

/**
 * บันทึกใบส่งมอบงานใหม่ลง Firestore
 * @param data - ข้อมูลใบส่งมอบงาน
 * @param companyId - ID ของบริษัท (optional)
 */
export const saveDeliveryNote = async (data: DeliveryNoteData, companyId?: string): Promise<string> => {
    try {
        // ตรวจสอบว่า user login แล้วหรือยัง
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("กรุณา Login ก่อนบันทึกข้อมูล");
        }
        
        // สร้าง Document ID ที่อ่านง่าย
        const docId = generateDeliveryNoteId(data.docNumber);
        const docRef = doc(db, DELIVERY_NOTES_COLLECTION, docId);
        
        // เตรียมข้อมูลสำหรับบันทึก - ไม่บันทึก Base64 ถ้ามี logoUrl
        const dataToSave = {
            ...data,
            // ถ้ามี logoUrl (อัปโหลดไปยัง Storage แล้ว) ให้ลบ Base64 ออก
            logo: data.logoUrl ? null : data.logo,
            userId: currentUser.uid, // เพิ่ม userId
            companyId: companyId || null, // เพิ่ม companyId
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        
        await setDoc(docRef, dataToSave);
        
        return docId;
    } catch (error) {
        console.error("Error saving delivery note:", error);
        throw new Error("ไม่สามารถบันทึกใบส่งมอบงานได้");
    }
};

/**
 * ดึงข้อมูลใบส่งมอบงานตาม ID
 */
export const getDeliveryNote = async (id: string): Promise<DeliveryNoteDocument | null> => {
    try {
        const docRef = doc(db, DELIVERY_NOTES_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                date: data.date?.toDate() || null,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as DeliveryNoteDocument;
        }
        return null;
    } catch (error) {
        console.error("Error getting delivery note:", error);
        throw new Error("ไม่สามารถดึงข้อมูลใบส่งมอบงานได้");
    }
};

/**
 * ดึงรายการใบส่งมอบงานทั้งหมด (มีการ limit) - เฉพาะของ user และ company ที่เลือก
 * @param limitCount - จำนวนเอกสารที่ต้องการดึง
 * @param companyId - ID ของบริษัท (optional) ถ้าไม่ระบุจะดึงทั้งหมด
 */
export const getDeliveryNotes = async (limitCount: number = 50, companyId?: string): Promise<DeliveryNoteDocument[]> => {
    try {
        // ตรวจสอบว่า user login แล้วหรือยัง
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("กรุณา Login ก่อนดูข้อมูล");
        }
        
        // สร้าง query constraints
        const constraints: QueryConstraint[] = [
            where("userId", "==", currentUser.uid), // กรองเฉพาะของ user นี้
        ];
        
        // ถ้ามี companyId ให้กรองเฉพาะบริษัทนั้น
        if (companyId) {
            constraints.push(where("companyId", "==", companyId));
        }
        
        constraints.push(orderBy("createdAt", "desc"));
        constraints.push(limit(limitCount));
        
        const q = query(collection(db, DELIVERY_NOTES_COLLECTION), ...constraints);
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate() || null,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as DeliveryNoteDocument;
        });
    } catch (error) {
        console.error("Error getting delivery notes:", error);
        throw new Error("ไม่สามารถดึงรายการใบส่งมอบงานได้");
    }
};

/**
 * อัปเดตใบส่งมอบงาน
 */
export const updateDeliveryNote = async (id: string, data: Partial<DeliveryNoteData>): Promise<void> => {
    try {
        const docRef = doc(db, DELIVERY_NOTES_COLLECTION, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error updating delivery note:", error);
        throw new Error("ไม่สามารถอัปเดตใบส่งมอบงานได้");
    }
};

/**
 * ลบใบส่งมอบงาน
 */
export const deleteDeliveryNote = async (id: string): Promise<void> => {
    try {
        const docRef = doc(db, DELIVERY_NOTES_COLLECTION, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting delivery note:", error);
        throw new Error("ไม่สามารถลบใบส่งมอบงานได้");
    }
};

/**
 * ค้นหาใบส่งมอบงานตามเลขที่เอกสาร
 */
export const searchDeliveryNoteByDocNumber = async (docNumber: string): Promise<DeliveryNoteDocument[]> => {
    try {
        const q = query(
            collection(db, DELIVERY_NOTES_COLLECTION),
            where("docNumber", "==", docNumber)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate() || null,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as DeliveryNoteDocument;
        });
    } catch (error) {
        console.error("Error searching delivery note:", error);
        throw new Error("ไม่สามารถค้นหาใบส่งมอบงานได้");
    }
};

// ==================== Warranty Cards Functions ====================

/**
 * บันทึกใบรับประกันสินค้าใหม่ลง Firestore
 * @param data - ข้อมูลใบรับประกัน
 * @param companyId - ID ของบริษัท (optional)
 */
export const saveWarrantyCard = async (data: WarrantyData, companyId?: string): Promise<string> => {
    try {
        // ตรวจสอบว่า user login แล้วหรือยัง
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("กรุณา Login ก่อนบันทึกข้อมูล");
        }
        
        // สร้าง Document ID ที่อ่านง่าย
        const docId = generateWarrantyCardId(data.houseModel);
        const docRef = doc(db, WARRANTY_CARDS_COLLECTION, docId);
        
        // เตรียมข้อมูลสำหรับบันทึก - ไม่บันทึก Base64 ถ้ามี logoUrl
        const dataToSave = {
            ...data,
            // ถ้ามี logoUrl (อัปโหลดไปยัง Storage แล้ว) ให้ลบ Base64 ออก
            logo: data.logoUrl ? null : data.logo,
            userId: currentUser.uid, // เพิ่ม userId
            companyId: companyId || null, // เพิ่ม companyId
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        
        await setDoc(docRef, dataToSave);
        
        return docId;
    } catch (error) {
        console.error("Error saving warranty card:", error);
        throw new Error("ไม่สามารถบันทึกใบรับประกันสินค้าได้");
    }
};

/**
 * ดึงข้อมูลใบรับประกันสินค้าตาม ID
 */
export const getWarrantyCard = async (id: string): Promise<WarrantyDocument | null> => {
    try {
        const docRef = doc(db, WARRANTY_CARDS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                purchaseDate: data.purchaseDate?.toDate() || null,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as WarrantyDocument;
        }
        return null;
    } catch (error) {
        console.error("Error getting warranty card:", error);
        throw new Error("ไม่สามารถดึงข้อมูลใบรับประกันสินค้าได้");
    }
};

/**
 * ดึงรายการใบรับประกันสินค้าทั้งหมด (มีการ limit) - เฉพาะของ user และ company ที่เลือก
 * @param limitCount - จำนวนเอกสารที่ต้องการดึง
 * @param companyId - ID ของบริษัท (optional) ถ้าไม่ระบุจะดึงทั้งหมด
 */
export const getWarrantyCards = async (limitCount: number = 50, companyId?: string): Promise<WarrantyDocument[]> => {
    try {
        // ตรวจสอบว่า user login แล้วหรือยัง
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("กรุณา Login ก่อนดูข้อมูล");
        }
        
        // สร้าง query constraints
        const constraints: QueryConstraint[] = [
            where("userId", "==", currentUser.uid), // กรองเฉพาะของ user นี้
        ];
        
        // ถ้ามี companyId ให้กรองเฉพาะบริษัทนั้น
        if (companyId) {
            constraints.push(where("companyId", "==", companyId));
        }
        
        constraints.push(orderBy("createdAt", "desc"));
        constraints.push(limit(limitCount));
        
        const q = query(collection(db, WARRANTY_CARDS_COLLECTION), ...constraints);
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                purchaseDate: data.purchaseDate?.toDate() || null,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as WarrantyDocument;
        });
    } catch (error) {
        console.error("Error getting warranty cards:", error);
        throw new Error("ไม่สามารถดึงรายการใบรับประกันสินค้าได้");
    }
};

/**
 * อัปเดตใบรับประกันสินค้า
 */
export const updateWarrantyCard = async (id: string, data: Partial<WarrantyData>): Promise<void> => {
    try {
        const docRef = doc(db, WARRANTY_CARDS_COLLECTION, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error updating warranty card:", error);
        throw new Error("ไม่สามารถอัปเดตใบรับประกันสินค้าได้");
    }
};

/**
 * ลบใบรับประกันสินค้า
 */
export const deleteWarrantyCard = async (id: string): Promise<void> => {
    try {
        const docRef = doc(db, WARRANTY_CARDS_COLLECTION, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting warranty card:", error);
        throw new Error("ไม่สามารถลบใบรับประกันสินค้าได้");
    }
};

/**
 * ค้นหาใบรับประกันสินค้าตามแบบบ้าน
 */
export const searchWarrantyCardByHouseModel = async (houseModel: string): Promise<WarrantyDocument[]> => {
    try {
        const q = query(
            collection(db, WARRANTY_CARDS_COLLECTION),
            where("houseModel", "==", houseModel)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                purchaseDate: data.purchaseDate?.toDate() || null,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as WarrantyDocument;
        });
    } catch (error) {
        console.error("Error searching warranty card:", error);
        throw new Error("ไม่สามารถค้นหาใบรับประกันสินค้าได้");
    }
};

// Export ชื่อเดิมเพื่อ backward compatibility
export const searchWarrantyCardBySerialNumber = searchWarrantyCardByHouseModel;
