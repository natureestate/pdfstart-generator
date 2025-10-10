import React, { forwardRef } from 'react';
import { WarrantyData } from '../types';
import { getDefaultLogoUrl } from '../services/logoStorage';

interface WarrantyPreviewProps {
    data: WarrantyData;
}

const WarrantyPreview = forwardRef<HTMLDivElement, WarrantyPreviewProps>(({ data }, ref) => {
    const formatDate = (date: Date | null) => {
        if (!date) return '...........................';
        return new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <div className="flex py-2 border-b border-slate-200">
            <p className="w-1/3 text-slate-500">{label}</p>
            <p className="w-2/3 font-medium text-slate-800">{value || '...........................'}</p>
        </div>
    );

    // ✅ กำหนดโลโก้ที่จะแสดง - ใช้ logo (Base64) ก่อนเพื่อหลีกเลี่ยงปัญหา CORS
    // ถ้าไม่มี Base64 ให้ใช้ logoUrl แต่อาจมีปัญหา CORS
    const displayLogo = data.logo || data.logoUrl || getDefaultLogoUrl();

    return (
        <div ref={ref} className="bg-white shadow-lg w-full aspect-[210/297] overflow-auto text-sm flex flex-col" id="printable-area">
            <div className="p-8 md:p-10 border-4 border-slate-800 m-4 flex-grow flex flex-col">
                <header className="flex flex-col items-center text-center mb-6 pb-4 border-b-2 border-slate-300">
                    <img 
                        src={displayLogo} 
                        alt="Company Logo" 
                        className="max-h-20 mb-3 object-contain"
                        crossOrigin="anonymous"
                    />
                    <h1 className="text-2xl font-bold text-slate-800 tracking-wider">ใบรับประกันสินค้า</h1>
                    <h2 className="text-lg font-medium text-slate-500 uppercase tracking-widest">Warranty Card</h2>
                </header>

                <main className="flex-grow">
                    <section className="mb-6">
                        <h3 className="font-bold text-base mb-2 text-indigo-700 border-b border-indigo-200 pb-1">ข้อมูลลูกค้าและผลิตภัณฑ์</h3>
                        <div className="mt-3">
                            <DetailRow label="ชื่อลูกค้า" value={data.customerName} />
                            <DetailRow label="ข้อมูลติดต่อ" value={data.customerContact} />
                            <DetailRow label="ชื่อสินค้า/รุ่น" value={data.productName} />
                            <DetailRow label="หมายเลขเครื่อง" value={data.serialNumber} />
                            <DetailRow label="วันที่ซื้อ" value={formatDate(data.purchaseDate)} />
                            <DetailRow label="ระยะเวลารับประกัน" value={data.warrantyPeriod} />
                        </div>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-bold text-base mb-2 text-indigo-700 border-b border-indigo-200 pb-1">เงื่อนไขการรับประกัน</h3>
                        <div className="text-xs text-slate-700 mt-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                            <p className="whitespace-pre-wrap leading-relaxed">{data.terms}</p>
                        </div>
                    </section>
                </main>
                
                <footer className="mt-auto pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="text-xs text-slate-500">
                            <p className="font-bold text-sm text-slate-800">{data.companyName}</p>
                            <p className="whitespace-pre-wrap">{data.companyAddress}</p>
                        </div>
                        <div className="text-center">
                            <div className="w-40 h-16 border-2 border-dashed border-slate-300 mx-auto flex items-center justify-center">
                                <p className="text-slate-400 text-xs">ตราประทับบริษัท</p>
                            </div>
                            <p className="mt-2 text-slate-600 text-xs">ขอขอบคุณที่เลือกใช้สินค้าและบริการของเรา</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
});

export default WarrantyPreview;
