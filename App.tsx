import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DeliveryNoteData, WarrantyData, LogoType } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { CompanyProvider, useCompany } from './contexts/CompanyContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import DeliveryForm from './components/DeliveryForm';
import DocumentPreview from './components/DocumentPreview';
import WarrantyForm from './components/WarrantyForm';
import WarrantyPreview from './components/WarrantyPreview';
import HistoryList from './components/HistoryList';
import { generatePdf } from './services/pdfGenerator';
import { saveDeliveryNote, saveWarrantyCard } from './services/firestore';
import type { DeliveryNoteDocument, WarrantyDocument } from './services/firestore';

const getInitialDeliveryData = (): DeliveryNoteData => ({
    logo: null,
    fromCompany: '',
    fromAddress: '',
    toCompany: '',
    toAddress: '',
    docNumber: '', // จะถูก auto-generate ใน DeliveryForm
    date: new Date(),
    project: '',
    items: [
        { description: '', quantity: 1, unit: 'งาน', notes: '' },
    ],
    senderName: '',
    receiverName: '',
});

const initialDeliveryData = getInitialDeliveryData();

const initialWarrantyData: WarrantyData = {
    logo: null,
    // ข้อมูลบริษัท
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    // ข้อมูลลูกค้า/โครงการ
    projectName: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    // ข้อมูลสินค้า/บริการ
    serviceName: '',
    productDetail: '',
    houseModel: '',
    purchaseDate: new Date(),
    // การรับประกัน
    warrantyPeriod: '',
    warrantyEndDate: null,
    terms: '',
    // ข้อมูลเอกสาร
    warrantyNumber: '',
    issueDate: new Date(),
    issuedBy: ''
};

type DocType = 'delivery' | 'warranty';
type ViewMode = 'form' | 'history';
type Notification = { show: boolean; message: string; type: 'success' | 'info' | 'error' };

