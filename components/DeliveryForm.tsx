
import React, { useRef } from 'react';
import { DeliveryNoteData, WorkItem } from '../types';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { PrimeIcons } from 'primereact/api';
import { Divider } from 'primereact/divider';
import { InputNumber } from 'primereact/inputnumber';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

interface DeliveryFormProps {
    data: DeliveryNoteData;
    setData: React.Dispatch<React.SetStateAction<DeliveryNoteData>>;
    onExportPdf: () => void;
    isLoading: boolean;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ data, setData, onExportPdf, isLoading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDataChange = <K extends keyof DeliveryNoteData,>(key: K, value: DeliveryNoteData[K]) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const handleItemChange = (index: number, field: keyof WorkItem, value: string | number) => {
        const newItems = [...data.items];
        const item = { ...newItems[index] };
        (item[field] as any) = value;
        newItems[index] = item;
        setData(prev => ({ ...prev, items: newItems }));
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
    };

    const confirmRemoveItem = (index: number) => {
        confirmDialog({
            message: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?',
            header: 'ยืนยันการลบ',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'ลบ',
            rejectLabel: 'ยกเลิก',
            acceptClassName: 'p-button-danger',
            accept: () => removeItem(index),
        });
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
        <div className="space-y-6">
            <ConfirmDialog />
            <Panel header="ข้อมูลผู้ส่งมอบ">
                <div className="p-fluid space-y-4">
                    <div className="p-field">
                        <label htmlFor="logo" className="block text-sm font-medium text-slate-700 mb-1">โลโก้บริษัท</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml"
                                ref={fileInputRef}
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo"
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
                        <label htmlFor="fromCompany" className="block text-sm font-medium text-slate-700 mb-1">ชื่อบริษัท/ผู้ส่ง</label>
                        <InputText id="fromCompany" value={data.fromCompany} onChange={(e) => handleDataChange('fromCompany', e.target.value)} />
                    </div>
                    <div className="p-field">
                        <label htmlFor="fromAddress" className="block text-sm font-medium text-slate-700 mb-1">ที่อยู่</label>
                        <InputTextarea id="fromAddress" value={data.fromAddress} onChange={(e) => handleDataChange('fromAddress', e.target.value)} rows={3} autoResize />
                    </div>
                </div>
            </Panel>
            
            <Panel header="ข้อมูลผู้รับมอบ">
                <div className="p-fluid space-y-4">
                    <div className="p-field">
                        <label htmlFor="toCompany" className="block text-sm font-medium text-slate-700 mb-1">ชื่อบริษัท/ผู้รับ</label>
                        <InputText id="toCompany" value={data.toCompany} onChange={(e) => handleDataChange('toCompany', e.target.value)} />
                    </div>
                    <div className="p-field">
                        <label htmlFor="toAddress" className="block text-sm font-medium text-slate-700 mb-1">ที่อยู่</label>
                        <InputTextarea id="toAddress" value={data.toAddress} onChange={(e) => handleDataChange('toAddress', e.target.value)} rows={3} autoResize />
                    </div>
                </div>
            </Panel>

            <Panel header="รายละเอียดเอกสาร">
                <div className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-field">
                        <label htmlFor="docNumber" className="block text-sm font-medium text-slate-700 mb-1">เลขที่เอกสาร</label>
                        <InputText id="docNumber" value={data.docNumber} onChange={(e) => handleDataChange('docNumber', e.target.value)} />
                    </div>
                    <div className="p-field">
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">วันที่</label>
                        <Calendar id="date" value={data.date} onChange={(e) => handleDataChange('date', e.value || null)} showIcon dateFormat="dd/mm/yy" />
                    </div>
                     <div className="p-field md:col-span-2">
                        <label htmlFor="project" className="block text-sm font-medium text-slate-700 mb-1">โครงการ/เรื่อง</label>
                        <InputText id="project" value={data.project} onChange={(e) => handleDataChange('project', e.target.value)} />
                    </div>
                </div>
            </Panel>

            <Panel header="รายการส่งมอบ">
                <div className="space-y-4">
                    {data.items.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-slate-50 relative">
                            <button 
                                onClick={() => confirmRemoveItem(index)} 
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500"
                                aria-label={`Remove item ${index + 1}`}
                            >
                                <i className={PrimeIcons.TRASH}></i>
                            </button>
                            <div className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-field md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
                                    <InputTextarea value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} rows={2} autoResize/>
                                </div>
                                <div className="p-field">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">จำนวน</label>
                                    <InputNumber value={item.quantity} onValueChange={(e) => handleItemChange(index, 'quantity', e.value || 0)} min={0} />
                                </div>
                                <div className="p-field">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">หน่วย</label>
                                    <InputText value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} />
                                </div>
                                <div className="p-field md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
                                    <InputText value={item.notes} onChange={(e) => handleItemChange(index, 'notes', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Button label="เพิ่มรายการ" icon={PrimeIcons.PLUS} className="p-button-sm p-button-text mt-4" onClick={addItem} />
            </Panel>
            
            <Panel header="ข้อมูลผู้ลงนาม">
                <div className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-field">
                        <label htmlFor="senderName" className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ส่งมอบ</label>
                        <InputText id="senderName" value={data.senderName} onChange={(e) => handleDataChange('senderName', e.target.value)} />
                    </div>
                     <div className="p-field">
                        <label htmlFor="receiverName" className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้รับมอบ</label>
                        <InputText id="receiverName" value={data.receiverName} onChange={(e) => handleDataChange('receiverName', e.target.value)} placeholder="เว้นว่างไว้เพื่อลงนาม" />
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

export default DeliveryForm;
