import React, { useRef, useState } from 'react';
import { DeliveryNoteData, WorkItem } from '../types';
import { formatDateForInput } from '../utils/dateUtils';

interface DeliveryFormProps {
    data: DeliveryNoteData;
    setData: React.Dispatch<React.SetStateAction<DeliveryNoteData>>;
}

const FormDivider: React.FC<{ title: string }> = ({ title }) => (
    <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-start">
            <span className="bg-white pr-3 text-lg font-medium text-gray-900">{title}</span>
        </div>
    </div>
);

const DeliveryForm: React.FC<DeliveryFormProps> = ({ data, setData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToRemove, setItemToRemove] = useState<number | null>(null);

    const handleDataChange = <K extends keyof DeliveryNoteData,>(key: K, value: DeliveryNoteData[K]) => {
        setData(prev => ({ ...prev, [key]: value }));
    };
    
    const handleItemChange = (index: number, field: keyof WorkItem, value: string | number) => {
        const newItems = [...data.items];
        const item = newItems[index];
        (item[field] as any) = value; // Type assertion to assign value
        handleDataChange('items', newItems);
    };

    const addItem = () => {
        setData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, unit: 'งาน', notes: '' }]
        }));
    };

    const removeItem = (index: number) => {
        setData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
        setIsConfirmModalOpen(false);
        setItemToRemove(null);
    };
    
    const openConfirmModal = (index: number) => {
        setItemToRemove(index);
        setIsConfirmModalOpen(true);
    };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleDataChange('logo', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        handleDataChange('logo', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    return (
        <div className="space-y-8 pt-4">
            {/* Confirmation Modal */}
            {isConfirmModalOpen && itemToRemove !== null && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">ยืนยันการลบ</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?
                                </p>
                            </div>
                            <div className="items-center px-4 py-3 space-x-2">
                                <button
                                    onClick={() => removeItem(itemToRemove)}
                                    className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    ลบ
                                </button>
                                <button
                                    onClick={() => setIsConfirmModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
                <FormDivider title="ข้อมูลผู้ส่งมอบ" />
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">โลโก้บริษัท</label>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/svg+xml"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                        />
                        {!data.logo ? (
                            <div
                                className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <p className="mt-2 text-sm text-slate-500">คลิกเพื่ออัปโหลดโลโก้</p>
                                <small className="text-xs text-slate-400">PNG, JPG, SVG</small>
                            </div>
                        ) : (
                            <div className="relative w-40 h-40 border rounded-lg p-2 flex items-center justify-center bg-slate-50">
                                <img src={data.logo} alt="logo preview" className="max-w-full max-h-full object-contain" />
                                <div className="absolute top-1 right-1 flex flex-col gap-1">
                                     <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                                    </button>
                                    <button type="button" onClick={removeLogo} className="p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="fromCompany" className="block text-sm font-medium text-slate-700">ชื่อบริษัท/ผู้ส่ง</label>
                        <input type="text" id="fromCompany" value={data.fromCompany} onChange={(e) => handleDataChange('fromCompany', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div>
                        <label htmlFor="fromAddress" className="block text-sm font-medium text-slate-700">ที่อยู่</label>
                        <textarea id="fromAddress" value={data.fromAddress} onChange={(e) => handleDataChange('fromAddress', e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                </div>

                <FormDivider title="ข้อมูลผู้รับมอบ" />
                <div className="space-y-4">
                    <div>
                        <label htmlFor="toCompany" className="block text-sm font-medium text-slate-700">ชื่อบริษัท/ผู้รับ</label>
                        <input type="text" id="toCompany" value={data.toCompany} onChange={(e) => handleDataChange('toCompany', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div>
                        <label htmlFor="toAddress" className="block text-sm font-medium text-slate-700">ที่อยู่</label>
                        <textarea id="toAddress" value={data.toAddress} onChange={(e) => handleDataChange('toAddress', e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                </div>

                <FormDivider title="รายละเอียดเอกสาร" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="docNumber" className="block text-sm font-medium text-slate-700">เลขที่เอกสาร</label>
                        <input type="text" id="docNumber" value={data.docNumber} onChange={(e) => handleDataChange('docNumber', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700">วันที่</label>
                        <input type="date" id="date" value={formatDateForInput(data.date)} onChange={(e) => handleDataChange('date', e.target.value ? new Date(e.target.value) : null)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="project" className="block text-sm font-medium text-slate-700">โครงการ/เรื่อง</label>
                        <input type="text" id="project" value={data.project} onChange={(e) => handleDataChange('project', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                </div>

                <FormDivider title="รายการส่งมอบ" />
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">รายละเอียด</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">จำนวน</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">หน่วย</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">หมายเหตุ</th>
                                <th scope="col" className="relative px-3 py-2 w-12"><span className="sr-only">ลบ</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-2 py-1 whitespace-nowrap">
                                        <textarea value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} rows={2} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-indigo-200 focus:ring-opacity-50 sm:text-sm bg-gray-50 text-gray-900"></textarea>
                                    </td>
                                    <td className="px-2 py-1 whitespace-nowrap">
                                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-indigo-200 focus:ring-opacity-50 sm:text-sm bg-gray-50 text-gray-900" />
                                    </td>
                                    <td className="px-2 py-1 whitespace-nowrap">
                                        <input type="text" value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-indigo-200 focus:ring-opacity-50 sm:text-sm bg-gray-50 text-gray-900" />
                                    </td>
                                    <td className="px-2 py-1 whitespace-nowrap">
                                         <input type="text" value={item.notes} onChange={(e) => handleItemChange(index, 'notes', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-indigo-200 focus:ring-opacity-50 sm:text-sm bg-gray-50 text-gray-900" />
                                    </td>
                                    <td className="px-2 py-1 whitespace-nowrap text-center">
                                        <button type="button" onClick={() => openConfirmModal(index)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <button type="button" onClick={addItem} className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    เพิ่มรายการ
                </button>
            </div>
            
            <FormDivider title="ข้อมูลผู้ลงนาม" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="senderName" className="block text-sm font-medium text-slate-700">ชื่อผู้ส่งมอบ</label>
                    <input type="text" id="senderName" value={data.senderName} onChange={(e) => handleDataChange('senderName', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                </div>
                <div>
                    <label htmlFor="receiverName" className="block text-sm font-medium text-slate-700">ชื่อผู้รับมอบ</label>
                    <input type="text" id="receiverName" value={data.receiverName} onChange={(e) => handleDataChange('receiverName', e.target.value)} placeholder="เว้นว่างไว้เพื่อลงนาม" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                </div>
            </div>
        </div>
    );
};

export default DeliveryForm;