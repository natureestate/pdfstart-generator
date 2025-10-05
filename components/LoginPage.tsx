/**
 * Login Page Component
 * หน้า Login ด้วย Google OAuth และ Phone Authentication
 */

import React, { useState } from 'react';
import { signInWithGoogle } from '../services/auth';
import { executeAndVerifyRecaptcha, isRecaptchaScoreValid, getRecaptchaErrorMessage } from '../services/recaptcha';
import PhoneAuthForm from './PhoneAuthForm';

type LoginMethod = 'google' | 'phone';

const LoginPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loginMethod, setLoginMethod] = useState<LoginMethod>('google');

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Execute reCAPTCHA ก่อน (ไม่ต้องรอ verify)
            console.log('🔒 กำลังตรวจสอบ reCAPTCHA...');
            const recaptchaPromise = executeAndVerifyRecaptcha('login');
            
            // 2. Login ทันที (ไม่ต้องรอ reCAPTCHA)
            console.log('🔑 กำลัง Login...');
            await signInWithGoogle();
            
            // 3. รอผล reCAPTCHA และ log (แต่ไม่บล็อกการ login)
            recaptchaPromise.then(result => {
                console.log('reCAPTCHA result:', {
                    success: result.success,
                    score: result.score,
                    action: result.action
                });
                
                // ถ้า score ต่ำมาก ให้ log warning
                if (result.success && result.score < 0.3) {
                    console.warn('⚠️ reCAPTCHA score ต่ำ:', result.score);
                }
            }).catch(err => {
                console.warn('⚠️ reCAPTCHA verification failed:', err);
            });
            
            // ไม่ต้อง redirect เพราะ AuthContext จะจัดการให้
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการ Login');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
                {/* โลโก้แอป */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
                        <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        เครื่องมือสร้างเอกสาร
                    </h1>
                    <p className="text-gray-600">
                        ระบบจัดการใบส่งมอบงานและใบรับประกัน
                    </p>
                </div>

                {/* ข้อความต้อนรับ */}
                <div className="mb-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        ยินดีต้อนรับ
                    </h2>
                    <p className="text-gray-600 text-sm">
                        กรุณา Login เพื่อเข้าใช้งานระบบ
                    </p>
                </div>

                {/* Tab สำหรับเลือกวิธี Login */}
                <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => {
                            setLoginMethod('google');
                            setError(null);
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            loginMethod === 'google'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill={loginMethod === 'google' ? '#4285F4' : 'currentColor'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill={loginMethod === 'google' ? '#34A853' : 'currentColor'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill={loginMethod === 'google' ? '#FBBC05' : 'currentColor'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill={loginMethod === 'google' ? '#EA4335' : 'currentColor'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google
                        </div>
                    </button>
                    <button
                        onClick={() => {
                            setLoginMethod('phone');
                            setError(null);
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            loginMethod === 'phone'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            เบอร์โทรศัพท์
                        </div>
                    </button>
                </div>

                {/* แสดงฟอร์ม Login ตามที่เลือก */}
                {loginMethod === 'google' ? (
                    // ปุ่ม Sign in with Google
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-6 py-3 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-700 font-medium">กำลัง Login...</span>
                            </>
                        ) : (
                            <>
                                {/* Google Icon */}
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span className="text-gray-700 font-medium">Sign in with Google</span>
                            </>
                        )}
                    </button>
                ) : (
                    // ฟอร์ม Phone Authentication
                    <PhoneAuthForm
                        onSuccess={() => {
                            // AuthContext จะจัดการ redirect
                        }}
                        onError={(errorMsg) => {
                            setError(errorMsg);
                        }}
                    />
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* ข้อความด้านล่าง */}
                <div className="mt-8 text-center space-y-3">
                    <p className="text-xs text-gray-500">
                        การ Login หมายถึงคุณยอมรับ
                        <br />
                        <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">เงื่อนไขการใช้งาน</a>
                        {' และ '}
                        <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">นโยบายความเป็นส่วนตัว</a>
                    </p>
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        ระบบป้องกันด้วย reCAPTCHA v3
                    </p>
                </div>

                {/* reCAPTCHA Container สำหรับ Phone Auth */}
                <div id="recaptcha-container"></div>
            </div>

            {/* Background Decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default LoginPage;
