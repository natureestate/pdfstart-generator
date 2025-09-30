#!/bin/bash

# สคริปต์สำหรับรัน development server
# ใช้ได้กับ macOS และ Linux

echo "🚀 กำลังเริ่มต้น development server..."

# ตรวจสอบว่า port 3000 ถูกใช้งานหรือไม่
PORT=3000
PORT_IN_USE=$(lsof -ti:$PORT)

if [ ! -z "$PORT_IN_USE" ]; then
    echo "⚠️  Port $PORT กำลังถูกใช้งานโดย process: $PORT_IN_USE"
    echo "🔄 กำลังหยุด process ที่ใช้ port $PORT..."
    kill -9 $PORT_IN_USE 2>/dev/null || true
    sleep 2
fi

echo "✅ Port $PORT ว่างแล้ว"
echo "🎯 กำลังรัน npm run dev..."

npm run dev
