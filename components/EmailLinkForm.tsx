/**
 * Email Link Authentication Form
 * Form สำหรับ Passwordless Login ด้วย Email Link
 */

import React, { useState, useEffect } from 'react';
import { sendEmailLoginLink, checkIsEmailLink, signInWithEmailLinkAuth } from '../services/auth';

interface EmailLinkFormProps {
    onSuccess?: () => void;
}

export const EmailLinkForm: React.FC<EmailLinkFormProps> = ({ onSuccess }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    /**
     * ตรวจสอบว่า URL ปัจจุบันเป็น Email Link หรือไม่
     * (เมื่อ user คลิก link จาก email)
     */
    useEffect(() => {
        const verifyEmailLink = async () => {
            // ตรวจสอบว่าเป็น email link หรือไม่
            if (checkIsEmailLink()) {
                console.log('🔗 ตรวจพบ Email Link, กำลังยืนยัน...');
                setIsVerifying(true);
                setError(null);

                try {
                    // ดึง email จาก localStorage
                    const savedEmail = window.localStorage.getItem('emailForSignIn');
                    
                    if (!savedEmail) {
                        // ถ้าไม่มี email ใน localStorage ให้ผู้ใช้กรอก
                        setError('กรุณากรอกอีเมลที่ใช้ส่ง link');
                        setIsVerifying(false);
                        return;
                    }

                    // ยืนยัน email link
                    await signInWithEmailLinkAuth(savedEmail);
                    setSuccess('✅ Login สำเร็จ!');

                    // เรียก callback ถ้ามี
                    if (onSuccess) {
                        setTimeout(() => onSuccess(), 500);
                    }
                } catch (err: any) {
                    console.error('❌ ยืนยัน Email Link ล้มเหลว:', err);
                    setError(err.message || 'ไม่สามารถยืนยัน Email Link ได้');
                } finally {
                    setIsVerifying(false);
                }
            }
        };

        verifyEmailLink();
    }, [onSuccess]);

    /**
     * จัดการส่ง Email Link
     */
    const handleSendLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validation
        if (!email) {
            setError('กรุณากรอกอีเมล');
            return;
        }

        // ตรวจสอบรูปแบบอีเมล
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('รูปแบบอีเมลไม่ถูกต้อง');
            return;
        }

        try {
            setLoading(true);
            await sendEmailLoginLink(email);
            setSuccess('✅ ส่ง Email สำเร็จ! กรุณาตรวจสอบกล่องจดหมายของคุณ');
            setEmail(''); // ล้างฟอร์ม
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการส่ง Email');
        } finally {
            setLoading(false);
        }
    };

    /**
     * จัดการยืนยัน Email Link (กรณีผู้ใช้กรอก email เอง)
     */
    const handleManualVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email) {
            setError('กรุณากรอกอีเมล');
            return;
        }

        try {
            setIsVerifying(true);
            await signInWithEmailLinkAuth(email);
            setSuccess('✅ Login สำเร็จ!');

            // เรียก callback ถ้ามี
            if (onSuccess) {
                setTimeout(() => onSuccess(), 500);
            }
        } catch (err: any) {
            setError(err.message || 'ไม่สามารถยืนยัน Email Link ได้');
        } finally {
            setIsVerifying(false);
        }
    };

    // ถ้ากำลังยืนยัน Email Link
    if (isVerifying) {
        return (
            <div className="w-full max-w-md mx-auto text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <svg
                        className="animate-spin h-12 w-12 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <p className="text-lg font-medium text-gray-700">กำลังยืนยัน Email Link...</p>
                    <p className="text-sm text-gray-500">กรุณารอสักครู่</p>
                </div>
            </div>
        );
    }

    // ถ้าเป็น Email Link แต่ไม่มี email ใน localStorage
    if (checkIsEmailLink() && !window.localStorage.getItem('emailForSignIn')) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="mb-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">ยืนยัน Email</h3>
                    <p className="text-sm text-gray-600">
                        กรุณากรอกอีเมลที่คุณใช้ส่ง link เพื่อยืนยันตัวตน
                    </p>
                </div>

                <form onSubmit={handleManualVerify} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            อีเมล
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isVerifying}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isVerifying}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                            isVerifying
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                        }`}
                    >
                        ยืนยันตัวตน
                    </button>
                </form>
            </div>
        );
    }

    // Form ปกติสำหรับส่ง Email Link
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Login ไม่ต้องใช้รหัสผ่าน</h3>
                <p className="text-sm text-gray-600">
                    เราจะส่ง link ไปยังอีเมลของคุณ คลิก link เพื่อ login ทันที
                </p>
            </div>

            <form onSubmit={handleSendLink} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        อีเมล
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                        required
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-600">{success}</p>
                        <p className="text-xs text-green-500 mt-1">
                            💡 ตรวจสอบทั้งกล่องจดหมายหลักและโฟลเดอร์ Spam
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                        loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
                    }`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            กำลังส่ง Email...
                        </span>
                    ) : (
                        '📧 ส่ง Link ไปยังอีเมล'
                    )}
                </button>

                {/* Info */}
                <div className="text-center text-xs text-gray-500">
                    <p>Link จะหมดอายุภายใน 1 ชั่วโมง</p>
                </div>
            </form>
        </div>
    );
};

