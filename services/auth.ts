/**
 * Authentication Service
 * บริการจัดการ Firebase Authentication ด้วย Google OAuth และ Phone Authentication
 */

import { auth } from '../firebase.config';
import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    User,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
} from 'firebase/auth';

// สร้าง Google Provider
const googleProvider = new GoogleAuthProvider();

// กำหนด scopes ที่ต้องการ (optional)
googleProvider.addScope('profile');
googleProvider.addScope('email');

/**
 * Login ด้วย Google OAuth
 * @returns Promise<User> - ข้อมูลผู้ใช้ที่ login สำเร็จ
 */
export const signInWithGoogle = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        
        // ดึงข้อมูลผู้ใช้
        const user = result.user;
        
        // ดึง Google Access Token (ถ้าต้องการใช้งาน Google APIs)
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        
        console.log('✅ Login สำเร็จ:', {
            name: user.displayName,
            email: user.email,
            uid: user.uid,
        });
        
        return user;
    } catch (error: any) {
        console.error('❌ Login ล้มเหลว:', error);
        
        // จัดการ error codes ต่างๆ
        const errorCode = error.code;
        const errorMessage = error.message;
        
        // แปล error message เป็นภาษาไทย
        let thaiErrorMessage = 'เกิดข้อผิดพลาดในการ Login';
        
        switch (errorCode) {
            case 'auth/popup-closed-by-user':
                thaiErrorMessage = 'คุณปิดหน้าต่าง Login';
                break;
            case 'auth/cancelled-popup-request':
                thaiErrorMessage = 'มีการร้องขอ Login อื่นอยู่แล้ว';
                break;
            case 'auth/popup-blocked':
                thaiErrorMessage = 'เบราว์เซอร์บล็อก popup กรุณาอนุญาต popup';
                break;
            case 'auth/network-request-failed':
                thaiErrorMessage = 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้';
                break;
            case 'auth/too-many-requests':
                thaiErrorMessage = 'มีการพยายาม Login มากเกินไป กรุณารอสักครู่';
                break;
            default:
                thaiErrorMessage = errorMessage || 'เกิดข้อผิดพลาดในการ Login';
        }
        
        throw new Error(thaiErrorMessage);
    }
};

/**
 * Logout
 */
export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
        console.log('✅ Logout สำเร็จ');
    } catch (error) {
        console.error('❌ Logout ล้มเหลว:', error);
        throw new Error('ไม่สามารถ Logout ได้');
    }
};

/**
 * ติดตามสถานะการ Login
 * @param callback - ฟังก์ชันที่จะถูกเรียกเมื่อสถานะเปลี่ยน
 * @returns unsubscribe function
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
    return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบัน
 * @returns User | null
 */
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

/**
 * ตรวจสอบว่า user login แล้วหรือยัง
 * @returns boolean
 */
export const isAuthenticated = (): boolean => {
    return auth.currentUser !== null;
};

// ==================== Phone Authentication ====================

/**
 * สร้าง RecaptchaVerifier สำหรับ Phone Authentication
 * @param elementId - ID ของ element ที่จะแสดง reCAPTCHA (ใช้ invisible mode)
 * @returns RecaptchaVerifier instance
 */
export const createRecaptchaVerifier = (elementId: string): RecaptchaVerifier => {
    // ตรวจสอบว่าเป็น localhost หรือไม่
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
        console.log('🔧 Development Mode: ใช้ reCAPTCHA แบบ visible สำหรับ localhost');
        // ใช้ visible mode สำหรับ localhost เพื่อให้ทดสอบได้ง่าย
        return new RecaptchaVerifier(auth, elementId, {
            size: 'normal', // เปลี่ยนเป็น normal เพื่อให้เห็น checkbox
            callback: () => {
                console.log('✅ reCAPTCHA resolved สำหรับ Phone Auth (localhost)');
            },
            'expired-callback': () => {
                console.warn('⚠️ reCAPTCHA หมดอายุ');
            }
        });
    }
    
    // Production: ใช้ invisible mode
    return new RecaptchaVerifier(auth, elementId, {
        size: 'invisible',
        callback: () => {
            console.log('✅ reCAPTCHA resolved สำหรับ Phone Auth');
        },
        'expired-callback': () => {
            console.warn('⚠️ reCAPTCHA หมดอายุ');
        }
    });
};

