import React, { useRef } from 'react';
import { WarrantyData } from '../types';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { PrimeIcons } from 'primereact/api';
import { Divider } from 'primereact/divider';

interface WarrantyFormProps {
    data: WarrantyData;
    setData: React.Dispatch<React.SetStateAction<WarrantyData>>;
    onExportPdf: () => void;
    isLoading: boolean;
}

const WarrantyForm: React.FC<WarrantyFormProps> = ({ data, setData, onExportPdf, isLoading }) => {
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
        <div className="space-y-6 pt-4">
            <Panel header="ข้อมูลบริษัท">
                <div className="p-fluid space-y-4">
                    <div className="p-field">
                        <label htmlFor="logo-warranty" className="block text-sm font-medium text-slate-700 mb-1">โลโก้บริษัท</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml"
                                ref={fileInputRef}
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-warranty"
                            />
                            <Button
                                type="button"
                                label="เลือกไฟล์"
                                icon={PrimeIcons.UPLOAD}
                                className="p-button-outlined"
                                onClick={() => fileInputRef.current?.click()}
                            />
                            {data.logo && (
                                <div className="flex items-center gap-2">
                                    <img src={data.logo} alt="logo preview" className="w-16 h-16 object-contain border p-1 rounded-md" />
                                    <Button
                                        type="button"
                                        icon={PrimeIcons.TIMES}
                                        className="p-button-rounded p-button-danger p-button-text"
                                        onClick={removeLogo}
                                        aria-label="Remove logo"
                                    />
                                </div>
                            )}
                        </div>
                         <small className="text-slate-500 mt-1 block">แนะนำไฟล์ .png, .jpg, or .svg</small>
                    </div>
                    <div className="p-field">
                        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">ชื่อบริษัท</label>
                        <InputText id="companyName" value={data.companyName} onChange={(e) => handleDataChange('companyName', e.target.value)} />
                    </div>
                    <div className="p-field">
                        <label htmlFor="companyAddress" className="block text-sm font-medium text-slate-700 mb-1">ที่อยู่</label>
                        <InputTextarea id="companyAddress" value={data.companyAddress} onChange={(e) => handleDataChange('companyAddress', e.target.value)} rows={3} autoResize />
                    </div>
                </div>
            </Panel>
            
            <Panel header="ข้อมูลลูกค้าและสินค้า">
                <div className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-field">
                        <label htmlFor="customerName" className="block text-sm font-medium text-slate-700 mb-1">ชื่อลูกค้า</label>
                        <InputText id="customerName" value={data.customerName} onChange={(e) => handleDataChange('customerName', e.target.value)} />
                    </div>
                    <div className="p-field">
                        <label htmlFor="customerContact" className="block text-sm font-medium text-slate-700 mb-1">ข้อมูลติดต่อ (โทรศัพท์/อีเมล)</label>
                        <InputText id="customerContact" value={data.customerContact} onChange={(e) => handleDataChange('customerContact', e.target.value)} />
                    </div>
                     <div className="p-field md:col-span-2">
                        <label htmlFor="productName" className="block text-sm font-medium text-slate-700 mb-1">ชื่อสินค้า/รุ่น</label>
                        <InputText id="productName" value={data.productName} onChange={(e) => handleDataChange('productName', e.target.value)} />
                    </div>
                    <div className="p-field">
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-slate-700 mb-1">หมายเลขเครื่อง (Serial No.)</label>
                        <InputText id="serialNumber" value={data.serialNumber} onChange={(e) => handleDataChange('serialNumber', e.target.value)} />
                    </div>
                     <div className="p-field">
                        <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-700 mb-1">วันที่ซื้อ</label>
                        <Calendar id="purchaseDate" value={data.purchaseDate} onChange={(e) => handleDataChange('purchaseDate', e.value || null)} showIcon dateFormat="dd/mm/yy" />
                    </div>
                    <div className="p-field">
                        <label htmlFor="warrantyPeriod" className="block text-sm font-medium text-slate-700 mb-1">ระยะเวลารับประกัน</label>
                        <InputText id="warrantyPeriod" value={data.warrantyPeriod} onChange={(e) => handleDataChange('warrantyPeriod', e.target.value)} />
                    </div>
                </div>
            </Panel>

            <Panel header="เงื่อนไขการรับประกัน">
                <div className="p-fluid">
                    <div className="p-field">
                        <InputTextarea value={data.terms} onChange={(e) => handleDataChange('terms', e.target.value)} rows={5} autoResize/>
                    </div>
                </div>
            </Panel>

            <Divider />

            <Button
                label="สร้างและดาวน์โหลด PDF"
                icon={PrimeIcons.DOWNLOAD}
                className="w-full p-button-lg"
                onClick={onExportPdf}
                loading={isLoading}
                disabled={isLoading}
            />
        </div>
    );
};

export default WarrantyForm;
