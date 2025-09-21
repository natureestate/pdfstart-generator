import React, { forwardRef } from 'react';
import { WarrantyData } from '../types';

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
        <div className="flex border-t border-slate-200 py-2">
            <p className="w-1/3 text-slate-500">{label}</p>
            <p className="w-2/3 font-medium text-slate-800">{value || '...........................'}</p>
        </div>
    );

    return (
        <div ref={ref} className="bg-white shadow-lg p-8 md:p-10 w-full aspect-[210/297] overflow-auto text-sm" id="printable-area">
            <header className="flex flex-col items-center text-center mb-6 pb-4 border-b-2 border-slate-800">
                {data.logo ? (
                    <img src={data.logo} alt="Company Logo" className="max-h-20 mb-2 object-contain" />
                ) : (
                    <div className="w-24 h-12 bg-slate-200 flex items-center justify-center text-slate-400 text-xs mb-2">
                        LOGO
                    </div>
                )}
                <h1 className="text-xl font-bold text-slate-800">ใบรับประกันสินค้า</h1>
                <h2 className="text-lg font-medium text-slate-600">WARRANTY CARD</h2>
            </header>

            <main>
                <section className="mb-6">
                    <h3 className="font-bold text-base mb-2 text-indigo-700">ข้อมูลลูกค้าและผลิตภัณฑ์</h3>
                    <div className="border-b border-slate-200">
                        <DetailRow label="ชื่อลูกค้า" value={data.customerName} />
                        <DetailRow label="ข้อมูลติดต่อ" value={data.customerContact} />
                        <DetailRow label="ชื่อสินค้า/รุ่น" value={data.productName} />
                        <DetailRow label="หมายเลขเครื่อง" value={data.serialNumber} />
                        <DetailRow label="วันที่ซื้อ" value={formatDate(data.purchaseDate)} />
                        <DetailRow label="ระยะเวลารับประกัน" value={data.warrantyPeriod} />
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className="font-bold text-base mb-2 text-indigo-700">เงื่อนไขการรับประกัน</h3>
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border">
                        <p className="whitespace-pre-wrap">{data.terms}</p>
                    </div>
                </section>
            </main>
            
            <footer className="mt-auto pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-xs text-slate-500">
                        <p className="font-bold text-sm text-slate-800">{data.companyName}</p>
                        <p className="whitespace-pre-wrap">{data.companyAddress}</p>
                    </div>
                     <div className="text-center">
                        <div className="w-48 h-20 border-2 border-dashed border-slate-300 mx-auto flex items-center justify-center">
                            <p className="text-slate-400">ตราประทับบริษัท</p>
                        </div>
                        <p className="mt-2 text-slate-600">ขอขอบคุณที่เลือกใช้สินค้าและบริการของเรา</p>
                    </div>
                </div>
            </footer>
        </div>
    );
});

export default WarrantyPreview;
