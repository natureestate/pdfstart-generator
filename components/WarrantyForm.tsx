import React, { useRef, useState, useEffect } from 'react';
import { WarrantyData, LogoType } from '../types';
import { formatDateForInput } from '../utils/dateUtils';
import LogoManager from './LogoManager';
import CompanyProfileSelector from './CompanyProfileSelector';
import ServiceTemplateSelector from './ServiceTemplateSelector';
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
    const [showServiceSelector, setShowServiceSelector] = useState(false);
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
     * สร้างหมายเลขเอกสารอัตโนมัติ
     */
    const handleGenerateDocNumber = async () => {
        setIsGeneratingSerialNumber(true);
        try {
            const newDocNumber = await generateDocumentNumber('warranty');
            handleDataChange('houseModel', newDocNumber);
        } catch (error) {
            console.error('Error generating document number:', error);
            alert('ไม่สามารถสร้างเลขที่เอกสารได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsGeneratingSerialNumber(false);
        }
    };

    /**
     * Auto-generate เลขที่เอกสารเมื่อฟอร์มว่าง (ถ้าต้องการ)
     */
    useEffect(() => {
        // เอาออก - ให้ผู้ใช้กรอกเองหรือเลือกจาก template
        // if (!data.houseModel || data.houseModel === '' && !isGeneratingSerialNumber) {
        //     handleGenerateDocNumber();
        // }
    }, []);

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
            
                <FormDivider title="ข้อมูลลูกค้า" />
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
                    <div>
                        <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-700">วันที่ซื้อ</label>
                        <input type="date" id="purchaseDate" value={formatDateForInput(data.purchaseDate)} onChange={(e) => handleDataChange('purchaseDate', e.target.value ? new Date(e.target.value) : null)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                </div>

                <FormDivider title="ข้อมูลสินค้า/บริการ" />
                <div className="space-y-4">
                    {/* Service Template Selector */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700">ข้อมูลสินค้า/บริการ</label>
                            <button
                                type="button"
                                onClick={() => setShowServiceSelector(!showServiceSelector)}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                {showServiceSelector ? 'ซ่อน' : 'เลือกจากที่บันทึกไว้'}
                            </button>
                        </div>
                        {showServiceSelector && (
                            <ServiceTemplateSelector
                                onSelect={(template) => {
                                    handleDataChange('serviceName', template.serviceName);
                                    handleDataChange('houseModel', template.houseModel);
                                    handleDataChange('warrantyPeriod', template.warrantyPeriod);
                                    handleDataChange('terms', template.terms);
                                    setShowServiceSelector(false);
                                }}
                            />
                        )}
                    </div>

                    <div>
                        <label htmlFor="serviceName" className="block text-sm font-medium text-slate-700">ชื่อบริการ</label>
                        <input 
                            type="text" 
                            id="serviceName" 
                            value={data.serviceName} 
                            onChange={(e) => handleDataChange('serviceName', e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                            placeholder="เช่น บ้านพักอาศัยโครงสร้างพรีคาสท์สำเร็จรูป"
                        />
                    </div>
                    <div>
                        <label htmlFor="houseModel" className="block text-sm font-medium text-slate-700">แบบบ้าน</label>
                        <input 
                            type="text" 
                            id="houseModel" 
                            value={data.houseModel} 
                            onChange={(e) => handleDataChange('houseModel', e.target.value)} 
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                            placeholder="เช่น A01, B02, Modern Loft"
                        />
                        <p className="mt-1 text-xs text-gray-500">ระบุแบบบ้านหรือรุ่นของสินค้า</p>
                    </div>
                    <div>
                        <label htmlFor="warrantyPeriod" className="block text-sm font-medium text-slate-700">ระยะเวลารับประกัน</label>
                        <input 
                            type="text" 
                            id="warrantyPeriod" 
                            value={data.warrantyPeriod} 
                            onChange={(e) => handleDataChange('warrantyPeriod', e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                            placeholder="เช่น 1 ปี, 2 ปี, 5 ปี"
                        />
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