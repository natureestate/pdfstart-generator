export interface WorkItem {
    description: string;
    quantity: number;
    unit: string;
    notes: string;
}

// ประเภทของโลโก้
export type LogoType = 'default' | 'custom' | 'uploaded';

// ข้อมูลบริษัท
export interface Company {
    id?: string;
    name: string;              // ชื่อบริษัท
    address?: string;          // ที่อยู่บริษัท (optional)
    userId: string;            // Admin (คนที่สร้างบริษัท - มีสิทธิ์ลบ)
    logoUrl?: string | null;   // โลโก้บริษัท
    logoType?: LogoType;       // ประเภทโลโก้
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DeliveryNoteData {
    logo: string | null;          // Base64 string หรือ URL ของโลโก้
    logoUrl?: string | null;       // URL จาก Firebase Storage (สำหรับบันทึกใน Firestore)
    logoType?: LogoType;           // ประเภทของโลโก้
    fromCompany: string;
    fromAddress: string;
    toCompany: string;
    toAddress: string;
    docNumber: string;
    date: Date | null;
    project: string;
    items: WorkItem[];
    senderName: string;
    receiverName: string;
}

export interface WarrantyData {
    logo: string | null;           // Base64 string หรือ URL ของโลโก้
    logoUrl?: string | null;       // URL จาก Firebase Storage (สำหรับบันทึกใน Firestore)
    logoType?: LogoType;           // ประเภทของโลโก้
    
    // ข้อมูลบริษัท
    companyName: string;
    companyAddress: string;
    companyPhone: string;          // เบอร์โทรบริษัท
    companyEmail: string;          // อีเมล/เว็บไซต์บริษัท
    
    // ข้อมูลลูกค้า/โครงการ
    projectName: string;           // ชื่อโครงการ
    customerName: string;          // ชื่อลูกค้า
    customerPhone: string;         // เบอร์โทรลูกค้า
    customerAddress: string;       // ที่อยู่ลูกค้า/โครงการ
    
    // ข้อมูลสินค้า/บริการ
    serviceName: string;           // ชื่อบริการ/ประเภทสินค้า
    productDetail: string;         // รายการสินค้า/รายละเอียด
    houseModel: string;            // แบบบ้าน
    batchNo: string;               // หมายเลขการผลิต (Batch No.)
    purchaseDate: Date | null;     // วันที่ส่งมอบ
    
    // การรับประกัน
    warrantyPeriod: string;        // ระยะเวลารับประกัน
    warrantyEndDate: Date | null;  // วันที่สิ้นสุดการรับประกัน
    terms: string;                 // เงื่อนไขการรับประกัน
    
    // ข้อมูลเอกสาร
    warrantyNumber: string;        // เลขที่ใบรับประกัน
    issueDate: Date | null;        // วันที่ออกเอกสาร
    issuedBy: string;              // ผู้ออกเอกสาร
}

// Template สำหรับข้อมูลสินค้า/บริการที่ใช้บ่อย
export interface ServiceTemplate {
    id?: string;
    serviceName: string;           // ชื่อบริการ/ประเภทสินค้า
    productDetail: string;         // รายการสินค้า/รายละเอียด
    houseModel: string;            // แบบบ้าน
    batchNo: string;               // หมายเลขการผลิต (Batch No.)
    warrantyPeriod: string;        // ระยะเวลารับประกัน
    terms: string;                 // เงื่อนไขการรับประกัน
    userId: string;                // ผู้สร้าง template
    createdAt?: Date;
    updatedAt?: Date;
}