// Main Content Component ที่ใช้ useCompany hook
const AppContent: React.FC = () => {
    const { currentCompany } = useCompany(); // ใช้ CompanyContext
    const [deliveryData, setDeliveryData] = useState<DeliveryNoteData>(initialDeliveryData);
    const [warrantyData, setWarrantyData] = useState<WarrantyData>(initialWarrantyData);
    const [activeTab, setActiveTab] = useState<DocType>('delivery');
    const [viewMode, setViewMode] = useState<ViewMode>('form');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'info' });
    const printableAreaRef = useRef<HTMLDivElement>(null);
    
    // Shared Logo State - ใช้ร่วมกันระหว่างทั้ง 2 แท็บ
    const [sharedLogo, setSharedLogo] = useState<string | null>(null);
    const [sharedLogoUrl, setSharedLogoUrl] = useState<string | null>(null);
    const [sharedLogoType, setSharedLogoType] = useState<LogoType>('default');
    
    // Sync shared logo กับ delivery และ warranty data
    useEffect(() => {
        setDeliveryData(prev => ({
            ...prev,
            logo: sharedLogo,
            logoUrl: sharedLogoUrl,
            logoType: sharedLogoType,
        }));
        setWarrantyData(prev => ({
            ...prev,
            logo: sharedLogo,
            logoUrl: sharedLogoUrl,
            logoType: sharedLogoType,
        }));
    }, [sharedLogo, sharedLogoUrl, sharedLogoType]);
    
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

    // ฟังก์ชันบันทึกข้อมูลลง Firestore พร้อม companyId
    const handleSaveToFirestore = useCallback(async () => {
        setIsSaving(true);
        showToast('กำลังบันทึกข้อมูล...', 'info');

        try {
            const companyId = currentCompany?.id; // ดึง companyId จาก context
            
            if (activeTab === 'delivery') {
                const id = await saveDeliveryNote(deliveryData, companyId);
                showToast(`บันทึกใบส่งมอบงานสำเร็จ (ID: ${id})`, 'success');
            } else {
                const id = await saveWarrantyCard(warrantyData, companyId);
                showToast(`บันทึกใบรับประกันสำเร็จ (ID: ${id})`, 'success');
            }
        } catch (error) {
            console.error('Failed to save to Firestore:', error);
            showToast('ไม่สามารถบันทึกข้อมูลได้', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [activeTab, deliveryData, warrantyData, currentCompany]);

    // ฟังก์ชัน Export PDF
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

    // ฟังก์ชันโหลดเอกสารจาก History
    const handleLoadDocument = useCallback((doc: DeliveryNoteDocument | WarrantyDocument) => {
        if ('project' in doc) {
            // เป็น DeliveryNoteDocument
            setDeliveryData({
                ...doc,
                date: doc.date || null,
            });
            setActiveTab('delivery');
        } else {
            // เป็น WarrantyDocument
            setWarrantyData({
                ...doc,
                purchaseDate: doc.purchaseDate || null,
            });
            setActiveTab('warranty');
        }
        setViewMode('form');
        showToast('โหลดเอกสารสำเร็จ', 'success');
    }, []);

    // ฟังก์ชันสร้างฟอร์มใหม่
    const handleCreateNewForm = useCallback(() => {
        if (activeTab === 'delivery') {
            setDeliveryData(getInitialDeliveryData());
        } else {
            setWarrantyData({
                logo: sharedLogo,
                logoUrl: sharedLogoUrl,
                logoType: sharedLogoType,
                companyName: '',
                companyAddress: '',
                customerName: '',
                customerContact: '',
                productName: '',
                serialNumber: '',
                purchaseDate: new Date(),
                warrantyPeriod: '',
                terms: ''
            });
        }
        showToast('สร้างฟอร์มใหม่สำเร็จ', 'success');
    }, [activeTab, sharedLogo, sharedLogoUrl, sharedLogoType]);
    
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
                {/* View Mode Selector */}
                <div className="mb-6 flex justify-center">
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                            onClick={() => setViewMode('form')}
                            className={`px-6 py-2 text-sm font-medium rounded-l-lg border ${
                                viewMode === 'form'
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            📝 สร้างเอกสาร
                        </button>
                        <button
                            onClick={() => setViewMode('history')}
                            className={`px-6 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${
                                viewMode === 'history'
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            📋 ประวัติเอกสาร
                        </button>
                    </div>
                </div>

                {viewMode === 'form' ? (
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
                                    sharedLogo={sharedLogo}
                                    sharedLogoUrl={sharedLogoUrl}
                                    sharedLogoType={sharedLogoType}
                                    onLogoChange={(logo, logoUrl, logoType) => {
                                        setSharedLogo(logo);
                                        setSharedLogoUrl(logoUrl);
                                        setSharedLogoType(logoType);
                                    }}
                                />
                            ) : (
                                <WarrantyForm
                                    data={warrantyData}
                                    setData={setWarrantyData}
                                    sharedLogo={sharedLogo}
                                    sharedLogoUrl={sharedLogoUrl}
                                    sharedLogoType={sharedLogoType}
                                    onLogoChange={(logo, logoUrl, logoType) => {
                                        setSharedLogo(logo);
                                        setSharedLogoUrl(logoUrl);
                                        setSharedLogoType(logoType);
                                    }}
                                />
                            )}
                        </div>
                        
                        {/* Preview Section */}
                        <div>
                            <div className="sticky top-8">
                                <div className="flex justify-between items-center mb-4 gap-2">
                                    <h2 className="text-xl font-semibold text-slate-700">ตัวอย่างเอกสาร</h2>
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={handleCreateNewForm}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            ฟอร์มใหม่
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveToFirestore}
                                            disabled={isSaving}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? (
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                                                </svg>
                                            )}
                                            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleExportPdf}
                                            disabled={isLoading}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {isLoading ? 'กำลังสร้าง...' : 'PDF'}
                                        </button>
                                    </div>
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
                ) : (
                    // History View
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <HistoryList 
                            activeDocType={activeTab} 
                            onLoadDocument={handleLoadDocument}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

// Main App Component with Providers
const App: React.FC = () => {
    return (
        <AuthProvider>
            <CompanyProvider>
                <ProtectedRoute>
                    <AppContent />
                </ProtectedRoute>
            </CompanyProvider>
        </AuthProvider>
    );
};

export default App;
