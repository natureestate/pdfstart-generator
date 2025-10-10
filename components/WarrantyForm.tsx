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
     * สร้าง Warranty Number อัตโนมัติ (รูปแบบ: WR-YYMMDDXX)
     */
    const handleGenerateWarrantyNumber = async () => {
        setIsGeneratingSerialNumber(true);
        try {
            const newWarrantyNumber = await generateDocumentNumber('warranty');
            handleDataChange('warrantyNumber', newWarrantyNumber);
        } catch (error) {
            console.error('Error generating warranty number:', error);
            alert('ไม่สามารถสร้างเลขที่ใบรับประกันได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsGeneratingSerialNumber(false);
        }
    };

    /**
     * คำนวณวันสิ้นสุดการรับประกันอัตโนมัติ
     * จาก: วันที่ส่งมอบ (purchaseDate) + ระยะเวลารับประกัน (warrantyPeriod)
     */
    const calculateWarrantyEndDate = () => {
        if (!data.purchaseDate || !data.warrantyPeriod) {
            return;
        }

        const purchaseDate = new Date(data.purchaseDate);
        const periodMatch = data.warrantyPeriod.match(/(\d+)\s*(ปี|เดือน|วัน|year|month|day)/i);
        
        if (!periodMatch) {
            console.warn('ไม่สามารถแปลงระยะเวลารับประกันได้ กรุณาใช้รูปแบบ "3 ปี", "6 เดือน", "30 วัน"');
            return;
        }

        const [, amount, unit] = periodMatch;
        const numAmount = parseInt(amount);
        const endDate = new Date(purchaseDate);

        if (unit.match(/ปี|year/i)) {
            endDate.setFullYear(endDate.getFullYear() + numAmount);
        } else if (unit.match(/เดือน|month/i)) {
            endDate.setMonth(endDate.getMonth() + numAmount);
        } else if (unit.match(/วัน|day/i)) {
            endDate.setDate(endDate.getDate() + numAmount);
        }

        handleDataChange('warrantyEndDate', endDate);
    };

    /**
     * Auto-calculate warranty end date เมื่อ purchaseDate หรือ warrantyPeriod เปลี่ยน
     */
    useEffect(() => {
        calculateWarrantyEndDate();
    }, [data.purchaseDate, data.warrantyPeriod]);

    /**
     * Auto-generate warranty number เมื่อ component mount (ถ้ายังไม่มี)
     */
    useEffect(() => {
        if (!data.warrantyNumber) {
            handleGenerateWarrantyNumber();
        }
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
                        <textarea id="companyAddress" value={data.companyAddress} onChange={(e) => handleDataChange('companyAddress', e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="companyPhone" className="block text-sm font-medium text-slate-700">โทรศัพท์</label>
                            <input type="tel" id="companyPhone" value={data.companyPhone} onChange={(e) => handleDataChange('companyPhone', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" placeholder="เช่น 02-xxx-xxxx" />
                        </div>
                        <div>
                            <label htmlFor="companyEmail" className="block text-sm font-medium text-slate-700">อีเมล/เว็บไซต์</label>
                            <input type="text" id="companyEmail" value={data.companyEmail} onChange={(e) => handleDataChange('companyEmail', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" placeholder="เช่น info@company.com" />
                        </div>
                    </div>
                </div>
            
                <FormDivider title="ข้อมูลลูกค้า/โครงการ" />
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
                                    handleDataChange('customerAddress', profile.address);
                                    setShowCustomerSelector(false);
                                }}
                            />
                        )}
                    </div>

                    <div>
                        <label htmlFor="projectName" className="block text-sm font-medium text-slate-700">ชื่อโครงการ</label>
                        <input type="text" id="projectName" value={data.projectName} onChange={(e) => handleDataChange('projectName', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" placeholder="เช่น โครงการบ้านมหาสารคาม" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="customerName" className="block text-sm font-medium text-slate-700">ชื่อลูกค้า</label>
                            <input type="text" id="customerName" value={data.customerName} onChange={(e) => handleDataChange('customerName', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" placeholder="เช่น คุณชัยทัต" />
                        </div>
                        <div>
                            <label htmlFor="customerPhone" className="block text-sm font-medium text-slate-700">โทรศัพท์ลูกค้า</label>
                            <input type="tel" id="customerPhone" value={data.customerPhone} onChange={(e) => handleDataChange('customerPhone', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" placeholder="เช่น 089-xxx-xxxx" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="customerAddress" className="block text-sm font-medium text-slate-700">ที่อยู่โครงการ/ลูกค้า</label>
                        <textarea id="customerAddress" value={data.customerAddress} onChange={(e) => handleDataChange('customerAddress', e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" placeholder="เช่น 123 หมู่ 5 ตำบลแวง อำเภอแกดำ มหาสารคาม" />
                    </div>
                    <div>
                        <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-700">วันที่ส่งมอบสินค้า</label>
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
                                    handleDataChange('productDetail', template.productDetail);
                                    handleDataChange('houseModel', template.houseModel);
                                    handleDataChange('batchNo', template.batchNo);
                                    handleDataChange('warrantyPeriod', template.warrantyPeriod);
                                    handleDataChange('terms', template.terms);
                                    setShowServiceSelector(false);
                                }}
                            />
                        )}
                    </div>

                    <div>
                        <label htmlFor="serviceName" className="block text-sm font-medium text-slate-700">ประเภทสินค้า</label>
                        <input 
                            type="text" 
                            id="serviceName" 
                            value={data.serviceName} 
                            onChange={(e) => handleDataChange('serviceName', e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                            placeholder="เช่น โครงสร้างสำเร็จระบบ Fully precast concrete"
                        />
                    </div>
                    <div>
                        <label htmlFor="productDetail" className="block text-sm font-medium text-slate-700">รายการสินค้า</label>
                        <input 
                            type="text" 
                            id="productDetail" 
                            value={data.productDetail} 
                            onChange={(e) => handleDataChange('productDetail', e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                            placeholder="เช่น โครงสร้างสำเร็จรูป"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="houseModel" className="block text-sm font-medium text-slate-700">แบบบ้าน</label>
                            <input 
                                type="text" 
                                id="houseModel" 
                                value={data.houseModel} 
                                onChange={(e) => handleDataChange('houseModel', e.target.value)} 
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                                placeholder="เช่น A01, Modern Loft"
                            />
                        </div>
                        <div>
                            <label htmlFor="batchNo" className="block text-sm font-medium text-slate-700">หมายเลขการผลิต (Batch No.)</label>
                            <input 
                                type="text" 
                                id="batchNo" 
                                value={data.batchNo} 
                                onChange={(e) => handleDataChange('batchNo', e.target.value)} 
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                                placeholder="เช่น BATCH-2025-08-A01"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="warrantyPeriod" className="block text-sm font-medium text-slate-700">ระยะเวลารับประกัน</label>
                        <input 
                            type="text" 
                            id="warrantyPeriod" 
                            value={data.warrantyPeriod} 
                            onChange={(e) => handleDataChange('warrantyPeriod', e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                            placeholder="เช่น 3 ปี, 5 ปี"
                        />
                    </div>
                </div>

                <FormDivider title="การรับประกัน" />
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="warrantyEndDate" className="block text-sm font-medium text-slate-700">วันสิ้นสุดการรับประกัน</label>
                            <input 
                                type="date" 
                                id="warrantyEndDate" 
                                value={formatDateForInput(data.warrantyEndDate)} 
                                onChange={(e) => handleDataChange('warrantyEndDate', e.target.value ? new Date(e.target.value) : null)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                            />
                            <p className="mt-1 text-xs text-gray-500">💡 จะคำนวณอัตโนมัติจากวันส่งมอบ + ระยะเวลารับประกัน</p>
                        </div>
                        <div>
                            <label htmlFor="issueDate" className="block text-sm font-medium text-slate-700">วันที่ออกเอกสาร</label>
                            <input 
                                type="date" 
                                id="issueDate" 
                                value={formatDateForInput(data.issueDate)} 
                                onChange={(e) => handleDataChange('issueDate', e.target.value ? new Date(e.target.value) : null)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="warrantyNumber" className="block text-sm font-medium text-slate-700">เลขที่ใบรับประกัน</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    id="warrantyNumber" 
                                    value={data.warrantyNumber} 
                                    onChange={(e) => handleDataChange('warrantyNumber', e.target.value)} 
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                                    placeholder="WR-25101001"
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateWarrantyNumber}
                                    disabled={isGeneratingSerialNumber}
                                    className="px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 whitespace-nowrap"
                                >
                                    {isGeneratingSerialNumber ? '...' : '🔄 Auto'}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">💡 จะสร้างอัตโนมัติ (รูปแบบ: WR-YYMMDDXX)</p>
                        </div>
                        <div>
                            <label htmlFor="issuedBy" className="block text-sm font-medium text-slate-700">ผู้ออกเอกสาร</label>
                            <input 
                                type="text" 
                                id="issuedBy" 
                                value={data.issuedBy} 
                                onChange={(e) => handleDataChange('issuedBy', e.target.value)} 
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" 
                                placeholder="เช่น ฝ่ายขาย / คุณสมชาย"
                            />
                        </div>
                    </div>
                </div>

                <FormDivider title="เงื่อนไขการรับประกัน" />
                <div>
                     <textarea id="terms" value={data.terms} onChange={(e) => handleDataChange('terms', e.target.value)} rows={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" placeholder="ระบุเงื่อนไขการรับประกัน ขอบเขต และข้อจำกัดต่างๆ" />
                </div>
            </div>
        </div>
    );
};

export default WarrantyForm;
export default WarrantyForm;