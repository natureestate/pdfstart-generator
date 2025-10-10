/**
 * Logo Storage Service
 * บริการจัดการการอัปโหลด ลบ และดึง URL ของโลโก้จาก Firebase Storage
 */

import { storage } from '../firebase.config';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject,
    uploadString,
    listAll,
    getMetadata,
    getBlob
} from 'firebase/storage';

// กำหนด path สำหรับเก็บโลโก้ใน Storage
const LOGO_STORAGE_PATH = 'logos';

// Interface สำหรับข้อมูลโลโก้
export interface LogoItem {
    name: string;           // ชื่อไฟล์
    url: string;            // URL สำหรับดาวน์โหลด
    fullPath: string;       // path เต็มใน Storage
    size: number;           // ขนาดไฟล์ (bytes)
    uploadedAt: Date;       // วันที่อัปโหลด
    contentType?: string;   // ประเภทไฟล์
}

/**
 * อัปโหลดโลโก้จาก File object
 * @param file - ไฟล์รูปภาพที่จะอัปโหลด
 * @param customName - ชื่อไฟล์ที่กำหนดเอง (optional)
 * @returns URL ของโลโก้ที่อัปโหลด
 */
export const uploadLogoFile = async (file: File, customName?: string): Promise<string> => {
    try {
        // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
        const timestamp = Date.now();
        const fileName = customName || `${timestamp}-${file.name}`;
        const logoRef = ref(storage, `${LOGO_STORAGE_PATH}/${fileName}`);

        // อัปโหลดไฟล์
        const snapshot = await uploadBytes(logoRef, file);
        
        // ดึง URL สำหรับดาวน์โหลด
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        console.log('Logo uploaded successfully:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading logo:', error);
        throw new Error('ไม่สามารถอัปโหลดโลโก้ได้');
    }
};

/**
 * อัปโหลดโลโก้จาก Base64 string
 * @param base64String - รูปภาพในรูปแบบ Base64
 * @param customName - ชื่อไฟล์ที่กำหนดเอง (optional)
 * @returns URL ของโลโก้ที่อัปโหลด
 */
export const uploadLogoBase64 = async (base64String: string, customName?: string): Promise<string> => {
    try {
        // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
        const timestamp = Date.now();
        const fileName = customName || `logo-${timestamp}.jpg`;
        const logoRef = ref(storage, `${LOGO_STORAGE_PATH}/${fileName}`);

        // อัปโหลด Base64 string
        const snapshot = await uploadString(logoRef, base64String, 'data_url');
        
        // ดึง URL สำหรับดาวน์โหลด
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        console.log('Logo uploaded successfully:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading logo:', error);
        throw new Error('ไม่สามารถอัปโหลดโลโก้ได้');
    }
};

/**
 * ลบโลโก้จาก Storage
 * @param logoUrl - URL ของโลโก้ที่ต้องการลบ
 */
export const deleteLogo = async (logoUrl: string): Promise<void> => {
    try {
        // ตรวจสอบว่าเป็น URL จาก Firebase Storage หรือไม่
        if (!logoUrl.includes('firebasestorage.googleapis.com')) {
            console.log('Not a Firebase Storage URL, skipping delete');
            return;
        }

        // สร้าง reference จาก URL
        const logoRef = ref(storage, logoUrl);
        
        // ลบไฟล์
        await deleteObject(logoRef);
        console.log('Logo deleted successfully');
    } catch (error) {
        console.error('Error deleting logo:', error);
        throw new Error('ไม่สามารถลบโลโก้ได้');
    }
};

/**
 * ดึง URL ของโลโก้จาก Storage path
 * @param logoPath - path ของโลโก้ใน Storage
 * @returns URL ของโลโก้
 */
export const getLogoUrl = async (logoPath: string): Promise<string> => {
    try {
        const logoRef = ref(storage, logoPath);
        const downloadURL = await getDownloadURL(logoRef);
        return downloadURL;
    } catch (error) {
        console.error('Error getting logo URL:', error);
        throw new Error('ไม่สามารถดึง URL โลโก้ได้');
    }
};

/**
 * สร้าง reference path จาก full URL
 * @param url - Full URL จาก Firebase Storage
 * @returns Storage path
 */
export const getStoragePathFromUrl = (url: string): string | null => {
    try {
        // ตัวอย่าง URL: https://firebasestorage.googleapis.com/v0/b/bucket/o/logos%2Ffile.jpg?alt=media&token=xxx
        const match = url.match(/\/o\/(.+?)\?/);
        if (match && match[1]) {
            return decodeURIComponent(match[1]);
        }
        return null;
    } catch (error) {
        console.error('Error parsing storage path:', error);
        return null;
    }
};

/**
 * ตรวจสอบว่าเป็น default logo หรือไม่
 * @param logoUrl - URL หรือ path ของโลโก้
 * @returns true ถ้าเป็น default logo
 */
export const isDefaultLogo = (logoUrl: string | null): boolean => {
    if (!logoUrl) return true;
    return logoUrl.includes('/assets/default-logo') || logoUrl.startsWith('/assets/');
};

/**
 * ดึง default logo URL
 * @returns URL ของ default logo
 */
