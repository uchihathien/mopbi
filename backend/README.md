# Backend README

## Cài đặt

1. Install dependencies:
```bash
cd backend
npm install
```

2. Setup database:
- Tạo PostgreSQL database
- Copy `.env.example` thành `.env`
- Cập nhật `DATABASE_URL` và các biến môi trường khác

3. Run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start server:
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/google` - Google OAuth

### Products
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `GET /api/products/categories/all` - Danh mục

### Cart
- `GET /api/cart` - Giỏ hàng
- `POST /api/cart` - Thêm vào giỏ
- `PUT /api/cart/:itemId` - Cập nhật số lượng
- `DELETE /api/cart/:itemId` - Xóa khỏi giỏ

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Lịch sử đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PUT /api/orders/:id/cancel` - Hủy đơn

### Payment
- `POST /api/payment/sepay/create` - Tạo thanh toán Sepay
- `POST /api/payment/sepay/webhook` - Webhook Sepay
- `GET /api/payment/sepay/status/:orderId` - Kiểm tra trạng thái

### Chat
- `POST /api/chat/message` - Gửi tin nhắn AI
- `GET /api/chat/history` - Lịch sử chat
- `DELETE /api/chat/history` - Xóa lịch sử
