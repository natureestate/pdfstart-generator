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
            <div className="p-3 border-2 border-indigo-700 m-1.5 flex-grow flex flex-col">
                {/* Header Section */}
                <header className="mb-2 pb-1.5 border-b-2 border-indigo-300">
                    {/* ข้อความส่วนหัว */}
                    <div className="text-center pt-2">
                        <h1 className="text-2xl font-bold text-indigo-900 tracking-wide">ใบรับประกันสินค้า</h1>
                        <h2 className="text-sm font-medium text-indigo-600 uppercase tracking-widest">Product Warranty Card</h2>
                        <div className="mt-1 text-xs text-slate-600 bg-indigo-50 px-3 py-0.5 rounded-full inline-block">
                            เลขที่: <span className="font-bold text-indigo-800">{data.warrantyNumber || '........................'}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-grow space-y-2">
                    {/* ข้อมูลบริษัท */}
                    <section>
                        <div className="bg-indigo-700 px-2 py-1 rounded mb-1 flex items-center">
                            <h3 className="font-bold text-sm text-white flex items-center gap-1 m-0">
                                <span className="leading-none">📋</span>
                                <span className="leading-none">ข้อมูลบริษัทผู้ผลิต</span>
                            </h3>
                        </div>
                        <div className="mt-0.5 pl-1">
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
                        <div className="bg-indigo-700 px-2 py-1 rounded mb-1 flex items-center">
                            <h3 className="font-bold text-sm text-white flex items-center gap-1 m-0">
                                <span className="leading-none">👤</span>
                                <span className="leading-none">ข้อมูลลูกค้า/โครงการ</span>
                            </h3>
                        </div>
                        <div className="mt-0.5 pl-1">
                            <DetailRow label="ชื่อโครงการ" value={data.projectName} />
                            <DetailRow label="ชื่อลูกค้า" value={data.customerName} />
                            <DetailRow label="โทรศัพท์" value={data.customerPhone} />
                            <DetailRow label="ที่อยู่โครงการ/ลูกค้า" value={data.customerAddress} isFullWidth={true} />
                        </div>
                    </section>

                    {/* ข้อมูลสินค้า */}
                    <section>
                        <div className="bg-indigo-700 px-2 py-1 rounded mb-1 flex items-center">
                            <h3 className="font-bold text-sm text-white flex items-center gap-1 m-0">
                                <span className="leading-none">📦</span>
                                <span className="leading-none">ข้อมูลสินค้า/บริการ</span>
                            </h3>
                        </div>
                        <div className="mt-0.5 pl-1">
                            <DetailRow label="ประเภทสินค้า" value={data.serviceName} />
                            <DetailRow label="รายการสินค้า" value={data.productDetail} />
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="flex py-1 border-b border-slate-200">
                                    <p className="w-2/5 text-xs text-slate-600 font-medium">แบบบ้าน</p>
                                    <p className="w-3/5 text-xs font-medium text-slate-900">{data.houseModel || '...........................'}</p>
                                </div>
                                {/* แสดง Batch No. เฉพาะเมื่อ showBatchNo เป็น true */}
                                {data.showBatchNo && (
                                    <div className="flex py-1 border-b border-slate-200">
                                        <p className="w-2/5 text-xs text-slate-600 font-medium">Batch No.</p>
                                        <p className="w-3/5 text-xs font-medium text-slate-900">{data.batchNo || '...........................'}</p>
                                    </div>
                                )}
                            </div>
                            <DetailRow label="วันที่ส่งมอบสินค้า" value={formatDate(data.purchaseDate)} />
                        </div>
                    </section>

                    {/* การรับประกัน */}
                    <section>
                        <div className="bg-green-700 px-2 py-1 rounded mb-1 flex items-center">
                            <h3 className="font-bold text-sm text-white flex items-center gap-1 m-0">
                                <span className="leading-none">✅</span>
                                <span className="leading-none">การรับประกัน</span>
                            </h3>
                        </div>
                        <div className="mt-0.5 pl-1">
                            {/* แสดงการรับประกันแบบปกติ */}
                            {!data.useMultipleWarrantyTypes && (
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
                            )}
                            
                            {/* แสดงการรับประกันแบบหลายประเภท (งานรับสร้างบ้าน) */}
                            {data.useMultipleWarrantyTypes && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-slate-700 mb-1">🏠 การรับประกันแบบงานรับสร้างบ้าน:</p>
                                    
                                    {data.warrantyGeneral && (
                                        <div className="flex items-center py-1 px-2 bg-green-50 border border-green-200 rounded">
                                            <span className="text-xs">✓</span>
                                            <p className="ml-2 text-xs font-medium text-slate-800">
                                                รับประกันทั่วไป <span className="font-bold text-green-700">1 ปี</span>
                                            </p>
                                        </div>
                                    )}
                                    
                                    {data.warrantyRoof && (
                                        <div className="flex items-center py-1 px-2 bg-blue-50 border border-blue-200 rounded">
                                            <span className="text-xs">✓</span>
                                            <p className="ml-2 text-xs font-medium text-slate-800">
                                                รับประกันงานหลังคา <span className="font-bold text-blue-700">3 ปี</span>
                                            </p>
                                        </div>
                                    )}
                                    
                                    {data.warrantyStructure && (
                                        <div className="flex items-center py-1 px-2 bg-purple-50 border border-purple-200 rounded">
                                            <span className="text-xs">✓</span>
                                            <p className="ml-2 text-xs font-medium text-slate-800">
                                                รับประกันงานโครงสร้าง <span className="font-bold text-purple-700">15 ปี</span>
                                            </p>
                                        </div>
                                    )}
                                    
                                    {!data.warrantyGeneral && !data.warrantyRoof && !data.warrantyStructure && (
                                        <p className="text-xs text-slate-500 italic">ยังไม่ได้เลือกประเภทการรับประกัน</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* เงื่อนไขการรับประกัน */}
                    <section className="flex-grow">
                        <div className="bg-indigo-700 px-2 py-1 rounded mb-1 flex items-center">
                            <h3 className="font-bold text-sm text-white flex items-center gap-1 m-0">
                                <span className="leading-none">📜</span>
                                <span className="leading-none">เงื่อนไขการรับประกัน</span>
                            </h3>
                        </div>
                        <div className="text-xs text-slate-700 mt-0.5 p-1.5 bg-slate-50 rounded border border-slate-200 leading-relaxed">
                            <p className="whitespace-pre-wrap">{data.terms || 'ไม่ได้ระบุเงื่อนไข'}</p>
                        </div>
                    </section>
                </main>
                
                {/* Footer Section */}
                <footer className="mt-1.5 pt-1.5 border-t-2 border-indigo-300">
                    <div className="grid grid-cols-2 gap-2 items-end">
                        <div className="text-xs text-slate-600">
                            <p className="font-semibold text-xs text-slate-900">วันที่ออกเอกสาร: {formatDate(data.issueDate)}</p>
                            <p className="text-xs">ผู้ออกเอกสาร: <span className="font-medium text-slate-900">{data.issuedBy || '........................'}</span></p>
                        </div>
                        <div className="text-center">
                            {/* แสดงโลโก้บริษัทแทนตราประทับ */}
                            <div className="w-28 h-20 mx-auto flex items-center justify-center">
                                <img 
                                    src={displayLogo} 
                                    alt="Company Logo" 
                                    className="max-h-20 max-w-28 object-contain"
                                    crossOrigin="anonymous"
                                />
                            </div>
                            <p className="mt-0.5 text-indigo-700 text-xs font-medium">ขอขอบคุณที่เลือกใช้สินค้าและบริการของเรา</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
});

export default WarrantyPreview;
