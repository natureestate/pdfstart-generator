import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { signOut } from '../services/auth';
import CompanySelector from './CompanySelector';
import UserManagement from './UserManagement';
import { checkIsAdmin } from '../services/companyMembers';

const Header: React.FC = () => {
    const { user } = useAuth();
    const { currentCompany } = useCompany();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // ตรวจสอบสิทธิ์ Admin เมื่อเปลี่ยนองค์กร
    React.useEffect(() => {
        const checkAdminStatus = async () => {
            if (user && currentCompany?.id) {
                const adminStatus = await checkIsAdmin(currentCompany.id, user.uid);
                setIsAdmin(adminStatus);
            } else {
                setIsAdmin(false);
            }
        };
        checkAdminStatus();
    }, [user, currentCompany]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
            setShowDropdown(false);
        } catch (error) {
            console.error('Logout error:', error);
            alert('เกิดข้อผิดพลาดในการ Logout');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* ส่วนซ้าย - โลโก้และชื่อแอป */}
                    <div className="flex items-center space-x-3">
                        <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                เครื่องมือสร้างเอกสาร
                            </h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                เลือกประเภทเอกสารและกรอกข้อมูลเพื่อสร้างและดาวน์โหลดไฟล์ PDF
                            </p>
                        </div>
                    </div>

                    {/* ส่วนขวา - Company Selector, User Management, User Info และ Logout */}
                    {user && (
                        <div className="flex items-center gap-4">
                            {/* Company Selector */}
                            <CompanySelector />

                            {/* แสดงบทบาทและปุ่มจัดการสมาชิก */}
                            {currentCompany && (
                                <div className="flex items-center gap-2">
                                    {/* Badge แสดงบทบาท */}
                                    <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                        isAdmin 
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                                    }`}>
                                        {isAdmin ? '👑 Admin' : '👤 Member'}
                                    </div>
                                    
                                    {/* ปุ่มจัดการสมาชิก (แสดงเฉพาะ Admin) */}
                                    {isAdmin && (
                                        <button
                                            onClick={() => setShowUserManagement(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                                            title="จัดการสมาชิกในองค์กร"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span className="hidden lg:inline">จัดการสมาชิก</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                {/* รูปโปรไฟล์ */}
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        className="w-10 h-10 rounded-full border-2 border-indigo-200"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200">
                                        <span className="text-indigo-600 font-semibold text-lg">
                                            {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                )}

                                {/* ชื่อผู้ใช้ */}
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {user.displayName || 'ผู้ใช้'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user.email}
                                    </p>
                                </div>

                                {/* ไอคอนลูกศร */}
                                <svg
                                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                    {/* User Info (สำหรับมือถือ) */}
                                    <div className="px-4 py-3 border-b border-gray-200 md:hidden">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {user.displayName || 'ผู้ใช้'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Logout Button */}
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoggingOut ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>กำลัง Logout...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Logout</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay เพื่อปิด dropdown เมื่อคลิกข้างนอก */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                />
            )}

            {/* Modal จัดการสมาชิก */}
            {showUserManagement && currentCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <UserManagement
                            companyId={currentCompany.id!}
                            companyName={currentCompany.name}
                            onClose={() => setShowUserManagement(false)}
                        />
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;