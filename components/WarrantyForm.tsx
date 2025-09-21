import React, { useRef } from 'react';
import { WarrantyData } from '../types';
import { formatDateForInput } from '../utils/dateUtils';

interface WarrantyFormProps {
    data: WarrantyData;
    setData: React.Dispatch<React.SetStateAction<WarrantyData>>;
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

const WarrantyForm: React.FC<WarrantyFormProps> = ({ data, setData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDataChange = <K extends keyof WarrantyData,>(key: K, value: WarrantyData[K]) => {
        setData(prev => ({ ...prev, [key]: value }));
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
             <div className="space-y-6">
                <FormDivider title="ข้อมูลบริษัท" />
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">โลโก้บริษัท</label>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/svg+xml"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-warranty"
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
                        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">ชื่อบริษัท</label>
                        <input type="text" id="companyName" value={data.companyName} onChange={(e) => handleDataChange('companyName', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div>
                        <label htmlFor="companyAddress" className="block text-sm font-medium text-slate-700">ที่อยู่</label>
                        <textarea id="companyAddress" value={data.companyAddress} onChange={(e) => handleDataChange('companyAddress', e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                </div>
            
                <FormDivider title="ข้อมูลลูกค้าและสินค้า" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-slate-700">ชื่อลูกค้า</label>
                        <input type="text" id="customerName" value={data.customerName} onChange={(e) => handleDataChange('customerName', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div>
                        <label htmlFor="customerContact" className="block text-sm font-medium text-slate-700">ข้อมูลติดต่อ</label>
                        <input type="text" id="customerContact" value={data.customerContact} onChange={(e) => handleDataChange('customerContact', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="productName" className="block text-sm font-medium text-slate-700">ชื่อสินค้า/รุ่น</label>
                        <input type="text" id="productName" value={data.productName} onChange={(e) => handleDataChange('productName', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div>
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-slate-700">หมายเลขเครื่อง</label>
                        <input type="text" id="serialNumber" value={data.serialNumber} onChange={(e) => handleDataChange('serialNumber', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div>
                        <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-700">วันที่ซื้อ</label>
                        <input type="date" id="purchaseDate" value={formatDateForInput(data.purchaseDate)} onChange={(e) => handleDataChange('purchaseDate', e.target.value ? new Date(e.target.value) : null)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="warrantyPeriod" className="block text-sm font-medium text-slate-700">ระยะเวลารับประกัน</label>
                        <input type="text" id="warrantyPeriod" value={data.warrantyPeriod} onChange={(e) => handleDataChange('warrantyPeriod', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                </div>

                <FormDivider title="เงื่อนไขการรับประกัน" />
                <div>
                     <textarea id="terms" value={data.terms} onChange={(e) => handleDataChange('terms', e.target.value)} rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                </div>
            </div>
        </div>
    );
};

export default WarrantyForm;