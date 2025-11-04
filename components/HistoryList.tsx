import React, { useEffect, useState } from 'react';
import { getDeliveryNotes, getWarrantyCards, deleteDeliveryNote, deleteWarrantyCard } from '../services/firestore';
import type { DeliveryNoteDocument, WarrantyDocument } from '../services/firestore';
import { useCompany } from '../contexts/CompanyContext';

interface HistoryListProps {
    activeDocType: 'delivery' | 'warranty';
    onLoadDocument: (doc: DeliveryNoteDocument | WarrantyDocument) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ activeDocType, onLoadDocument }) => {
    const { currentCompany } = useCompany(); // ใช้ CompanyContext
    const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNoteDocument[]>([]);
    const [warrantyCards, setWarrantyCards] = useState<WarrantyDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'delivery' | 'warranty', id: string } | null>(null);

    // โหลดข้อมูลจาก Firestore กรองตาม companyId
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const companyId = currentCompany?.id; // ดึง companyId จาก context
            
            if (activeDocType === 'delivery') {
                const notes = await getDeliveryNotes(50, companyId);
                setDeliveryNotes(notes);
            } else {
                const cards = await getWarrantyCards(50, companyId);
                setWarrantyCards(cards);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeDocType, currentCompany]); // เพิ่ม currentCompany เป็น dependency

    // ฟังก์ชันลบเอกสาร
    const handleDelete = async (type: 'delivery' | 'warranty', id: string) => {
        try {
            if (type === 'delivery') {
                await deleteDeliveryNote(id);
                setDeliveryNotes(prev => prev.filter(note => note.id !== id));
            } else {
                await deleteWarrantyCard(id);
                setWarrantyCards(prev => prev.filter(card => card.id !== id));
            }
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Error deleting document:', err);
            alert('ไม่สามารถลบเอกสารได้');
        }
    };

    // ฟอร์แมตวันที่
    const formatDate = (date: Date | undefined) => {
        if (!date) return 'ไม่ระบุ';
        return new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // แสดง Loading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // แสดง Error
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={fetchData}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    ลองใหม่
                </button>
            </div>
        );
    }

    const currentList = activeDocType === 'delivery' ? deliveryNotes : warrantyCards;

    // แสดงเมื่อไม่มีข้อมูล
    if (currentList.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่มีเอกสาร</h3>
                <p className="mt-1 text-sm text-gray-500">
                    เริ่มต้นโดยการสร้าง{activeDocType === 'delivery' ? 'ใบส่งมอบงาน' : 'ใบรับประกันสินค้า'}ใหม่
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Modal ยืนยันการลบ */}
            {deleteConfirm && (
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
                                    คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
                                </p>
                            </div>
                            <div className="items-center px-4 py-3 space-x-2">
                                <button
                                    onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
                                    className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    ลบ
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700">
                    ประวัติ{activeDocType === 'delivery' ? 'ใบส่งมอบงาน' : 'ใบรับประกันสินค้า'}
                </h2>
                <button
                    onClick={fetchData}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    รีเฟรช
                </button>
            </div>

            {/* รายการเอกสาร */}
            <div className="grid grid-cols-1 gap-4">
                {activeDocType === 'delivery' ? (
                    // รายการใบส่งมอบงาน
                    deliveryNotes.map((note) => (
                        <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{note.project || 'ไม่ระบุโครงการ'}</h3>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">เลขที่:</span> {note.docNumber}
                                        </div>
                                        <div>
                                            <span className="font-medium">วันที่:</span> {note.date ? formatDate(note.date) : 'ไม่ระบุ'}
                                        </div>
                                        <div>
                                            <span className="font-medium">จาก:</span> {note.fromCompany}
                                        </div>
                                        <div>
                                            <span className="font-medium">ถึง:</span> {note.toCompany}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        บันทึกเมื่อ: {formatDate(note.createdAt)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                    <button
                                        onClick={() => onLoadDocument(note)}
                                        className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 flex items-center gap-1"
                                        title="โหลดเอกสารเพื่อแก้ไข"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        ✏️ แก้ไข
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm({ type: 'delivery', id: note.id! })}
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // รายการใบรับประกันสินค้า
                    warrantyCards.map((card) => (
                        <div key={card.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{card.serviceName || card.projectName || 'ไม่ระบุสินค้า'}</h3>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">หมายเลข:</span> {card.warrantyNumber || 'ไม่ระบุ'}
                                        </div>
                                        <div>
                                            <span className="font-medium">ลูกค้า:</span> {card.customerName || 'ไม่ระบุ'}
                                        </div>
                                        <div>
                                            <span className="font-medium">วันซื้อ:</span> {card.purchaseDate ? formatDate(card.purchaseDate) : 'ไม่ระบุ'}
                                        </div>
                                        <div>
                                            <span className="font-medium">รับประกัน:</span> {card.warrantyPeriod || 'ไม่ระบุ'}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        บันทึกเมื่อ: {formatDate(card.createdAt)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                    <button
                                        onClick={() => onLoadDocument(card)}
                                        className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 flex items-center gap-1"
                                        title="โหลดเอกสารเพื่อแก้ไข"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        ✏️ แก้ไข
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm({ type: 'warranty', id: card.id! })}
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryList;
