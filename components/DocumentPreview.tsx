import React, { forwardRef } from 'react';
import { DeliveryNoteData } from '../types';
import { getDefaultLogoUrl } from '../services/logoStorage';

interface DocumentPreviewProps {
    data: DeliveryNoteData;
}

const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(({ data }, ref) => {
    const formatDate = (date: Date | null) => {
        if (!date) return '...........................';
        return new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    // กำหนดโลโก้ที่จะแสดง - ใช้ logoUrl (จาก Storage) หรือ logo (Base64) หรือ default
    const displayLogo = data.logoUrl || data.logo || getDefaultLogoUrl();

    return (
        <div ref={ref} className="bg-white shadow-lg p-8 md:p-12 w-full aspect-[210/297] overflow-auto text-sm" id="printable-area">
            <header className="flex justify-between items-start pb-4 border-b-2 border-gray-800">
                <div className="w-2/5">
                    <img 
                        src={displayLogo} 
                        alt="Company Logo" 
                        className="max-h-20 object-contain"
                        crossOrigin="anonymous"
                    />
                </div>
                <div className="w-3/5 text-right">
                    <h1 className="text-2xl font-bold text-gray-800">ใบส่งมอบงาน</h1>
                    <h2 className="text-lg text-gray-500">DELIVERY NOTE</h2>
                    <div className="mt-4 text-xs">
                        <p><span className="font-semibold text-gray-600">เลขที่เอกสาร:</span> {data.docNumber || '________________'}</p>
                        <p><span className="font-semibold text-gray-600">วันที่:</span> {formatDate(data.date)}</p>
                    </div>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-6 my-6">
                <div className="bg-slate-50 p-3 rounded-md">
                    <p className="font-semibold text-slate-600 text-base mb-1">จาก:</p>
                    <p className="font-bold text-slate-800">{data.fromCompany || 'N/A'}</p>
                    <p className="text-slate-600 whitespace-pre-wrap">{data.fromAddress || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-md">
                    <p className="font-semibold text-slate-600 text-base mb-1">ถึง:</p>
                    <p className="font-bold text-slate-800">{data.toCompany || 'N/A'}</p>
                    <p className="text-slate-600 whitespace-pre-wrap">{data.toAddress || 'N/A'}</p>
                </div>
            </section>
            
            <section className="mb-6">
                 <p><span className="font-semibold text-slate-600">โครงการ/เรื่อง:</span> {data.project || '...........................'}</p>
            </section>

            <section className="min-h-[300px]">
                <table className="w-full text-left text-sm">
                    <thead className="border-b-2 border-slate-300">
                        <tr>
                            <th className="p-2 text-center font-semibold text-slate-600 w-12">#</th>
                            <th className="p-2 font-semibold text-slate-600">รายการ</th>
                            <th className="p-2 text-center font-semibold text-slate-600 w-20">จำนวน</th>
                            <th className="p-2 text-center font-semibold text-slate-600 w-24">หน่วย</th>
                            <th className="p-2 font-semibold text-slate-600 w-1/4">หมายเหตุ</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {data.items.map((item, index) => (
                            <tr key={index} className="border-b border-slate-100">
                                <td className="p-2 text-center align-top">{index + 1}</td>
                                <td className="p-2 align-top whitespace-pre-wrap">{item.description}</td>
                                <td className="p-2 text-center align-top">{item.quantity}</td>
                                <td className="p-2 text-center align-top">{item.unit}</td>
                                <td className="p-2 align-top">{item.notes}</td>
                            </tr>
                        ))}
                        {Array.from({ length: Math.max(0, 8 - data.items.length) }).map((_, i) => (
                            <tr key={`empty-${i}`}>
                                <td className="p-2 h-8 border-b border-slate-100">&nbsp;</td>
                                <td className="border-b border-slate-100"></td>
                                <td className="border-b border-slate-100"></td>
                                <td className="border-b border-slate-100"></td>
                                <td className="border-b border-slate-100"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <footer className="mt-16 grid grid-cols-2 gap-12 text-center text-xs">
                <div>
                    <div className="border-b border-dotted border-slate-400 w-3/4 mx-auto pb-1 mb-2"></div>
                    <p>({data.senderName || '...........................'})</p>
                    <p className="font-semibold mt-1">ผู้ส่งมอบ</p>
                    <p className="mt-4">วันที่: ......./......./...........</p>
                </div>
                <div>
                    <div className="border-b border-dotted border-slate-400 w-3/4 mx-auto pb-1 mb-2"></div>
                    <p>({data.receiverName || '...........................'})</p>
                    <p className="font-semibold mt-1">ผู้รับมอบ</p>
                    <p className="mt-4">วันที่: ......./......./...........</p>
                </div>
            </footer>
        </div>
    );
});

export default DocumentPreview;