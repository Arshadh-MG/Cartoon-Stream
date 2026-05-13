#!/bin/bash

# ============================================================================
# CARTOON STREAMING PLATFORM - QUICK START SCRIPT
# ============================================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║    🎬 CARTOON STREAMING PLATFORM - SETUP WIZARD 🎬            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Python is installed
echo -e "${BLUE}[1/4] Checking Python installation...${NC}"
PYTHON_COMMAND=""
if command -v python3 &> /dev/null; then
    PYTHON_COMMAND=python3
elif command -v python &> /dev/null; then
    PYTHON_COMMAND=python
fi

if [ -z "$PYTHON_COMMAND" ]; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.8+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python found: $($PYTHON_COMMAND --version)${NC}"
echo ""

# Create virtual environment
echo -e "${BLUE}[2/4] Creating virtual environment...${NC}"
if [ ! -d "venv" ]; then
    $PYTHON_COMMAND -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Virtual environment already exists${NC}"
fi
echo ""

# Activate virtual environment
echo -e "${BLUE}[3/4] Activating virtual environment and installing dependencies...${NC}"
source venv/bin/activate
$PYTHON_COMMAND -m pip install -q -r requirements.txt 2>/dev/null
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Create necessary directories
echo -e "${BLUE}[4/4] Creating upload directories...${NC}"
mkdir -p uploads/videos
mkdir -p uploads/thumbnails
echo -e "${GREEN}✅ Upload directories created${NC}"
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║            ✅ SETUP COMPLETE - READY TO LAUNCH!              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}📖 NEXT STEPS:${NC}"
echo ""
echo "1️⃣  Start the backend server:"
echo -e "   ${BLUE}python backend_main.py${NC}"
echo ""
echo "2️⃣  In a new terminal, set up your React app:"
echo -e "   ${BLUE}npx create-react-app cartoon-streaming${NC}"
echo -e "   ${BLUE}cd cartoon-streaming${NC}"
echo -e "   ${BLUE}npm install lucide-react${NC}"
echo ""
echo "3️⃣  Copy the React component (cartoon-streaming-frontend.jsx) into your src/App.js"
echo ""
echo "4️⃣  Start the React development server:"
echo -e "   ${BLUE}npm start${NC}"
echo ""
echo "5️⃣  Open your browser and visit: ${BLUE}http://localhost:3000${NC}"
echo ""
echo "📚 API Documentation: ${BLUE}http://localhost:8000/docs${NC}"
echo "💾 Database: ${YELLOW}cartoons.db${NC}"
echo ""
echo -e "${GREEN}Happy streaming! 🎬✨${NC}"
echo ""
