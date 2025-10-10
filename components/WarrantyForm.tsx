import React, { useRef, useState, useEffect } from 'react';
import { WarrantyData, LogoType } from '../types';
import { formatDateForInput } from '../utils/dateUtils';
import LogoManager from './LogoManager';
import CompanyProfileSelector from './CompanyProfileSelector';
import { generateDocumentNumber } from '../services/documentNumber';

export interface WarrantyFormProps {
    data: WarrantyData;
    setData: React.Dispatch<React.SetStateAction<WarrantyData>>;
    sharedLogo?: string | null;
    sharedLogoUrl?: string | null;
    sharedLogoType?: LogoType;
    onLogoChange?: (logo: string | null, logoUrl: string | null, logoType: LogoType) => void;
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

const WarrantyForm: React.FC<WarrantyFormProps> = ({ 
    data, 
    setData,
    sharedLogo,
    sharedLogoUrl,
    sharedLogoType,
    onLogoChange
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showCompanySelector, setShowCompanySelector] = useState(false);
    const [showCustomerSelector, setShowCustomerSelector] = useState(false);
    const [isGeneratingSerialNumber, setIsGeneratingSerialNumber] = useState(false);

    const handleDataChange = <K extends keyof WarrantyData,>(key: K, value: WarrantyData[K]) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    /**
     * จัดการการเปลี่ยนแปลงโลโก้จาก LogoManager component
     */
    const handleLogoChange = (logo: string | null, logoUrl: string | null, logoType: LogoType) => {
        // ใช้ onLogoChange ถ้ามี (Shared Logo) มิฉะนั้นใช้ setData (แบบเดิม)
        if (onLogoChange) {
            onLogoChange(logo, logoUrl, logoType);
        } else {
            setData(prev => ({
                ...prev,
                logo,
                logoUrl,
                logoType,
            }));
        }
    };

    /**
     * สร้างหมายเลขเครื่อง/เลขที่เอกสารอัตโนมัติ
     */
    const handleGenerateSerialNumber = async () => {
        setIsGeneratingSerialNumber(true);
        try {
            const newSerialNumber = await generateDocumentNumber('warranty');
            handleDataChange('serialNumber', newSerialNumber);
        } catch (error) {
            console.error('Error generating serial number:', error);
            alert('ไม่สามารถสร้างหมายเลขเครื่องได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsGeneratingSerialNumber(false);
        }
    };

    /**
     * Auto-generate หมายเลขเครื่องเมื่อฟอร์มว่าง
     */
    useEffect(() => {
        // ตรวจสอบว่าหมายเลขเครื่องว่าง
        if (!data.serialNumber || data.serialNumber === '' && !isGeneratingSerialNumber) {
            handleGenerateSerialNumber();
        }
    }, []); // เรียกครั้งเดียวตอน mount

    return (
        <div className="space-y-8 pt-4">
             <div className="space-y-6">
                <FormDivider title="ข้อมูลบริษัท" />
                <div className="space-y-4">
                     {/* ใช้ LogoManager component แทนการจัดการโลโก้เอง */}
                     <LogoManager
                        currentLogo={sharedLogo !== undefined ? sharedLogo : data.logo}
                        logoUrl={sharedLogoUrl !== undefined ? sharedLogoUrl : data.logoUrl}
                        logoType={sharedLogoType || data.logoType || 'default'}
                        onChange={handleLogoChange}
                        showLabel={true}
                        label="โลโก้บริษัท"
                     />
                    
                    {/* Company Profile Selector สำหรับข้อมูลบริษัท */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700">ข้อมูลบริษัท</label>
                            <button
                                type="button"
                                onClick={() => setShowCompanySelector(!showCompanySelector)}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                {showCompanySelector ? 'ซ่อน' : 'เลือกจากที่บันทึกไว้'}
                            </button>
                        </div>
                        {showCompanySelector && (
                            <CompanyProfileSelector
                                type="sender"
                                onSelect={(profile) => {
                                    handleDataChange('companyName', profile.companyName);
                                    handleDataChange('companyAddress', profile.address);
                                    setShowCompanySelector(false);
                                }}
                            />
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
                <div className="space-y-4">
                    {/* Customer Profile Selector สำหรับข้อมูลลูกค้า */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700">ข้อมูลลูกค้า</label>
                            <button
                                type="button"
                                onClick={() => setShowCustomerSelector(!showCustomerSelector)}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                {showCustomerSelector ? 'ซ่อน' : 'เลือกจากที่บันทึกไว้'}
                            </button>
                        </div>
                        {showCustomerSelector && (
                            <CompanyProfileSelector
                                type="receiver"
                                onSelect={(profile) => {
                                    handleDataChange('customerName', profile.companyName);
                                    handleDataChange('customerContact', profile.address);
                                    setShowCustomerSelector(false);
                                }}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="customerName" className="block text-sm font-medium text-slate-700">ชื่อลูกค้า</label>
                            <input type="text" id="customerName" value={data.customerName} onChange={(e) => handleDataChange('customerName', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                        </div>
                        <div>
                            <label htmlFor="customerContact" className="block text-sm font-medium text-slate-700">ข้อมูลติดต่อ</label>
                            <input type="text" id="customerContact" value={data.customerContact} onChange={(e) => handleDataChange('customerContact', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="productName" className="block text-sm font-medium text-slate-700">ชื่อสินค้า/รุ่น</label>
                        <input type="text" id="productName" value={data.productName} onChange={(e) => handleDataChange('productName', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div>
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-slate-700">หมายเลขเครื่อง</label>
                        <div className="mt-1 flex gap-2">
                            <input 
                                type="text" 
                                id="serialNumber" 
                                value={data.serialNumber} 
                                onChange={(e) => handleDataChange('serialNumber', e.target.value)} 
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                                placeholder="WR-25101001"
                            />
                            <button
                                type="button"
                                onClick={handleGenerateSerialNumber}
                                disabled={isGeneratingSerialNumber}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isGeneratingSerialNumber ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        สร้าง...
                                    </>
                                ) : (
                                    <>
                                        <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Auto
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">รูปแบบ: WR-YYMMDDXX (เช่น WR-25101001)</p>
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