import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center space-x-3">
                    <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h1 className="text-2xl font-bold text-slate-800">
                        เครื่องมือสร้างเอกสาร
                    </h1>
                </div>
                <p className="text-slate-500 mt-1">
                    เลือกประเภทเอกสารและกรอกข้อมูลเพื่อสร้างและดาวน์โหลดไฟล์ PDF
                </p>
            </div>
        </header>
    );
};

export default Header;