/**
 * ServiceTemplateSelector Component
 * Component สำหรับเลือกและจัดการ Service Templates
 */

import React, { useState, useEffect } from 'react';
import { ServiceTemplate } from '../types';
import { getUserServiceTemplates, deleteServiceTemplate, saveServiceTemplate } from '../services/serviceTemplates';
import { useAuth } from '../contexts/AuthContext';

interface ServiceTemplateSelectorProps {
    onSelect: (template: ServiceTemplate) => void;
    onSaveNew?: (template: Omit<ServiceTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
}

const ServiceTemplateSelector: React.FC<ServiceTemplateSelectorProps> = ({ onSelect, onSaveNew }) => {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        serviceName: '',
        productDetail: '',
        houseModel: '',
        batchNo: '',
        warrantyPeriod: '',
        terms: ''
    });

    /**
     * โหลด Service Templates
     */
    const loadTemplates = async () => {
        if (!user) return;
        
        setIsLoading(true);
        try {
            const data = await getUserServiceTemplates(user.uid);
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, [user]);

    /**
     * ลบ Template
     */
    const handleDelete = async (id: string, event: React.MouseEvent) => {
        event.stopPropagation(); // ป้องกันไม่ให้ trigger การเลือก
        
        if (!confirm('ต้องการลบ Template นี้หรือไม่?')) {
            return;
        }

        try {
            await deleteServiceTemplate(id);
            await loadTemplates(); // โหลดใหม่
        } catch (error) {
            alert('ไม่สามารถลบ Template ได้');
        }
    };

    /**
     * บันทึก Template ใหม่
     */
    const handleSaveNew = async () => {
        if (!user) return;
        
        if (!newTemplate.serviceName || !newTemplate.productDetail) {
            alert('กรุณากรอกประเภทสินค้าและรายการสินค้า');
            return;
        }

        try {
            await saveServiceTemplate({
                ...newTemplate,
                userId: user.uid
            });
            
            setShowSaveDialog(false);
            setNewTemplate({
                serviceName: '',
                productDetail: '',
                houseModel: '',
                batchNo: '',
                warrantyPeriod: '',
                terms: ''
            });
            
            await loadTemplates(); // โหลดใหม่
            alert('✅ บันทึก Template สำเร็จ!');
        } catch (error) {
            alert('ไม่สามารถบันทึก Template ได้');
        }
    };

    // กรอง templates ตาม search text
    const filteredTemplates = templates.filter(t =>
        t.serviceName.toLowerCase().includes(searchText.toLowerCase()) ||
        t.houseModel.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">
                    📋 เลือกข้อมูลสินค้า/บริการที่บันทึกไว้
                </h3>
                <button
                    type="button"
                    onClick={() => setShowSaveDialog(!showSaveDialog)}
                    className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    {showSaveDialog ? 'ยกเลิก' : '+ บันทึกใหม่'}
                </button>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="mb-4 p-3 bg-white border border-indigo-200 rounded-md">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">บันทึก Template ใหม่</h4>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="ประเภทสินค้า * (เช่น โครงสร้างสำเร็จระบบ Fully precast)"
                            value={newTemplate.serviceName}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, serviceName: e.target.value }))}
                            className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <input
                            type="text"
                            placeholder="รายการสินค้า * (เช่น โครงสร้างสำเร็จรูป)"
                            value={newTemplate.productDetail}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, productDetail: e.target.value }))}
                            className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="แบบบ้าน (เช่น A01)"
                                value={newTemplate.houseModel}
                                onChange={(e) => setNewTemplate(prev => ({ ...prev, houseModel: e.target.value }))}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <input
                                type="text"
                                placeholder="Batch No."
                                value={newTemplate.batchNo}
                                onChange={(e) => setNewTemplate(prev => ({ ...prev, batchNo: e.target.value }))}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="ระยะเวลารับประกัน (เช่น 3 ปี)"
                            value={newTemplate.warrantyPeriod}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, warrantyPeriod: e.target.value }))}
                            className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <textarea
                            placeholder="เงื่อนไขการรับประกัน"
                            value={newTemplate.terms}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, terms: e.target.value }))}
                            rows={3}
                            className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button
                            type="button"
                            onClick={handleSaveNew}
                            className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                        >
                            💾 บันทึก
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="🔍 ค้นหา..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
                {isLoading ? (
                    <div className="text-center py-4 text-sm text-slate-500">
                        <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังโหลด...
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-4 text-sm text-slate-500">
                        {searchText ? `ไม่พบผลการค้นหา "${searchText}"` : 'ยังไม่มี Template ที่บันทึกไว้'}
                    </div>
                ) : (
                    filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => onSelect(template)}
                            className="relative p-3 bg-white border border-slate-200 rounded-md hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group"
                        >
                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDelete(template.id!, e)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="ลบ"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="text-sm">
                                <div className="font-semibold text-slate-800 mb-1">
                                    {template.serviceName}
                                </div>
                                <div className="text-xs text-slate-600 space-y-0.5">
                                    <div>🏠 <span className="font-medium">แบบ:</span> {template.houseModel}</div>
                                    {template.warrantyPeriod && (
                                        <div>⏰ <span className="font-medium">รับประกัน:</span> {template.warrantyPeriod}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-3 text-xs text-slate-500 text-center">
                💡 คลิกเพื่อเลือก Template • Hover เพื่อลบ
            </div>
        </div>
    );
};

export default ServiceTemplateSelector;

