import React from 'react';
import { PrimeIcons } from 'primereact/api';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center space-x-3">
                    <i className={`${PrimeIcons.FILE_EDIT} text-3xl text-indigo-600`}></i>
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
