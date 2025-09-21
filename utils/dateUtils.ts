// A simple utility to format a Date object or null into a YYYY-MM-DD string
// suitable for the value property of an <input type="date"> element.

export const formatDateForInput = (date: Date | null): string => {
    if (!date) {
        return '';
    }
    // Adjust for timezone offset before converting to ISO string
    const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 10);
    return localISOTime;
};
