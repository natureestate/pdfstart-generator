
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { font } from '../constants/IBMPlexSansThaiBase64';
import { convertStorageUrlToBase64, needsBase64Conversion } from './logoStorage';

/**
 * แปลงรูปภาพจาก URL เป็น Base64 เพื่อแก้ปัญหา CORS ใน html2canvas
 * สำหรับ Firebase Storage URL จะใช้ Firebase SDK แทน fetch เพื่อหลีกเลี่ยง CORS
 * @param url - URL ของรูปภาพ
 * @returns Base64 string หรือ null หากเกิดข้อผิดพลาด
 */
const convertImageToBase64 = async (url: string): Promise<string | null> => {
    try {
        // ตรวจสอบว่าเป็น Base64 อยู่แล้วหรือไม่
        if (url.startsWith('data:')) {
            console.log('Image is already Base64, skipping conversion');
            return url;
        }

        // ✅ สำหรับ Firebase Storage URL ใช้ Firebase SDK เพื่อหลีกเลี่ยงปัญหา CORS
        if (needsBase64Conversion(url)) {
            console.log('Converting Firebase Storage URL via SDK (no CORS issue)');
            const base64 = await convertStorageUrlToBase64(url);
            if (base64) {
                console.log('Successfully converted via Firebase SDK');
                return base64;
            }
            // ถ้า Firebase SDK ล้มเหลว ลอง fallback เป็น fetch
            console.warn('Firebase SDK conversion failed, trying fetch fallback...');
        }

        // สำหรับ URL อื่นๆ หรือ fallback ให้ใช้ fetch แบบเดิม
        console.log('Converting URL to Base64 via fetch:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                console.log('Successfully converted image to Base64 via fetch');
                resolve(reader.result as string);
            };
            reader.onerror = () => {
                console.error('FileReader error during Base64 conversion');
                resolve(null);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting image to base64:', error);
        return null;
    }
};

/**
 * รอให้รูปภาพโหลดเสร็จ
 * @param img - HTML Image Element
 */
const waitForImageLoad = (img: HTMLImageElement): Promise<void> => {
    return new Promise((resolve) => {
        // ถ้ารูปโหลดเสร็จแล้ว resolve ทันที
        if (img.complete && img.naturalHeight !== 0) {
            resolve();
            return;
        }
        
        // รอให้รูปโหลดเสร็จ
        img.onload = () => resolve();
        img.onerror = () => {
            console.warn('Image failed to load, but continuing...');
            resolve(); // resolve แม้ error เพื่อไม่ให้ค้าง
        };
        
        // Timeout 5 วินาที เผื่อรูปโหลดช้า
        setTimeout(() => resolve(), 5000);
    });
};

/**
 * แปลง <img> (รวมถึง SVG) เป็น PNG Data URL โดยวาดลง canvas ก่อน
 * เหมาะสำหรับกรณี html2canvas เรนเดอร์ SVG ไม่ขึ้น
 */
const rasterizeImageElementToPng = async (img: HTMLImageElement): Promise<string> => {
    await waitForImageLoad(img);

    // ใช้ขนาดจริงของรูปเพื่อคมชัดสุด
    const width = img.naturalWidth || img.width || 256;
    const height = img.naturalHeight || img.height || 256;

    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    const ctx = canvas.getContext('2d');
    if (!ctx) return img.src;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // วาดรูปลงบน canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // คืนค่าเป็น PNG Data URL (ปลอดภัยสำหรับ html2canvas)
    return canvas.toDataURL('image/png');
};

/**
 * แปลงโลโก้ใน element เป็น Base64 ก่อนสร้าง PDF
 * @param element - HTML element ที่จะสร้าง PDF
 */
const preprocessImagesForPdf = async (element: HTMLElement): Promise<() => void> => {
    const images = element.querySelectorAll('img');
    const originalSources: { img: HTMLImageElement; originalSrc: string; originalCrossOrigin: string | null }[] = [];

    console.log(`Found ${images.length} images to process for PDF generation`);

    // แปลงรูปภาพทั้งหมดเป็น Base64
    for (const img of Array.from(images)) {
        const originalSrc = img.src;
        const originalCrossOrigin = img.getAttribute('crossorigin');
        originalSources.push({ img, originalSrc, originalCrossOrigin });

        console.log(`Processing image: ${originalSrc}`);
        
        // ตั้งค่า crossorigin สำหรับรูปจาก external URL
        if (!originalSrc.startsWith('data:') && !originalSrc.startsWith('/')) {
            img.setAttribute('crossorigin', 'anonymous');
            console.log('Set crossorigin="anonymous" for external image');
        }
        
        // ถ้าเป็น Base64 อยู่แล้ว ไม่ต้องแปลง แต่ต้องรอให้โหลด
        if (originalSrc.startsWith('data:')) {
            console.log('Image is already Base64, waiting for load...');
            await waitForImageLoad(img);
            
            // ถ้าเป็น SVG ยังต้องแปลงเป็น PNG
            if (originalSrc.startsWith('data:image/svg+xml')) {
                try {
                    console.log('Rasterizing Base64 SVG to PNG...');
                    const pngDataUrl = await rasterizeImageElementToPng(img);
                    img.src = pngDataUrl;
                    await waitForImageLoad(img);
                    console.log('SVG rasterized to PNG successfully');
                } catch (e) {
                    console.warn('Rasterize SVG failed:', e);
                }
            }
            continue;
        }
        
        // แปลงรูปภาพเป็น Base64
        const base64 = await convertImageToBase64(originalSrc);
        if (base64) {
            // ล็อกขนาดภาพไว้ก่อนเปลี่ยน src
            const currentWidth = img.clientWidth || img.naturalWidth;
            const currentHeight = img.clientHeight || img.naturalHeight;
            
            if (currentWidth && !img.style.width) {
                img.style.width = `${currentWidth}px`;
            }
            if (currentHeight && !img.style.height) {
                img.style.height = `${currentHeight}px`;
            }

            img.src = base64;
            await waitForImageLoad(img);

            // ถ้าเป็น SVG ให้แปลงเป็น PNG
            if (base64.startsWith('data:image/svg+xml')) {
                try {
                    console.log('Rasterizing SVG to PNG...');
                    const pngDataUrl = await rasterizeImageElementToPng(img);
                    img.src = pngDataUrl;
                    await waitForImageLoad(img);
                    console.log('SVG rasterized to PNG successfully');
                } catch (e) {
                    console.warn('Rasterize SVG failed, using original Base64:', e);
                }
            }

            console.log('Image successfully converted and loaded');
        } else {
            console.warn(`Failed to convert image: ${originalSrc}`);
        }
    }

    // รอเพิ่มอีก 500ms เพื่อให้ DOM และรูปภาพพร้อมสมบูรณ์
    console.log('Waiting for DOM to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('All images processed and loaded');

    // คืนค่าฟังก์ชันสำหรับ restore รูปภาพกลับเป็นสถานะเดิม
    return () => {
        console.log('Restoring original image sources');
        originalSources.forEach(({ img, originalSrc, originalCrossOrigin }) => {
            img.src = originalSrc;
            if (originalCrossOrigin) {
                img.setAttribute('crossorigin', originalCrossOrigin);
            } else {
                img.removeAttribute('crossorigin');
            }
            img.style.width = '';
            img.style.height = '';
        });
    };
};

export const generatePdf = async (element: HTMLElement, filename: string): Promise<void> => {
    try {
        console.log('Starting PDF generation process...');
        
        // Hide scrollbars during capture for a cleaner image
        const originalOverflow = element.style.overflow;
        element.style.overflow = 'visible';

        // แปลงรูปภาพเป็น Base64 ก่อนสร้าง canvas
        console.log('Preprocessing images for PDF...');
        const restoreImages = await preprocessImagesForPdf(element);

        console.log('Creating canvas with html2canvas...');
        const canvas = await html2canvas(element, {
            scale: 2, // Keep scale for high resolution on screens
            useCORS: true,
            allowTaint: true, // อนุญาตให้ใช้รูปภาพที่อาจมี taint
            logging: true, // เปิด logging เพื่อ debug
            imageTimeout: 15000, // เพิ่ม timeout สำหรับโหลดรูป
            backgroundColor: '#ffffff', // กำหนดสีพื้นหลัง
        });

        // Restore รูปภาพและ overflow กลับเป็นเดิม
        restoreImages();
        element.style.overflow = originalOverflow;

        console.log(`Canvas created successfully: ${canvas.width}x${canvas.height}`);

        // Use JPEG format with high quality (0.95) for significant file size reduction
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        console.log('Creating PDF document...');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // Add font to jsPDF
        pdf.addFileToVFS('IBMPlexSansThai-Regular.ttf', font);
        pdf.addFont('IBMPlexSansThai-Regular.ttf', 'IBMPlexSansThai', 'normal');
        pdf.setFont('IBMPlexSansThai');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        // ✅ ใช้ความกว้างเต็ม A4 แต่รักษา ratio ของ canvas
        let imgWidth = pdfWidth;
        let imgHeight = imgWidth / ratio;
        
        // ถ้าสูงเกิน A4 ให้ scale ลงโดยรักษา ratio
        if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
            imgWidth = imgHeight * ratio;
        }
        
        // Center ในกรณีที่ width ไม่เต็ม
        const x = (pdfWidth - imgWidth) / 2;
        const y = 0; // เริ่มจากบนสุด
        
        console.log(`Adding image to PDF: ${imgWidth}x${imgHeight} at (${x}, ${y})`);
        
        // Specify 'JPEG' as the format
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
        
        console.log(`Saving PDF as: ${filename}`);
        pdf.save(filename);
        
        console.log('PDF generation completed successfully!');
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่อีกครั้ง');
    }
};

/**
 * ฟังก์ชันสำหรับทดสอบการแปลงรูปภาพเป็น Base64
 * @param imageUrl - URL ของรูปภาพที่ต้องการทดสอบ
 * @returns Promise<boolean> - true หากแปลงสำเร็จ
 */
export const testImageConversion = async (imageUrl: string): Promise<boolean> => {
    try {
        const result = await convertImageToBase64(imageUrl);
        return result !== null;
    } catch (error) {
        console.error('Test image conversion failed:', error);
        return false;
    }
};
