/**
 * Company Selector Component
 * Dropdown สำหรับเลือกบริษัทที่ต้องการทำงาน
 */

import React, { useState } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { createCompany } from '../services/companies';
import { Company } from '../types';

const CompanySelector: React.FC = () => {
    // Debug log
    console.log('🏢 CompanySelector rendered');
    
    const { currentCompany, companies, selectCompany, refreshCompanies } = useCompany();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyAddress, setNewCompanyAddress] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Debug log
    console.log('🏢 Current Company:', currentCompany);
    console.log('🏢 All Companies:', companies);

    /**
     * เลือกบริษัท
     */
    const handleSelectCompany = (company: Company) => {
        selectCompany(company);
        setShowDropdown(false);
    };

    /**
     * สร้างบริษัทใหม่
     */
    const handleCreateCompany = async () => {
        if (!newCompanyName.trim()) {
            setError('กรุณากรอกชื่อบริษัท');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            // เตรียมข้อมูลบริษัท - ส่งเฉพาะ fields ที่มีค่า
            const companyData: any = {
                name: newCompanyName.trim(),
            };
            
            // เพิ่ม address เฉพาะเมื่อมีค่า
            if (newCompanyAddress.trim()) {
                companyData.address = newCompanyAddress.trim();
            }
            
            await createCompany(companyData);

            // รีเฟรชรายการและปิด modal
            await refreshCompanies();
            setShowCreateModal(false);
            setNewCompanyName('');
            setNewCompanyAddress('');
        } catch (err: any) {
            setError(err.message || 'ไม่สามารถสร้างบริษัทได้');
        } finally {
            setIsCreating(false);
        }
    };

    if (!currentCompany) {
        return null;
    }

    return (
        <div className="relative">
            {/* Dropdown Button */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium text-gray-700">{currentCompany.name}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2 border-b border-gray-200">
                        <p className="text-xs text-gray-500 px-2 py-1">บริษัทของคุณ</p>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {companies.map((company) => (
                            <button
                                key={company.id}
                                onClick={() => handleSelectCompany(company)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                    currentCompany.id === company.id ? 'bg-indigo-50' : ''
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className={`font-medium ${
                                            currentCompany.id === company.id ? 'text-indigo-600' : 'text-gray-700'
                                        }`}>
                                            {company.name}
                                        </p>
                                        {company.address && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                {company.address}
                                            </p>
                                        )}
                                    </div>
                                    {currentCompany.id === company.id && (
                                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="p-2 border-t border-gray-200">
                        <button
                            onClick={() => {
                                setShowCreateModal(true);
                                setShowDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="font-medium">เพิ่มบริษัทใหม่</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Create Company Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                เพิ่มบริษัทใหม่
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                        ชื่อบริษัท <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        value={newCompanyName}
                                        onChange={(e) => {
                                            setNewCompanyName(e.target.value);
                                            setError(null);
                                        }}
                                        placeholder="เช่น บริษัท ABC จำกัด"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        disabled={isCreating}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                        ที่อยู่ (ถ้ามี)
                                    </label>
                                    <textarea
                                        id="companyAddress"
                                        value={newCompanyAddress}
                                        onChange={(e) => setNewCompanyAddress(e.target.value)}
                                        placeholder="ที่อยู่บริษัท"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        disabled={isCreating}
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
                                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewCompanyName('');
                                        setNewCompanyAddress('');
                                        setError(null);
                                    }}
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleCreateCompany}
                                    disabled={isCreating || !newCompanyName.trim()}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>กำลังสร้าง...</span>
                                        </>
                                    ) : (
                                        'สร้างบริษัท'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop สำหรับปิด dropdown */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </div>
    );
};

export default CompanySelector;