/**
 * ส่ง OTP ไปยังเบอร์โทรศัพท์
 * @param phoneNumber - เบอร์โทรศัพท์ในรูปแบบ +66XXXXXXXXX
 * @param recaptchaVerifier - RecaptchaVerifier instance
 * @returns Promise<ConfirmationResult> - ใช้สำหรับยืนยัน OTP
 */
export const sendPhoneOTP = async (
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
    try {
        console.log('📱 กำลังส่ง OTP ไปยัง:', phoneNumber);
        
        const confirmationResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            recaptchaVerifier
        );
        
        console.log('✅ ส่ง OTP สำเร็จ');
        return confirmationResult;
    } catch (error: any) {
        console.error('❌ ส่ง OTP ล้มเหลว:', error);
        
        // แปล error message เป็นภาษาไทย
        const errorCode = error.code;
        let thaiErrorMessage = 'ไม่สามารถส่ง OTP ได้';
        
        switch (errorCode) {
            case 'auth/invalid-phone-number':
                thaiErrorMessage = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
                break;
            case 'auth/missing-phone-number':
                thaiErrorMessage = 'กรุณากรอกเบอร์โทรศัพท์';
                break;
            case 'auth/quota-exceeded':
                thaiErrorMessage = 'ส่ง SMS เกินโควต้า กรุณาลองใหม่ภายหลัง';
                break;
            case 'auth/user-disabled':
                thaiErrorMessage = 'บัญชีนี้ถูกระงับการใช้งาน';
                break;
            case 'auth/operation-not-allowed':
                thaiErrorMessage = 'ระบบยังไม่เปิดใช้งาน Phone Authentication';
                break;
            case 'auth/too-many-requests':
                thaiErrorMessage = 'มีการส่ง OTP มากเกินไป กรุณารอสักครู่';
                break;
            case 'auth/captcha-check-failed':
                thaiErrorMessage = 'การตรวจสอบ reCAPTCHA ล้มเหลว กรุณาลองใหม่';
                break;
            default:
                thaiErrorMessage = error.message || 'ไม่สามารถส่ง OTP ได้';
        }
        
        throw new Error(thaiErrorMessage);
    }
};

/**
 * ยืนยัน OTP และ Login
 * @param confirmationResult - ผลจากการส่ง OTP
 * @param otp - รหัส OTP 6 หลัก
 * @returns Promise<User> - ข้อมูลผู้ใช้ที่ login สำเร็จ
 */
export const verifyPhoneOTP = async (
    confirmationResult: ConfirmationResult,
    otp: string
): Promise<User> => {
    try {
        console.log('🔐 กำลังยืนยัน OTP...');
        
        const result = await confirmationResult.confirm(otp);
        const user = result.user;
        
        console.log('✅ Login ด้วยเบอร์โทรศัพท์สำเร็จ:', {
            phoneNumber: user.phoneNumber,
            uid: user.uid,
        });
        
        return user;
    } catch (error: any) {
        console.error('❌ ยืนยัน OTP ล้มเหลว:', error);
        
        // แปล error message เป็นภาษาไทย
        const errorCode = error.code;
        let thaiErrorMessage = 'ไม่สามารถยืนยัน OTP ได้';
        
        switch (errorCode) {
            case 'auth/invalid-verification-code':
                thaiErrorMessage = 'รหัส OTP ไม่ถูกต้อง';
                break;
            case 'auth/code-expired':
                thaiErrorMessage = 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่';
                break;
            case 'auth/missing-verification-code':
                thaiErrorMessage = 'กรุณากรอกรหัส OTP';
                break;
            case 'auth/session-expired':
                thaiErrorMessage = 'Session หมดอายุ กรุณาขอรหัส OTP ใหม่';
                break;
            default:
                thaiErrorMessage = error.message || 'ไม่สามารถยืนยัน OTP ได้';
        }
        
        throw new Error(thaiErrorMessage);
    }
};
