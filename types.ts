export interface WorkItem {
    description: string;
    quantity: number;
    unit: string;
    notes: string;
}

// ประเภทของโลโก้
export type LogoType = 'default' | 'custom' | 'uploaded';

// บทบาทของผู้ใช้ในองค์กร
export type UserRole = 'admin' | 'member';

// สถานะของสมาชิกในองค์กร
export type MemberStatus = 'active' | 'pending' | 'inactive';

// ข้อมูลสมาชิกในองค์กร
export interface CompanyMember {
    id?: string;                // Document ID
    companyId: string;          // ID ขององค์กร
    userId: string;             // User ID จาก Firebase Auth
    email: string;              // อีเมลของ User
    phoneNumber?: string;       // เบอร์โทรศัพท์
    displayName?: string;       // ชื่อแสดง
    role: UserRole;             // บทบาท: admin หรือ member
    status: MemberStatus;       // สถานะ: active, pending, inactive
    joinedAt?: Date;            // วันที่เข้าร่วม
    invitedBy?: string;         // User ID ของคนที่เชิญ
    createdAt?: Date;
    updatedAt?: Date;
}

// ข้อมูลบริษัท
export interface Company {
    id?: string;
    name: string;              // ชื่อบริษัท
    address?: string;          // ที่อยู่บริษัท (optional)
    userId: string;            // Admin คนแรก (คนที่สร้างบริษัท)
    logoUrl?: string | null;   // โลโก้บริษัทปัจจุบัน (URL จาก Storage)
    logoType?: LogoType;       // ประเภทโลโก้
    defaultLogoUrl?: string | null;  // โลโก้ default ของแต่ละองค์กร (URL จาก Storage)
    memberCount?: number;      // จำนวนสมาชิกในองค์กร
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
    showBatchNo?: boolean;         // แสดง Batch No. ในเอกสารหรือไม่
    purchaseDate: Date | null;     // วันที่ส่งมอบ
    
    // การรับประกัน
    warrantyPeriod: string;        // ระยะเวลารับประกัน
    warrantyEndDate: Date | null;  // วันที่สิ้นสุดการรับประกัน
    terms: string;                 // เงื่อนไขการรับประกัน
    
    // การรับประกันแบบงานรับสร้างบ้าน (Multiple warranty types)
    useMultipleWarrantyTypes?: boolean;  // ใช้การรับประกันหลายประเภทหรือไม่
    warrantyGeneral?: boolean;     // รับประกันทั่วไป (1 ปี)
    warrantyRoof?: boolean;        // รับประกันงานหลังคา (3 ปี)
    warrantyStructure?: boolean;   // รับประกันงานโครงสร้าง (15 ปี)
    
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

// Customer - ข้อมูลลูกค้าแบบครบวงจร (ลดการกรอกข้อมูลซ้ำ)
export interface Customer {
    id?: string;
    companyId: string;             // ID ของบริษัทที่สร้างลูกค้านี้
    userId: string;                // User ที่สร้างลูกค้านี้
    
    // ข้อมูลลูกค้าหลัก
    customerName: string;          // ชื่อลูกค้า/บริษัท
    customerType: 'individual' | 'company';  // ประเภท: บุคคล หรือ นิติบุคคล
    
    // ข้อมูลติดต่อ
    phone: string;                 // เบอร์โทรศัพท์หลัก
    alternatePhone?: string;       // เบอร์สำรอง
    email?: string;                // อีเมล
    lineId?: string;               // Line ID
    
    // ที่อยู่
    address: string;               // ที่อยู่หลัก
    district?: string;             // ตำบล/แขวง
    amphoe?: string;               // อำเภอ/เขต
    province?: string;             // จังหวัด
    postalCode?: string;           // รหัสไปรษณีย์
    
    // ข้อมูลโครงการ (สำหรับธุรกิจก่อสร้าง/อสังหา)
    projectName?: string;          // ชื่อโครงการ (ถ้ามี)
    houseNumber?: string;          // บ้านเลขที่/ห้องเลขที่
    
    // Tags และหมายเหตุ
    tags?: string[];               // Tags สำหรับจัดกลุ่ม เช่น ['VIP', 'ลูกค้าประจำ']
    notes?: string;                // หมายเหตุเพิ่มเติม
    
    // Metadata
    lastUsedAt?: Date;             // ใช้ล่าสุดเมื่อไร (สำหรับ sorting)
    usageCount?: number;           // จำนวนครั้งที่ใช้ (สำหรับ suggestion)
    createdAt?: Date;
    updatedAt?: Date;
}
