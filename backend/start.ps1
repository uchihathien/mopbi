# Quick Start Script cho Backend

Write-Host "🚀 Starting Backend Setup..." -ForegroundColor Green

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  QUAN TRỌNG: Hãy mở file .env và cập nhật DATABASE_URL!" -ForegroundColor Red
    Write-Host "   Ví dụ: postgresql://postgres:YOUR_PASSWORD@localhost:5432/mechanical_shop" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Nhấn Enter sau khi đã cập nhật .env"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
Write-Host "   (Nếu được hỏi tên migration, gõ: init)" -ForegroundColor Cyan
npm run prisma:migrate

# Start server
Write-Host ""
Write-Host "✅ Setup hoàn tất! Starting server..." -ForegroundColor Green
Write-Host "🌐 Backend sẽ chạy tại: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
npm run dev
