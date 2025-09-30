#!/bin/bash

# สคริปต์สำหรับรีสตาร์ท development server
# ใช้ได้กับ macOS และ Linux

echo "🔄 กำลังรีสตาร์ท development server..."

# หยุด process ที่ใช้ port 3000
PORT=3000
PORT_IN_USE=$(lsof -ti:$PORT)

if [ ! -z "$PORT_IN_USE" ]; then
    echo "🛑 หยุด process ที่ใช้ port $PORT (PID: $PORT_IN_USE)..."
    kill -9 $PORT_IN_USE 2>/dev/null || true
    sleep 2
    echo "✅ หยุด process สำเร็จ"
else
    echo "ℹ️  ไม่มี process ที่ใช้ port $PORT"
fi

echo "🚀 กำลังรัน npm run dev..."
npm run dev
