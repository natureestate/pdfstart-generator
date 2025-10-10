/**
 * Protected Route Component
 * ป้องกันไม่ให้เข้าถึงเนื้อหาได้ถ้ายังไม่ Login
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from './LoginPage';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    // แสดง Loading Screen ระหว่างตรวจสอบ auth
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        กำลังตรวจสอบสิทธิ์...
                    </h2>
                    <p className="text-gray-600 text-sm">
                        กรุณารอสักครู่
                    </p>
                </div>
            </div>
        );
    }

    // ถ้ายังไม่ Login → แสดงหน้า Login
    if (!user) {
        return <LoginPage />;
    }

    // ถ้า Login แล้ว → แสดงเนื้อหาปกติ
    return <>{children}</>;
};

export default ProtectedRoute;
