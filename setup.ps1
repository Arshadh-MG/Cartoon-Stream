# CARTOON STREAMING PLATFORM - WINDOWS SETUP SCRIPT

Write-Host "╔════════════════════════════════════════════════════════════════╗"
Write-Host "║    🎬 CARTOON STREAMING PLATFORM - SETUP WIZARD            ║"
Write-Host "╚════════════════════════════════════════════════════════════════╝"
Write-Host ""

function Write-Colored([string]$Text, [ConsoleColor]$Color) {
    $previous = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Text
    $Host.UI.RawUI.ForegroundColor = $previous
}

Write-Colored "[1/4] Checking Python installation..." Green
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Colored "❌ Python is not installed. Please install Python 3.8+ first." Red
    exit 1
}

Write-Colored "✅ Python found: $(python --version 2>&1)" Cyan
Write-Host ""

Write-Colored "[2/4] Creating virtual environment..." Green
if (-Not (Test-Path .\venv)) {
    python -m venv venv
    Write-Colored "✅ Virtual environment created" Green
} else {
    Write-Colored "✅ Virtual environment already exists" Green
}
Write-Host ""

Write-Colored "[3/4] Activating virtual environment and installing dependencies..." Green
. .\venv\Scripts\Activate.ps1
python -m pip install -q -r requirements.txt
Write-Colored "✅ Dependencies installed" Green
Write-Host ""

Write-Colored "[4/4] Creating upload directories..." Green
New-Item -ItemType Directory -Force -Path .\uploads\videos | Out-Null
New-Item -ItemType Directory -Force -Path .\uploads\thumbnails | Out-Null
Write-Colored "✅ Upload directories created" Green
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════════╗"
Write-Host "║            ✅ SETUP COMPLETE - READY TO LAUNCH!              ║"
Write-Host "╚════════════════════════════════════════════════════════════════╝"
Write-Host ""
Write-Host "1️⃣  Start the backend server:"
Write-Host "   python backend_main.py"
Write-Host ""
Write-Host "2️⃣  In a new terminal, set up your React app:"
Write-Host "   npx create-react-app cartoon-streaming"
Write-Host "   cd cartoon-streaming"
Write-Host "   npm install lucide-react"
Write-Host ""
Write-Host "3️⃣  Copy the React component (cartoon-streaming-frontend.jsx) into your src/App.js"
Write-Host ""
Write-Host "4️⃣  Start the React development server:"
Write-Host "   npm start"
Write-Host ""
Write-Host "📚 API Documentation: http://localhost:8000/docs"
Write-Host "💾 Database: cartoons.db"
Write-Host ""
Write-Colored "Happy streaming! 🎬✨" Yellow
