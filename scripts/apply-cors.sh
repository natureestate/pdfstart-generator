#!/bin/bash

# สคริปต์สำหรับ apply CORS configuration ให้กับ Firebase Storage
# ต้องมี Google Cloud SDK (gcloud + gsutil) ติดตั้งอยู่

set -e

# สี
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="ecertonline-29a67"
BUCKET_NAME="${PROJECT_ID}.firebasestorage.app"
CORS_FILE="cors.json"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Firebase Storage CORS Configuration${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# ตรวจสอบว่ามี gsutil หรือไม่
if ! command -v gsutil &> /dev/null; then
    echo -e "${RED}❌ Error: gsutil not found${NC}"
    echo -e "${YELLOW}📦 Please install Google Cloud SDK:${NC}"
    echo -e "${YELLOW}   https://cloud.google.com/sdk/docs/install${NC}"
    echo ""
    echo -e "${YELLOW}   For macOS:${NC}"
    echo -e "${YELLOW}   brew install --cask google-cloud-sdk${NC}"
    exit 1
fi

# ตรวจสอบว่ามี cors.json หรือไม่
if [ ! -f "$CORS_FILE" ]; then
    echo -e "${RED}❌ Error: $CORS_FILE not found${NC}"
    echo -e "${YELLOW}Please create $CORS_FILE file first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ gsutil found${NC}"
echo -e "${GREEN}✅ cors.json found${NC}"
echo ""

# แสดงเนื้อหา cors.json
echo -e "${BLUE}📄 CORS Configuration:${NC}"
cat "$CORS_FILE"
echo ""

# ตรวจสอบว่า login แล้วหรือยัง
echo -e "${BLUE}🔐 Checking authentication...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated. Running 'gcloud auth login'...${NC}"
    gcloud auth login
fi

ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
echo -e "${GREEN}✅ Authenticated as: ${ACTIVE_ACCOUNT}${NC}"
echo ""

# Set project
echo -e "${BLUE}🔧 Setting project: ${PROJECT_ID}${NC}"
gcloud config set project "$PROJECT_ID"
echo ""

# Apply CORS configuration
echo -e "${BLUE}🚀 Applying CORS configuration to bucket: ${BUCKET_NAME}${NC}"
echo -e "${YELLOW}   This may take a few moments...${NC}"
echo ""

if gsutil cors set "$CORS_FILE" "gs://${BUCKET_NAME}"; then
    echo ""
    echo -e "${GREEN}✅ CORS configuration applied successfully!${NC}"
    echo ""
    
    # แสดง CORS configuration ที่ apply แล้ว
    echo -e "${BLUE}📋 Current CORS configuration:${NC}"
    gsutil cors get "gs://${BUCKET_NAME}"
    echo ""
    
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}🎉 Success!${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo -e "${YELLOW}   1. Wait 1-2 minutes for changes to propagate${NC}"
    echo -e "${YELLOW}   2. Refresh your web app (Ctrl+Shift+R)${NC}"
    echo -e "${YELLOW}   3. Upload a new logo${NC}"
    echo -e "${YELLOW}   4. Check if the logo displays correctly${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}=====================================${NC}"
    echo -e "${RED}❌ Failed to apply CORS configuration${NC}"
    echo -e "${RED}=====================================${NC}"
    echo ""
    echo -e "${YELLOW}Possible reasons:${NC}"
    echo -e "${YELLOW}   1. Account doesn't have Storage Admin permission${NC}"
    echo -e "${YELLOW}   2. Bucket name is incorrect${NC}"
    echo -e "${YELLOW}   3. Project ID is incorrect${NC}"
    echo ""
    echo -e "${YELLOW}📚 Manual setup guide:${NC}"
    echo -e "${YELLOW}   See FIREBASE_STORAGE_CORS_FIX.md for detailed instructions${NC}"
    echo ""
    exit 1
fi

