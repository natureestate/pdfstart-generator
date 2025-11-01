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

// บทบาทระดับระบบ (System-wide roles)
export type SystemRole = 'superadmin' | 'user';

// แผนการใช้งาน (Subscription Plan)
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

// สถานะของแผนการใช้งาน
export type SubscriptionStatus = 'active' | 'expired' | 'suspended' | 'trial';

// โควตาการใช้งานของบริษัท
export interface CompanyQuota {
    // แผนการใช้งาน
    plan: SubscriptionPlan;                  // แผนที่ใช้งานอยู่
    status: SubscriptionStatus;              // สถานะแผน
    
    // โควตาผู้ใช้งาน
    maxUsers: number;                        // จำนวนผู้ใช้งานสูงสุด (-1 = ไม่จำกัด)
    currentUsers: number;                    // จำนวนผู้ใช้งานปัจจุบัน
    
    // โควตาเอกสาร
    maxDocuments: number;                    // จำนวนเอกสารสูงสุดต่อเดือน (-1 = ไม่จำกัด)
    currentDocuments: number;                // จำนวนเอกสารที่สร้างในเดือนนี้
    documentResetDate?: Date;                // วันที่รีเซ็ตจำนวนเอกสาร (วันแรกของเดือนถัดไป)
    
    // โควตาโลโก้
    maxLogos: number;                        // จำนวนโลโก้สูงสุด (-1 = ไม่จำกัด)
    currentLogos: number;                    // จำนวนโลโก้ปัจจุบัน
    allowCustomLogo: boolean;                // อนุญาตให้ใช้โลโก้กำหนดเองหรือไม่
    
    // โควตา Storage
    maxStorageMB: number;                    // พื้นที่เก็บข้อมูลสูงสุด (MB) (-1 = ไม่จำกัด)
    currentStorageMB: number;                // พื้นที่ที่ใช้ไปแล้ว (MB)
    
    // Features พิเศษ
    features: {
        multipleProfiles: boolean;           // ใช้ Profile หลายอันได้หรือไม่
        apiAccess: boolean;                  // เข้าถึง API ได้หรือไม่
        customDomain: boolean;               // ใช้ Custom Domain ได้หรือไม่
        prioritySupport: boolean;            // Support แบบพิเศษ
        exportPDF: boolean;                  // Export PDF ได้หรือไม่
        exportExcel: boolean;                // Export Excel ได้หรือไม่
        advancedReports: boolean;            // รายงานขั้นสูง
        customTemplates: boolean;            // Template กำหนดเอง
    };
    
    // ข้อมูลการสมัคร
    startDate: Date;                         // วันที่เริ่มใช้งานแผนปัจจุบัน
    endDate?: Date;                          // วันหมดอายุ (ถ้าเป็น subscription แบบจ่ายเงิน)
    trialEndDate?: Date;                     // วันหมดอายุทดลองใช้
    
    // Payment
    lastPaymentDate?: Date;                  // วันที่จ่ายเงินล่าสุด
    nextPaymentDate?: Date;                  // วันที่จ่ายเงินครั้งถัดไป
    paymentAmount?: number;                  // จำนวนเงินที่ต้องจ่าย
    currency?: string;                       // สกุลเงิน (THB, USD)
    
    // Metadata
    createdAt?: Date;
    updatedAt?: Date;
    updatedBy?: string;                      // User ID ของผู้อัปเดต
    notes?: string;                          // หมายเหตุ
}

// ข้อมูล Super Admin
export interface SuperAdmin {
    id?: string;                    // Document ID
    userId: string;                 // Firebase Auth UID
    email: string;                  // อีเมล
    displayName?: string;           // ชื่อแสดง
    role: SystemRole;               // บทบาทระดับระบบ
    permissions: string[];          // สิทธิ์พิเศษ (เช่น 'view_all', 'manage_users', 'manage_companies')
    createdBy?: string;             // User ID ของผู้สร้าง
    createdAt?: Date;
    updatedAt?: Date;
    lastLoginAt?: Date;             // Login ล่าสุด
}

// สถิติภาพรวมระบบ
export interface SystemStats {
    totalCompanies: number;         // จำนวนบริษัททั้งหมด
    totalUsers: number;             // จำนวน users ทั้งหมด
    totalMembers: number;           // จำนวนสมาชิกทั้งหมด
    totalInvitations: number;       // จำนวนคำเชิญทั้งหมด
    totalDocuments: number;         // จำนวนเอกสารทั้งหมด
    activeUsers: number;            // จำนวน active users
    pendingInvitations: number;     // จำนวนคำเชิญที่รอ
}

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
    
    // Quota และ Subscription
    quotaId?: string;          // ID ของ quota document (reference to companyQuotas collection)
    quota?: CompanyQuota;      // ข้อมูล quota (ถ้าโหลดมาด้วย)
    
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

// สถานะของคำเชิญ
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

// ข้อมูลคำเชิญเข้าองค์กร
export interface Invitation {
    id?: string;                   // Document ID
    companyId: string;             // ID ขององค์กรที่เชิญ
    companyName: string;           // ชื่อองค์กร (สำหรับแสดงในอีเมล)
    email: string;                 // อีเมลของผู้ถูกเชิญ
    role: UserRole;                // บทบาทที่จะได้รับ: admin หรือ member
    status: InvitationStatus;      // สถานะคำเชิญ
    invitedBy: string;             // User ID ของผู้เชิญ
    invitedByName?: string;        // ชื่อของผู้เชิญ (สำหรับแสดงในอีเมล)
    invitedByEmail?: string;       // อีเมลของผู้เชิญ
    token: string;                 // Token สำหรับยืนยันคำเชิญ (unique)
    expiresAt: Date;               // วันหมดอายุของคำเชิญ (เช่น 7 วัน)
    acceptedAt?: Date;             // วันที่ยอมรับคำเชิญ
    acceptedBy?: string;           // User ID ของผู้ยอมรับ (ถ้ามี)
    message?: string;              // ข้อความจากผู้เชิญ (optional)
    createdAt?: Date;
    updatedAt?: Date;
}
