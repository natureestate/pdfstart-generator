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

    const DetailRow: React.FC<{ label: string; value: string; isFullWidth?: boolean }> = ({ label, value, isFullWidth = false }) => (
        <div className={`flex py-1 border-b border-slate-200 ${isFullWidth ? 'flex-col' : ''}`}>
            <p className={`${isFullWidth ? 'mb-0.5' : 'w-2/5'} text-xs text-slate-600 font-medium`}>{label}</p>
            <p className={`${isFullWidth ? '' : 'w-3/5'} text-xs font-medium text-slate-900`}>{value || '...........................'}</p>
        </div>
    );

    // ✅ กำหนดโลโก้ที่จะแสดง - ใช้ logo (Base64) ก่อนเพื่อหลีกเลี่ยงปัญหา CORS
    // ถ้าไม่มี Base64 ให้ใช้ logoUrl แต่อาจมีปัญหา CORS
    const displayLogo = data.logo || data.logoUrl || getDefaultLogoUrl();

    return (
        <div ref={ref} className="bg-white shadow-xl w-full aspect-[210/297] overflow-auto flex flex-col" id="printable-area">
            <div className="p-4 border-4 border-indigo-700 m-2 flex-grow flex flex-col">
                {/* Header Section */}
                <header className="flex flex-col items-center text-center mb-3 pb-2 border-b-2 border-indigo-300">
                    <img 
                        src={displayLogo} 
                        alt="Company Logo" 
                        className="max-h-24 mb-2 object-contain"
                        crossOrigin="anonymous"
                    />
                    <h1 className="text-2xl font-bold text-indigo-900 tracking-wide">ใบรับประกันสินค้า</h1>
                    <h2 className="text-base font-medium text-indigo-600 uppercase tracking-widest">Product Warranty Card</h2>
                    <div className="mt-1 text-xs text-slate-600 bg-indigo-50 px-3 py-0.5 rounded-full">
                        เลขที่: <span className="font-bold text-indigo-800">{data.warrantyNumber || '........................'}</span>
                    </div>
                </header>

                <main className="flex-grow space-y-2.5">
                    {/* ข้อมูลบริษัท */}
                    <section>
                        <h3 className="font-bold text-sm mb-1.5 text-white bg-indigo-700 px-2 py-1 rounded">📋 ข้อมูลบริษัทผู้ผลิต</h3>
                        <div className="mt-1 pl-2">
                            <DetailRow label="ชื่อบริษัท" value={data.companyName} />
                            <DetailRow label="ที่อยู่" value={data.companyAddress} isFullWidth={true} />
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="flex py-1 border-b border-slate-200">
                                    <p className="w-2/5 text-xs text-slate-600 font-medium">โทรศัพท์</p>
                                    <p className="w-3/5 text-xs font-medium text-slate-900">{data.companyPhone || '...........................'}</p>
                                </div>
                                <div className="flex py-1 border-b border-slate-200">
                                    <p className="w-2/5 text-xs text-slate-600 font-medium">อีเมล/เว็บไซต์</p>
                                    <p className="w-3/5 text-xs font-medium text-slate-900">{data.companyEmail || '...........................'}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ข้อมูลลูกค้า */}
                    <section>
                        <h3 className="font-bold text-sm mb-1.5 text-white bg-indigo-700 px-2 py-1 rounded">👤 ข้อมูลลูกค้า/โครงการ</h3>
                        <div className="mt-1 pl-2">
                            <DetailRow label="ชื่อโครงการ" value={data.projectName} />
                            <DetailRow label="ชื่อลูกค้า" value={data.customerName} />
                            <DetailRow label="โทรศัพท์" value={data.customerPhone} />
                            <DetailRow label="ที่อยู่โครงการ/ลูกค้า" value={data.customerAddress} isFullWidth={true} />
                        </div>
                    </section>

                    {/* ข้อมูลสินค้า */}
                    <section>
                        <h3 className="font-bold text-sm mb-1.5 text-white bg-indigo-700 px-2 py-1 rounded">📦 ข้อมูลสินค้า/บริการ</h3>
                        <div className="mt-1 pl-2">
                            <DetailRow label="ประเภทสินค้า" value={data.serviceName} />
                            <DetailRow label="รายการสินค้า" value={data.productDetail} />
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="flex py-1 border-b border-slate-200">
                                    <p className="w-2/5 text-xs text-slate-600 font-medium">แบบบ้าน</p>
                                    <p className="w-3/5 text-xs font-medium text-slate-900">{data.houseModel || '...........................'}</p>
                                </div>
                                <div className="flex py-1 border-b border-slate-200">
                                    <p className="w-2/5 text-xs text-slate-600 font-medium">Batch No.</p>
                                    <p className="w-3/5 text-xs font-medium text-slate-900">{data.batchNo || '...........................'}</p>
                                </div>
                            </div>
                            <DetailRow label="วันที่ส่งมอบสินค้า" value={formatDate(data.purchaseDate)} />
                        </div>
                    </section>

                    {/* การรับประกัน */}
                    <section>
                        <h3 className="font-bold text-sm mb-1.5 text-white bg-green-700 px-2 py-1 rounded">✅ การรับประกัน</h3>
                        <div className="mt-1 pl-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex py-1 border-b border-slate-200">
                                    <p className="w-2/5 text-xs text-slate-600 font-medium">ระยะเวลา</p>
                                    <p className="w-3/5 text-xs font-bold text-green-700">{data.warrantyPeriod || '...........................'}</p>
                                </div>
                                <div className="flex py-1 border-b border-slate-200">
                                    <p className="w-2/5 text-xs text-slate-600 font-medium">วันสิ้นสุด</p>
                                    <p className="w-3/5 text-xs font-bold text-red-600">{formatDate(data.warrantyEndDate)}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* เงื่อนไขการรับประกัน */}
                    <section className="flex-grow">
                        <h3 className="font-bold text-sm mb-1.5 text-white bg-indigo-700 px-2 py-1 rounded">📜 เงื่อนไขการรับประกัน</h3>
                        <div className="text-xs text-slate-700 mt-1 p-2 bg-slate-50 rounded border border-slate-200 leading-relaxed">
                            <p className="whitespace-pre-wrap">{data.terms || 'ไม่ได้ระบุเงื่อนไข'}</p>
                        </div>
                    </section>
                </main>
                
                {/* Footer Section */}
                <footer className="mt-2 pt-2 border-t-2 border-indigo-300">
                    <div className="grid grid-cols-2 gap-3 items-end">
                        <div className="text-xs text-slate-600">
                            <p className="font-semibold text-xs text-slate-900 mb-0.5">วันที่ออกเอกสาร: {formatDate(data.issueDate)}</p>
                            <p className="text-xs">ผู้ออกเอกสาร: <span className="font-medium text-slate-900">{data.issuedBy || '........................'}</span></p>
                        </div>
                        <div className="text-center">
                            <div className="w-32 h-12 border-2 border-dashed border-indigo-400 mx-auto flex items-center justify-center bg-indigo-50">
                                <p className="text-indigo-600 text-xs font-medium">ตราประทับบริษัท</p>
                            </div>
                            <p className="mt-1 text-indigo-700 text-xs font-medium">ขอขอบคุณที่เลือกใช้สินค้าและบริการของเรา</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
});

export default WarrantyPreview;
