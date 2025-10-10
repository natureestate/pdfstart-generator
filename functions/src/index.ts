/**
 * Firebase Cloud Functions
 * รวมฟังก์ชันต่างๆ สำหรับ backend
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Interface สำหรับ request และ response
 */
interface VerifyRecaptchaRequest {
    token: string;
    action: string;
}

interface VerifyRecaptchaResponse {
    success: boolean;
    score: number;
    action: string;
    message?: string;
}

/**
 * Cloud Function สำหรับ verify reCAPTCHA token (v2 with App Check)
 * 
 * @param request - { data: { token: string, action: string }, app: AppCheckData }
 * @returns { success: boolean, score: number, action: string }
 */
export const verifyRecaptcha = onCall(
    {
        enforceAppCheck: true, // บังคับให้มี valid App Check token
    },
    async (request): Promise<VerifyRecaptchaResponse> => {
        const { token, action } = request.data as VerifyRecaptchaRequest;

        // Log App Check info
        console.log('App Check verified:', {
            appId: request.app?.appId,
            alreadyConsumed: request.app?.alreadyConsumed,
        });

        // ตรวจสอบ input
        if (!token || !action) {
            throw new HttpsError(
                'invalid-argument',
                'กรุณาระบุ token และ action'
            );
        }

        try {
            // ดึง Secret Key จาก environment config
            const secretKey = functions.config().recaptcha?.secret_key;

            if (!secretKey) {
                // ถ้ายังไม่ได้ตั้งค่า secret key ให้ผ่านไปก่อน (สำหรับ development)
                console.warn('⚠️ reCAPTCHA Secret Key ยังไม่ได้ตั้งค่า');
                return {
                    success: true,
                    score: 1.0,
                    action,
                    message: 'Secret key not configured, bypassing verification'
                };
            }

            // เรียก Google reCAPTCHA API เพื่อ verify token
            const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
            const params = new URLSearchParams({
                secret: secretKey,
                response: token,
            });

            const response = await fetch(verifyUrl, {
                method: 'POST',
                body: params,
            });

            const result = await response.json() as {
                success: boolean;
                score: number;
                action: string;
                challenge_ts: string;
                hostname: string;
                'error-codes'?: string[];
            };

            // ตรวจสอบผลลัพธ์
            if (!result.success) {
                console.error('reCAPTCHA verification failed:', result['error-codes']);
                return {
                    success: false,
                    score: 0,
                    action,
                    message: 'การตรวจสอบ reCAPTCHA ล้มเหลว'
                };
            }

            // ตรวจสอบว่า action ตรงกันหรือไม่
            if (result.action !== action) {
                console.error('Action mismatch:', {
                    expected: action,
                    received: result.action
                });
                return {
                    success: false,
                    score: result.score,
                    action: result.action,
                    message: 'Action ไม่ตรงกัน'
                };
            }

            // Log score สำหรับ monitoring
            console.log('reCAPTCHA verification:', {
                action,
                score: result.score,
                hostname: result.hostname,
                timestamp: result.challenge_ts
            });

            // Return ผลลัพธ์
            return {
                success: true,
                score: result.score,
                action: result.action,
                message: result.score >= 0.5 
                    ? 'ผ่านการตรวจสอบ' 
                    : 'Score ต่ำกว่าเกณฑ์'
            };

        } catch (error) {
            console.error('Error verifying reCAPTCHA:', error);
            throw new HttpsError(
                'internal',
                'เกิดข้อผิดพลาดในการตรวจสอบ reCAPTCHA'
            );
        }
    }
);
