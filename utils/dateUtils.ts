// A simple utility to format a Date object or null into a YYYY-MM-DD string
// suitable for the value property of an <input type="date"> element.

export const formatDateForInput = (date: Date | null | undefined | string): string => {
    if (!date) {
        return '';
    }
    
    // แปลงเป็น Date object ถ้ายังไม่ใช่
    let dateObj: Date;
    if (date instanceof Date) {
        dateObj = date;
    } else if (typeof date === 'string') {
        dateObj = new Date(date);
    } else {
        return '';
    }
    
    // ตรวจสอบว่าเป็น valid date หรือไม่
    if (isNaN(dateObj.getTime())) {
        return '';
    }
    
    // Adjust for timezone offset before converting to ISO string
    const tzoffset = dateObj.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(dateObj.getTime() - tzoffset)).toISOString().slice(0, 10);
    return localISOTime;
};
