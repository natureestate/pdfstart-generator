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
    companyName: string;
    companyAddress: string;
    customerName: string;
    customerContact: string;
    productName: string;
    serialNumber: string;
    purchaseDate: Date | null;
    warrantyPeriod: string;
    terms: string;
}
