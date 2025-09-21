import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DeliveryNoteData, WarrantyData } from './types';
import Header from './components/Header';
import DeliveryForm from './components/DeliveryForm';
import DocumentPreview from './components/DocumentPreview';
import WarrantyForm from './components/WarrantyForm';
import WarrantyPreview from './components/WarrantyPreview';
import { generatePdf } from './services/pdfGenerator';

const initialDeliveryData: DeliveryNoteData = {
    logo: null,
    fromCompany: 'บริษัท ต้นทาง จำกัด (มหาชน)',
    fromAddress: '123 ถนนสุขุมวิท, แขวงคลองเตย, เขตคลองเตย, กรุงเทพมหานคร 10110',
    toCompany: 'บริษัท ปลายทาง คอร์ปอเรชั่น',
    toAddress: '456 ถนนสีลม, แขวงสุริยวงศ์, เขตบางรัก, กรุงเทพมหานคร 10500',
    docNumber: `DN-${new Date().getFullYear()}-001`,
    date: new Date(),
    project: 'โครงการพัฒนาระบบ ERP',
    items: [
        { description: 'ออกแบบ UI/UX สำหรับหน้า Dashboard', quantity: 1, unit: 'งาน', notes: '' },
        { description: 'พัฒนา Backend API สำหรับระบบสมาชิก', quantity: 1, unit: 'งาน', notes: 'ทดสอบการทำงานเรียบร้อย' },
    ],
    senderName: 'สมชาย ใจดี',
    receiverName: '',
};

const initialWarrantyData: WarrantyData = {
    logo: null,
    companyName: 'บริษัท สินค้าดี จำกัด',
    companyAddress: '789 ถนนเพชรบุรี, แขวงทุ่งพญาไท, เขตราชเทวี, กรุงเทพมหานคร 10400',
    customerName: 'คุณสุนทรี มีสุข',
    customerContact: '081-234-5678',
    productName: 'เครื่องฟอกอากาศ รุ่น Pro+',
    serialNumber: 'SN-PRO-987654',
    purchaseDate: new Date(),
    warrantyPeriod: '2 ปี',
    terms: `1. การรับประกันนี้ครอบคลุมเฉพาะความเสียหายที่เกิดจากความบกพร่องในการผลิตเท่านั้น
2. บริษัทฯ จะไม่รับประกันความเสียหายที่เกิดจากการใช้งานผิดประเภท อุบัติเหตุ หรือการดัดแปลงแก้ไข
3. กรุณาเก็บใบรับประกันนี้ไว้เป็นหลักฐานในการขอรับบริการ`
};

type DocType = 'delivery' | 'warranty';
type Notification = { show: boolean; message: string; type: 'success' | 'info' | 'error' };

const App: React.FC = () => {
    const [deliveryData, setDeliveryData] = useState<DeliveryNoteData>(initialDeliveryData);
    const [warrantyData, setWarrantyData] = useState<WarrantyData>(initialWarrantyData);
    const [activeTab, setActiveTab] = useState<DocType>('delivery');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'info' });
    const printableAreaRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showToast = (message: string, type: 'success' | 'info' | 'error') => {
        setNotification({ show: true, message, type });
    };

    const handleExportPdf = useCallback(async () => {
        if (!printableAreaRef.current) return;
        
        setIsLoading(true);
        showToast('กำลังสร้าง PDF...', 'info');

        const filename = activeTab === 'delivery' 
            ? `delivery-note-${deliveryData.docNumber}.pdf` 
            : `warranty-card-${warrantyData.serialNumber}.pdf`;

        try {
            await generatePdf(printableAreaRef.current, filename);
            showToast('สร้างไฟล์ PDF เรียบร้อยแล้ว', 'success');
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            showToast('ไม่สามารถสร้างไฟล์ PDF ได้', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, deliveryData.docNumber, warrantyData.serialNumber]);
    
    const notificationColors = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        error: 'bg-red-500',
    };

    return (
        <div className="bg-slate-100 min-h-screen text-slate-800">
            {notification.show && (
                <div className={`fixed top-5 right-5 ${notificationColors[notification.type]} text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-down`}>
                    {notification.message}
                </div>
            )}
            <Header />
            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
                    
                    {/* Form Section */}
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-8 lg:mb-0">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('delivery')}
                                    className={`${activeTab === 'delivery' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    ใบส่งมอบงาน
                                </button>
                                <button
                                    onClick={() => setActiveTab('warranty')}
                                    className={`${activeTab === 'warranty' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    ใบรับประกันสินค้า
                                </button>
                            </nav>
                        </div>
                        
                        {activeTab === 'delivery' ? (
                            <DeliveryForm
                                data={deliveryData}
                                setData={setDeliveryData}
                            />
                        ) : (
                            <WarrantyForm
                                data={warrantyData}
                                setData={setWarrantyData}
                            />
                        )}
                    </div>
                    
                    {/* Preview Section */}
                    <div>
                        <div className="sticky top-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-slate-700">ตัวอย่างเอกสาร</h2>
                                <button
                                    type="button"
                                    onClick={handleExportPdf}
                                    disabled={isLoading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {isLoading ? 'กำลังสร้าง...' : 'ดาวน์โหลด PDF'}
                                </button>
                            </div>
                            <div className="bg-white p-1 rounded-lg shadow-lg">
                                {activeTab === 'delivery' ? (
                                    <DocumentPreview ref={printableAreaRef} data={deliveryData} />
                                ) : (
                                    <WarrantyPreview ref={printableAreaRef} data={warrantyData} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
