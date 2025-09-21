export interface WorkItem {
    description: string;
    quantity: number;
    unit: string;
    notes: string;
}

export interface DeliveryNoteData {
    logo: string | null;
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
    logo: string | null;
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
