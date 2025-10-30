#!/bin/bash

# Script ตรวจสอบและย้ายข้อมูล Firestore ด้วย Firebase CLI
# 
# วิธีรัน:
# bash scripts/check-with-cli.sh

echo "🔍 ตรวจสอบข้อมูล Firestore ด้วย Firebase CLI"
echo "=================================================================="

# ตรวจสอบว่ามี Firebase CLI หรือไม่
if ! command -v firebase &> /dev/null; then
    echo "❌ ไม่พบ Firebase CLI"
    echo ""
    echo "📥 ติดตั้ง Firebase CLI:"
    echo "   npm install -g firebase-tools"
    echo ""
    exit 1
fi

# ตรวจสอบว่า Login แล้วหรือยัง
echo ""
echo "🔐 ตรวจสอบสถานะ Login..."
firebase login:list

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  คุณยังไม่ได้ Login Firebase CLI"
    echo ""
    echo "📝 Login ด้วยคำสั่ง:"
    echo "   firebase login"
    echo ""
    exit 1
fi

echo ""
echo "✅ Login แล้ว!"
echo ""

# แสดง Project ปัจจุบัน
echo "📁 Project ปัจจุบัน:"
firebase use

echo ""
echo "=================================================================="
echo "📊 ข้อมูลใน Firestore"
echo "=================================================================="
echo ""

# ใช้ Firebase CLI เพื่อดึงข้อมูล
echo "💡 คำสั่งที่สามารถใช้ได้:"
echo ""
echo "1. ดูข้อมูล Companies:"
echo "   firebase firestore:get companies"
echo ""
echo "2. ดูข้อมูล Delivery Notes:"
echo "   firebase firestore:get deliveryNotes"
echo ""
echo "3. ดูข้อมูล Warranty Cards:"
echo "   firebase firestore:get warrantyCards"
echo ""
echo "4. Export ข้อมูลทั้งหมด:"
echo "   firebase firestore:export gs://ecertonline-29a67.firebasestorage.app/backups"
echo ""

# ถามว่าจะดูข้อมูลอะไร
echo "=================================================================="
read -p "คุณต้องการดูข้อมูล collection ไหน? (companies/deliveryNotes/warrantyCards/all): " collection

case $collection in
    companies)
        echo ""
        echo "📁 Companies:"
        firebase firestore:get companies
        ;;
    deliveryNotes)
        echo ""
        echo "📦 Delivery Notes:"
        firebase firestore:get deliveryNotes --limit 10
        ;;
    warrantyCards)
        echo ""
        echo "🛡️  Warranty Cards:"
        firebase firestore:get warrantyCards --limit 10
        ;;
    all)
        echo ""
        echo "📁 Companies:"
        firebase firestore:get companies
        echo ""
        echo "📦 Delivery Notes (แสดง 5 รายการแรก):"
        firebase firestore:get deliveryNotes --limit 5
        echo ""
        echo "🛡️  Warranty Cards (แสดง 5 รายการแรก):"
        firebase firestore:get warrantyCards --limit 5
        ;;
    *)
        echo "❌ collection ไม่ถูกต้อง"
        exit 1
        ;;
esac

echo ""
echo "✅ เสร็จสิ้น!"

