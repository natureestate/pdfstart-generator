

import React, { forwardRef } from 'react';
import { DeliveryNoteData } from '../types';

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

    return (
        <div ref={ref} className="bg-white shadow-lg p-8 md:p-12 w-full aspect-[210/297] overflow-auto text-sm" id="printable-area">
            <div className="flex justify-between items-start mb-8">
                <div className="w-1/2">
                    {data.logo ? (
                        <img src={data.logo} alt="Company Logo" className="max-h-20 max-w-[50%] object-contain" />
                    ) : (
                        <div className="w-24 h-12 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                            LOGO
                        </div>
                    )}
                </div>
                <div className="w-1/2 text-right">
                    <h1 className="text-xl font-bold">ใบส่งมอบงาน (DELIVERY NOTE)</h1>
                    <div className="mt-2">
                        <p><strong>เลขที่:</strong> {data.docNumber || '...........................'}</p>
                        <p><strong>วันที่:</strong> {formatDate(data.date)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="border p-3 rounded">
                    <p className="font-bold">จาก:</p>
                    <p className="font-bold">{data.fromCompany || '...........................'}</p>
                    <p className="whitespace-pre-wrap">{data.fromAddress || '...........................'}</p>
                </div>
                <div className="border p-3 rounded">
                    <p className="font-bold">ถึง:</p>
                    <p className="font-bold">{data.toCompany || '...........................'}</p>
                    <p className="whitespace-pre-wrap">{data.toAddress || '...........................'}</p>
                </div>
            </div>
            
            <div className="mb-8">
                <p><strong>โครงการ/เรื่อง:</strong> {data.project || '...........................'}</p>
            </div>

            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border p-2 w-12 text-center font-semibold text-slate-600">ลำดับ</th>
                        <th className="border p-2 font-semibold text-slate-600">รายการ</th>
                        <th className="border p-2 w-20 text-center font-semibold text-slate-600">จำนวน</th>
                        <th className="border p-2 w-24 text-center font-semibold text-slate-600">หน่วย</th>
                        <th className="border p-2 w-1/4 font-semibold text-slate-600">หมายเหตุ</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, index) => (
                        <tr key={index}>
                            <td className="border p-2 text-center">{index + 1}</td>
                            <td className="border p-2 whitespace-pre-wrap">{item.description}</td>
                            <td className="border p-2 text-center">{item.quantity}</td>
                            <td className="border p-2 text-center">{item.unit}</td>
                            <td className="border p-2">{item.notes}</td>
                        </tr>
                    ))}
                    {Array.from({ length: Math.max(0, 8 - data.items.length) }).map((_, i) => (
                        <tr key={`empty-${i}`}>
                            <td className="border p-2 h-8">&nbsp;</td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-24 grid grid-cols-2 gap-8 text-center">
                <div>
                    <p>....................................................</p>
                    <p>({data.senderName || '...........................'})</p>
                    <p>ผู้ส่งมอบ</p>
                    <p>วันที่: ......./......./...........</p>
                </div>
                <div>
                    <p>....................................................</p>
                    <p>({data.receiverName || '...........................'})</p>
                    <p>ผู้รับมอบ</p>
                    <p>วันที่: ......./......./...........</p>
                </div>
            </div>
        </div>
    );
});

export default DocumentPreview;