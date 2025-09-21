import React, { useState, useRef, useCallback } from 'react';
import { DeliveryNoteData, WarrantyData } from './types';
import Header from './components/Header';
import DeliveryForm from './components/DeliveryForm';
import DocumentPreview from './components/DocumentPreview';
import WarrantyForm from './components/WarrantyForm';
import WarrantyPreview from './components/WarrantyPreview';
import { generatePdf } from './services/pdfGenerator';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';

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

const App: React.FC = () => {
    const [deliveryData, setDeliveryData] = useState<DeliveryNoteData>(initialDeliveryData);
    const [warrantyData, setWarrantyData] = useState<WarrantyData>(initialWarrantyData);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const printableAreaRef = useRef<HTMLDivElement>(null);
    
    const docType: DocType = activeTab === 0 ? 'delivery' : 'warranty';

    const handleExportPdf = useCallback(async () => {
        if (!printableAreaRef.current) return;
        
        setIsLoading(true);
        toast.current?.show({ severity: 'info', summary: 'กำลังสร้าง PDF', detail: 'กรุณารอสักครู่...', life: 3000 });

        const filename = docType === 'delivery' 
            ? `delivery-note-${deliveryData.docNumber}.pdf` 
            : `warranty-card-${warrantyData.serialNumber}.pdf`;

        try {
            await generatePdf(printableAreaRef.current, filename);
            toast.current?.show({ severity: 'success', summary: 'สำเร็จ', detail: 'สร้างไฟล์ PDF เรียบร้อยแล้ว', life: 3000 });
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            toast.current?.show({ severity: 'error', summary: 'ผิดพลาด', detail: 'ไม่สามารถสร้างไฟล์ PDF ได้', life: 3000 });
        } finally {
            setIsLoading(false);
        }
    }, [docType, deliveryData.docNumber, warrantyData.serialNumber]);

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800">
            <Toast ref={toast} />
            <Header />
            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
                    <div className="mb-8 lg:mb-0">
                         <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                            <TabPanel header="ใบส่งมอบงาน">
                                <DeliveryForm
                                    data={deliveryData}
                                    setData={setDeliveryData}
                                    onExportPdf={handleExportPdf}
                                    isLoading={isLoading}
                                />
                            </TabPanel>
                            <TabPanel header="ใบรับประกันสินค้า">
                                <WarrantyForm
                                    data={warrantyData}
                                    setData={setWarrantyData}
                                    onExportPdf={handleExportPdf}
                                    isLoading={isLoading}
                                />
                            </TabPanel>
                        </TabView>
                    </div>
                    <div>
                        <div className="sticky top-8">
                            <h2 className="text-xl font-semibold mb-4 text-slate-700">ตัวอย่างเอกสาร</h2>
                            {docType === 'delivery' ? (
                                <DocumentPreview ref={printableAreaRef} data={deliveryData} />
                            ) : (
                                <WarrantyPreview ref={printableAreaRef} data={warrantyData} />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
