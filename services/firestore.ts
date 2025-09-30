// Firestore Service - บริการสำหรับจัดการข้อมูลใน Firestore
// ไฟล์นี้รวมฟังก์ชันสำหรับ CRUD operations กับ Firestore

import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    QueryConstraint
} from "firebase/firestore";
import { db } from "../firebase.config";
import { DeliveryNoteData, WarrantyData } from "../types";

// Collection names
const DELIVERY_NOTES_COLLECTION = "deliveryNotes";
const WARRANTY_CARDS_COLLECTION = "warrantyCards";

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
 */
export const saveDeliveryNote = async (data: DeliveryNoteData): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, DELIVERY_NOTES_COLLECTION), {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return docRef.id;
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
 * ดึงรายการใบส่งมอบงานทั้งหมด (มีการ limit)
 */
export const getDeliveryNotes = async (limitCount: number = 50): Promise<DeliveryNoteDocument[]> => {
    try {
        const q = query(
            collection(db, DELIVERY_NOTES_COLLECTION),
            orderBy("createdAt", "desc"),
            limit(limitCount)
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
 */
export const saveWarrantyCard = async (data: WarrantyData): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, WARRANTY_CARDS_COLLECTION), {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return docRef.id;
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
 * ดึงรายการใบรับประกันสินค้าทั้งหมด (มีการ limit)
 */
export const getWarrantyCards = async (limitCount: number = 50): Promise<WarrantyDocument[]> => {
    try {
        const q = query(
            collection(db, WARRANTY_CARDS_COLLECTION),
            orderBy("createdAt", "desc"),
            limit(limitCount)
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
 * ค้นหาใบรับประกันสินค้าตามหมายเลขเครื่อง
 */
export const searchWarrantyCardBySerialNumber = async (serialNumber: string): Promise<WarrantyDocument[]> => {
    try {
        const q = query(
            collection(db, WARRANTY_CARDS_COLLECTION),
            where("serialNumber", "==", serialNumber)
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
