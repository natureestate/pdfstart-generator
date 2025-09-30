# สคริปต์สำหรับจัดการ Development Server

โฟลเดอร์นี้มีสคริปต์สำหรับจัดการ development server และ port ที่สะดวกมากขึ้น

## สคริปต์ที่มีให้ใช้งาน

### `dev.sh` - รัน Development Server
- **ฟังก์ชัน**: รัน development server บน port 3000
- **ความสามารถพิเศษ**:
  - ตรวจสอบและหยุด process ที่ใช้ port 3000 โดยอัตโนมัติ
  - รอจนกว่า port จะว่างก่อนรัน server ใหม่
- **การใช้งาน**: `./scripts/dev.sh`

### `restart.sh` - รีสตาร์ท Development Server
- **ฟังก์ชัน**: หยุดและรัน development server ใหม่
- **ความสามารถพิเศษ**:
  - หยุด process ที่ใช้ port 3000 อย่างปลอดภัย
  - รอจนกว่า process จะหยุดทำงานก่อนรัน server ใหม่
- **การใช้งาน**: `./scripts/restart.sh`

## ข้อกำหนดการใช้งาน

สคริปต์เหล่านี้ทำงานได้ดีกับ:
- **macOS** (ทดสอบแล้ว)
- **Linux** (ควรทำงานได้)
- **Windows** (อาจต้องปรับแต่งเล็กน้อยสำหรับ PowerShell หรือ Git Bash)

## การแก้ไขปัญหา

### ถ้าสคริปต์ไม่สามารถ execute ได้
```bash
chmod +x scripts/dev.sh
chmod +x scripts/restart.sh
```

### ถ้าพบปัญหา permission denied
```bash
# ตรวจสอบ permission
ls -la scripts/

# ถ้าจำเป็น ให้เปลี่ยน permission
chmod 755 scripts/dev.sh
chmod 755 scripts/restart.sh
```

## การปรับแต่ง

คุณสามารถปรับแต่งสคริปต์ได้โดย:
1. แก้ไขตัวแปร `PORT` ในสคริปต์ถ้าต้องการใช้ port อื่น
2. เพิ่ม flags เพิ่มเติมให้กับ `npm run dev` ถ้าต้องการ
3. เพิ่มการจัดการ error เพิ่มเติมตามต้องการ
