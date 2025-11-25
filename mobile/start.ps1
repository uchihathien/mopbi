# Quick Start Script cho Mobile App

Write-Host "📱 Starting Mobile App..." -ForegroundColor Green

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "✅ Starting Expo..." -ForegroundColor Green
Write-Host "📱 Quét QR code bằng Expo Go app trên điện thoại" -ForegroundColor Cyan
Write-Host "🔧 Hoặc nhấn 'a' để mở Android emulator" -ForegroundColor Cyan
Write-Host ""
npm start
