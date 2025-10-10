/**
 * ตัวอย่างการใช้งาน Document Number Service
 * 
 * ไฟล์นี้แสดงตัวอย่างการใช้งาน service สำหรับสร้างเลขที่เอกสารอัตโนมัติ
 * ในรูปแบบ prefix-YYMMDDXX
 */

import { 
    generateDocumentNumber, 
    getLastDocumentNumber,
    generateCustomDocumentNumber,
    isDocumentNumberAvailable,
    resetDailyCounter
} from '../services/documentNumber';

// ========================
// ตัวอย่างที่ 1: สร้างเลขที่เอกสารพื้นฐาน
// ========================

/**
 * สร้างเลขที่ใบส่งมอบงาน (Delivery Note)
 * รูปแบบ: DN-YYMMDDXX
 */
async function createDeliveryNoteNumber() {
    try {
        const docNumber = await generateDocumentNumber('delivery');
        console.log('Delivery Note Number:', docNumber);
        // ผลลัพธ์: DN-25101001, DN-25101002, DN-25101003, ...
        
        return docNumber;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

/**
 * สร้างหมายเลขใบรับประกัน (Warranty Card)
 * รูปแบบ: WR-YYMMDDXX
 */
async function createWarrantyNumber() {
    try {
        const serialNumber = await generateDocumentNumber('warranty');
        console.log('Warranty Number:', serialNumber);
        // ผลลัพธ์: WR-25101001, WR-25101002, WR-25101003, ...
        
        return serialNumber;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ========================
// ตัวอย่างที่ 2: ใช้ Custom Prefix
// ========================

/**
 * สร้างเลขที่เอกสารด้วย Prefix กำหนดเอง
 * เหมาะสำหรับองค์กรที่มีรูปแบบเลขที่เอกสารเป็นของตัวเอง
 */
async function createCustomPrefixNumber() {
    try {
        // ใช้ prefix "DEL" แทน "DN"
        const deliveryNumber = await generateDocumentNumber('delivery', 'DEL');
        console.log('Custom Delivery Number:', deliveryNumber);
        // ผลลัพธ์: DEL-25101001
        
        // ใช้ prefix "WAR" แทน "WR"
        const warrantyNumber = await generateDocumentNumber('warranty', 'WAR');
        console.log('Custom Warranty Number:', warrantyNumber);
        // ผลลัพธ์: WAR-25101001
        
        // สามารถใช้ prefix อะไรก็ได้
        const invoiceNumber = await generateDocumentNumber('delivery', 'INV');
        console.log('Invoice Number:', invoiceNumber);
        // ผลลัพธ์: INV-25101001
        
        return { deliveryNumber, warrantyNumber, invoiceNumber };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ========================
// ตัวอย่างที่ 3: ดึงเลขที่เอกสารล่าสุด
// ========================

/**
 * ดูเลขที่เอกสารล่าสุดที่สร้างไป
 * เหมาะสำหรับแสดงผลหรือตรวจสอบ
 */
async function checkLastDocumentNumber() {
    try {
        // ดูเลขที่ใบส่งมอบงานล่าสุด
        const lastDeliveryNote = await getLastDocumentNumber('delivery');
        console.log('Last Delivery Note:', lastDeliveryNote || 'ยังไม่มี');
        // ผลลัพธ์: DN-25101003 (ถ้ามี) หรือ null (ถ้ายังไม่มี)
        
        // ดูเลขที่ใบรับประกันล่าสุด
        const lastWarranty = await getLastDocumentNumber('warranty');
        console.log('Last Warranty:', lastWarranty || 'ยังไม่มี');
        
        // ดูเลขที่เอกสาร custom prefix ล่าสุด
        const lastInvoice = await getLastDocumentNumber('delivery', 'INV');
        console.log('Last Invoice:', lastInvoice || 'ยังไม่มี');
        
        return { lastDeliveryNote, lastWarranty, lastInvoice };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ========================
// ตัวอย่างที่ 4: สร้างเลขที่เอกสารแบบ Custom
// ========================

/**
 * สร้างเลขที่เอกสารแบบกำหนดเองโดยไม่ใช้ running number
 * เหมาะสำหรับกรณีพิเศษหรือการนำเข้าข้อมูลเก่า
 */
function createManualDocumentNumber() {
    // สร้างเลขที่เอกสารด้วย suffix กำหนดเอง
    const manualNumber1 = generateCustomDocumentNumber('DN', '001');
    console.log('Manual Document Number 1:', manualNumber1);
    // ผลลัพธ์: DN-251010001
    
    const manualNumber2 = generateCustomDocumentNumber('INV', 'SPECIAL');
    console.log('Manual Document Number 2:', manualNumber2);
    // ผลลัพธ์: INV-251010SPECIAL
    
    // สร้างแบบไม่มี suffix
    const manualNumber3 = generateCustomDocumentNumber('DOC');
    console.log('Manual Document Number 3:', manualNumber3);
    // ผลลัพธ์: DOC-251010
    
    return { manualNumber1, manualNumber2, manualNumber3 };
}

// ========================
// ตัวอย่างที่ 5: ตรวจสอบว่าเลขที่เอกสารซ้ำหรือไม่
// ========================

/**
 * ตรวจสอบว่าเลขที่เอกสารที่ต้องการใช้นั้นพร้อมใช้งานหรือไม่
 * เหมาะสำหรับกรณีที่ต้องการใช้เลขที่เอกสารแบบกำหนดเอง
 */
async function checkDocumentNumberAvailability() {
    try {
        // ตรวจสอบเลขที่เอกสารที่ยังไม่ถูกใช้
        const isAvailable1 = await isDocumentNumberAvailable('DN-25101099');
        console.log('DN-25101099 Available:', isAvailable1);
        // ผลลัพธ์: true (ถ้ายังไม่มีใครใช้)
        
        // ตรวจสอบเลขที่เอกสารที่ถูกใช้ไปแล้ว
        const isAvailable2 = await isDocumentNumberAvailable('DN-25101001');
        console.log('DN-25101001 Available:', isAvailable2);
        // ผลลัพธ์: false (ถ้ามีใครใช้แล้ว)
        
        return { isAvailable1, isAvailable2 };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ========================
// ตัวอย่างที่ 6: รีเซ็ต Running Number
// ========================

/**
 * รีเซ็ต running number สำหรับวันใหม่
 * หมายเหตุ: โดยปกติไม่จำเป็นต้องเรียกใช้เอง เพราะระบบจะตรวจสอบวันที่อัตโนมัติ
 */
async function resetDocumentCounter() {
    try {
        // รีเซ็ต counter สำหรับ Delivery Note
        await resetDailyCounter('delivery');
        console.log('Delivery Note counter reset successfully');
        
        // รีเซ็ต counter สำหรับ Warranty
        await resetDailyCounter('warranty');
        console.log('Warranty counter reset successfully');
        
        // รีเซ็ต counter สำหรับ custom prefix
        await resetDailyCounter('delivery', 'INV');
        console.log('Invoice counter reset successfully');
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ========================
// ตัวอย่างที่ 7: การใช้งานในฟอร์ม React Component
// ========================

/**
 * ตัวอย่างการใช้งานใน React Component
 * (แสดงเฉพาะ logic ส่วนที่เกี่ยวข้อง)
 */
const ReactComponentExample = () => {
    // ใน React Component
    const [docNumber, setDocNumber] = React.useState('');
    const [isGenerating, setIsGenerating] = React.useState(false);
    
    const handleGenerateDocNumber = async () => {
        setIsGenerating(true);
        try {
            const newDocNumber = await generateDocumentNumber('delivery');
            setDocNumber(newDocNumber);
            console.log('Generated:', newDocNumber);
        } catch (error) {
            console.error('Error generating document number:', error);
            alert('ไม่สามารถสร้างเลขที่เอกสารได้');
        } finally {
            setIsGenerating(false);
        }
    };
    
    return {
        docNumber,
        isGenerating,
        handleGenerateDocNumber
    };
};

// ========================
// ตัวอย่างที่ 8: การใช้งานแบบ Batch (สร้างหลายเลขที่พร้อมกัน)
// ========================

/**
 * สร้างเลขที่เอกสารหลายเลขพร้อมกัน
 * เหมาะสำหรับกรณีที่ต้องการสร้างเอกสารหลายฉบับพร้อมกัน
 */
async function batchGenerateDocumentNumbers(count: number = 5) {
    try {
        const numbers: string[] = [];
        
        console.log(`Generating ${count} document numbers...`);
        
        for (let i = 0; i < count; i++) {
            const docNumber = await generateDocumentNumber('delivery');
            numbers.push(docNumber);
            console.log(`Generated #${i + 1}:`, docNumber);
        }
        
        console.log('All generated numbers:', numbers);
        // ผลลัพธ์: ['DN-25101001', 'DN-25101002', 'DN-25101003', ...]
        
        return numbers;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ========================
// ตัวอย่างที่ 9: การจัดการ Error
// ========================

/**
 * ตัวอย่างการจัดการ Error ที่อาจเกิดขึ้น
 */
async function handleErrors() {
    try {
        // พยายามสร้างเลขที่เอกสารโดยไม่ได้ Login
        const docNumber = await generateDocumentNumber('delivery');
        console.log('Document Number:', docNumber);
        
    } catch (error) {
        // จัดการ Error ที่อาจเกิดขึ้น
        if (error instanceof Error) {
            if (error.message.includes('Login')) {
                console.error('Error: ผู้ใช้ยังไม่ได้ Login');
                // redirect ไปหน้า login หรือแสดง modal
            } else if (error.message.includes('สร้างเลขที่เอกสาร')) {
                console.error('Error: ไม่สามารถสร้างเลขที่เอกสารได้');
                // แสดง error message ให้ผู้ใช้
            } else {
                console.error('Unexpected Error:', error.message);
            }
        }
        
        throw error;
    }
}

// ========================
// Export ตัวอย่างทั้งหมด
// ========================

export {
    createDeliveryNoteNumber,
    createWarrantyNumber,
    createCustomPrefixNumber,
    checkLastDocumentNumber,
    createManualDocumentNumber,
    checkDocumentNumberAvailability,
    resetDocumentCounter,
    ReactComponentExample,
    batchGenerateDocumentNumbers,
    handleErrors
};

// ========================
// วิธีการใช้งาน (ถ้าต้องการทดสอบ)
// ========================

/*
// วิธีการใช้งานในไฟล์ .ts หรือ .tsx อื่น:

import { 
    createDeliveryNoteNumber,
    createWarrantyNumber,
    createCustomPrefixNumber 
} from './examples/documentNumberExample';

// ใช้งานในฟังก์ชัน async
async function test() {
    // สร้างเลขที่ใบส่งมอบงาน
    const deliveryNote = await createDeliveryNoteNumber();
    
    // สร้างหมายเลขใบรับประกัน
    const warranty = await createWarrantyNumber();
    
    // สร้างเลขที่เอกสารด้วย custom prefix
    const customNumbers = await createCustomPrefixNumber();
    
    console.log({
        deliveryNote,
        warranty,
        customNumbers
    });
}

test();
*/