export const getDefaultLogoUrl = (): string => {
    return '/assets/default-logo.svg';
};

/**
 * ดึงรายการโลโก้ทั้งหมดจาก Storage
 * @returns Array ของ LogoItem
 */
export const listAllLogos = async (): Promise<LogoItem[]> => {
    try {
        const logosRef = ref(storage, LOGO_STORAGE_PATH);
        const result = await listAll(logosRef);
        
        // ดึงข้อมูลของแต่ละไฟล์
        const logoPromises = result.items.map(async (itemRef) => {
            try {
                const [url, metadata] = await Promise.all([
                    getDownloadURL(itemRef),
                    getMetadata(itemRef)
                ]);
                
                return {
                    name: itemRef.name,
                    url: url,
                    fullPath: itemRef.fullPath,
                    size: metadata.size,
                    uploadedAt: new Date(metadata.timeCreated),
                    contentType: metadata.contentType
                } as LogoItem;
            } catch (error) {
                console.error(`Error getting metadata for ${itemRef.name}:`, error);
                return null;
            }
        });
        
        const logos = await Promise.all(logoPromises);
        
        // กรองเอาเฉพาะที่ไม่เป็น null และเรียงตามวันที่อัปโหลด (ใหม่สุดก่อน)
        return logos
            .filter((logo): logo is LogoItem => logo !== null)
            .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    } catch (error) {
        console.error('Error listing logos:', error);
        throw new Error('ไม่สามารถดึงรายการโลโก้ได้');
    }
};

/**
 * ลบโลโก้จาก Storage โดยใช้ full path
 * @param fullPath - full path ของโลโก้ใน Storage
 */
export const deleteLogoByPath = async (fullPath: string): Promise<void> => {
    try {
        const logoRef = ref(storage, fullPath);
        await deleteObject(logoRef);
        console.log('Logo deleted successfully:', fullPath);
    } catch (error) {
        console.error('Error deleting logo:', error);
        throw new Error('ไม่สามารถลบโลโก้ได้');
    }
};

/**
 * แปลงขนาดไฟล์เป็นรูปแบบที่อ่านง่าย
 * @param bytes - ขนาดไฟล์ในหน่วย bytes
 * @returns ขนาดไฟล์ในรูปแบบที่อ่านง่าย (เช่น "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * แปลงรูปภาพจาก Storage path เป็น Base64 เพื่อหลีกเลี่ยงปัญหา CORS
 * ใช้ Firebase SDK ดึง blob แล้วแปลงเป็น Base64
 * @param storagePath - path ของรูปใน Storage (เช่น "logos/logo-123.jpg")
 * @returns Base64 string หรือ null หากเกิดข้อผิดพลาด
 */
export const getImageAsBase64FromPath = async (storagePath: string): Promise<string | null> => {
    try {
        console.log('Converting image to Base64 from path:', storagePath);
        const imageRef = ref(storage, storagePath);
        const blob = await getBlob(imageRef);
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('Successfully converted image to Base64 via Firebase SDK');
                resolve(reader.result as string);
            };
            reader.onerror = (error) => {
                console.error('FileReader error:', error);
                reject(error);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting image to base64:', error);
        return null;
    }
};

/**
 * แปลง Firebase Storage URL เป็น Base64 โดยใช้ Firebase SDK
 * วิธีนี้จะไม่มีปัญหา CORS เพราะใช้ Firebase SDK authentication
 * @param url - Firebase Storage URL
 * @returns Base64 string หรือ null หากเกิดข้อผิดพลาด
 */
export const convertStorageUrlToBase64 = async (url: string): Promise<string | null> => {
    try {
        console.log('Converting Storage URL to Base64:', url);
        
        // ตรวจสอบว่าเป็น Firebase Storage URL หรือไม่
        if (!url.includes('firebasestorage.googleapis.com')) {
            console.log('Not a Firebase Storage URL, skipping conversion');
            return url; // คืนค่า URL เดิม ถ้าไม่ใช่ Firebase Storage
        }

        // Extract path from URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
        const storagePath = getStoragePathFromUrl(url);
        if (!storagePath) {
            console.error('Could not extract storage path from URL');
            return null;
        }

        // ใช้ Firebase SDK ดึง blob และแปลงเป็น Base64
        return await getImageAsBase64FromPath(storagePath);
    } catch (error) {
        console.error('Error converting storage URL to base64:', error);
        return null;
    }
};

/**
 * ตรวจสอบว่า URL ต้องการการแปลงเป็น Base64 หรือไม่
 * @param url - URL ที่ต้องการตรวจสอบ
 * @returns true ถ้าต้องการแปลง (เป็น Firebase Storage URL)
 */
export const needsBase64Conversion = (url: string | null): boolean => {
    if (!url) return false;
    
    // ถ้าเป็น Base64 อยู่แล้ว ไม่ต้องแปลง
    if (url.startsWith('data:')) return false;
    
    // ถ้าเป็น local path ไม่ต้องแปลง
    if (url.startsWith('/')) return false;
    
    // ถ้าเป็น Firebase Storage URL ต้องแปลง
    if (url.includes('firebasestorage.googleapis.com')) return true;
    
    return false;
};

