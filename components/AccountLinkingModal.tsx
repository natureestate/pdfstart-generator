/**
 * Account Linking Modal
 * Modal สำหรับแนะนำและจัดการ Account Linking
 */

import React, { useState } from 'react';
import { linkWithGoogle, linkWithEmailPassword, signInWithGoogle, checkEmailProviders } from '../services/auth';

interface AccountLinkingModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    existingProviders: string[]; // providers ที่มีอยู่แล้ว
    currentProvider: 'email' | 'google'; // provider ที่กำลังพยายาม login
}

export const AccountLinkingModal: React.FC<AccountLinkingModalProps> = ({
    isOpen,
    onClose,
    email,
    existingProviders,
    currentProvider,
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    if (!isOpen) return null;

    /**
     * แปลง provider ID เป็นชื่อที่อ่านง่าย
     */
    const getProviderName = (providerId: string): string => {
        switch (providerId) {
            case 'google.com':
                return 'Google';
            case 'password':
                return 'Email/Password';
            case 'phone':
                return 'เบอร์โทรศัพท์';
            default:
                return providerId;
        }
    };

    /**
     * Login ด้วย Provider ที่มีอยู่แล้ว
     */
    const handleLoginWithExisting = async () => {
        setLoading(true);
        setError(null);

        try {
            if (existingProviders.includes('google.com')) {
                // Login ด้วย Google
                await signInWithGoogle();
                onClose();
            } else if (existingProviders.includes('password')) {
                // แสดง input password
                setShowPasswordInput(true);
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด');
            setLoading(false);
        }
    };

    /**
     * Login ด้วย Google แล้ว Link กับ Email/Password
     */
    const handleLinkAfterGoogleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Login ด้วย Google ก่อน
            await signInWithGoogle();
            
            // 2. แสดง input password เพื่อ Link
            setShowPasswordInput(true);
            setLoading(false);
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด');
            setLoading(false);
        }
    };

    /**
     * Link Email/Password หลังจาก Login ด้วย Google แล้ว
     */
    const handleLinkEmailPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!password) {
            setError('กรุณากรอกรหัสผ่าน');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await linkWithEmailPassword(email, password);
            alert('✅ Link สำเร็จ! ตอนนี้คุณสามารถ Login ได้ทั้ง Google และ Email/Password');
            onClose();
        } catch (err: any) {
            setError(err.message || 'ไม่สามารถ Link ได้');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Link Google หลังจาก Login ด้วย Email/Password แล้ว
     */
    const handleLinkGoogle = async () => {
        setLoading(true);
        setError(null);

        try {
            await linkWithGoogle();
            alert('✅ Link สำเร็จ! ตอนนี้คุณสามารถ Login ได้ทั้ง Google และ Email/Password');
            onClose();
        } catch (err: any) {
            setError(err.message || 'ไม่สามารถ Link ได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        🔗 Account Linking
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* ข้อความแจ้งเตือน */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>อีเมล:</strong> {email}
                        </p>
                        <p className="text-sm text-blue-800 mt-2">
                            อีเมลนี้มีการ Login ด้วย:{' '}
                            <strong>{existingProviders.map(getProviderName).join(', ')}</strong>
                        </p>
                    </div>

                    {/* แสดง Password Input (ถ้าจำเป็น) */}
                    {showPasswordInput ? (
                        <form onSubmit={handleLinkEmailPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ตั้งรหัสผ่านสำหรับ Email/Password Login
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="อย่างน้อย 6 ตัวอักษร"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loading}
                                    required
                                    minLength={6}
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                            >
                                {loading ? 'กำลัง Link...' : '🔗 Link Email/Password'}
                            </button>
                        </form>
                    ) : (
                        <>
                            {/* ตัวเลือก */}
                            <div className="space-y-3">
                                {/* ตัวเลือก 1: Login ด้วย Provider ที่มีอยู่ */}
                                <div className="border-2 border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-800 mb-2">
                                        ตัวเลือก 1: Login ด้วย {existingProviders.map(getProviderName).join(', ')}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        ใช้วิธี Login ที่มีอยู่แล้ว
                                    </p>
                                    <button
                                        onClick={handleLoginWithExisting}
                                        disabled={loading}
                                        className="w-full py-2 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'กำลังดำเนินการ...' : '✅ Login ด้วย ' + existingProviders.map(getProviderName).join(', ')}
                                    </button>
                                </div>

                                {/* ตัวเลือก 2: Link accounts */}
                                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                                    <h4 className="font-semibold text-gray-800 mb-2">
                                        ตัวเลือก 2: Link Accounts
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        เชื่อมโยง accounts เข้าด้วยกัน เพื่อ Login ได้หลายวิธี
                                    </p>
                                    
                                    {currentProvider === 'email' && existingProviders.includes('google.com') && (
                                        <button
                                            onClick={handleLinkAfterGoogleLogin}
                                            disabled={loading}
                                            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'กำลังดำเนินการ...' : '🔗 Login ด้วย Google แล้ว Link Email/Password'}
                                        </button>
                                    )}

                                    {currentProvider === 'google' && existingProviders.includes('password') && (
                                        <button
                                            onClick={handleLinkGoogle}
                                            disabled={loading}
                                            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'กำลังดำเนินการ...' : '🔗 Link กับ Google'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* ข้อมูลเพิ่มเติม */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                            💡 <strong>Account Linking คืออะไร?</strong>
                            <br />
                            การเชื่อมโยง accounts ทำให้คุณสามารถ Login ได้หลายวิธี (เช่น ทั้ง Google และ Email/Password) ด้วยอีเมลเดียวกัน
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

