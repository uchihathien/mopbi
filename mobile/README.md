# Mobile App README

## Cài đặt

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Cấu hình API:
- Mở `services/api.ts`
- Cập nhật `API_URL` với địa chỉ backend của bạn

3. Start app:
```bash
npm start
```

4. Chạy trên thiết bị:
```bash
# Android
npm run android

# iOS
npm run ios
```

## Cấu trúc Project

```
mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab screens
│   └── _layout.tsx        # Root layout
├── services/              # API services
├── stores/                # Zustand state management
├── types/                 # TypeScript types
└── app.json              # Expo configuration
```

## Tính năng

- ✅ Đăng nhập/Đăng ký với JWT
- ✅ Google OAuth (cần cấu hình)
- ✅ Danh sách sản phẩm với search
- ✅ Giỏ hàng
- ✅ Đặt hàng
- ✅ Thanh toán Sepay
- ✅ AI Chatbox
- ✅ Quản lý tài khoản

## Lưu ý

- Cần cấu hình Google OAuth credentials trong `app.json`
- Cần backend đang chạy để app hoạt động
- Test trên thiết bị thật để sử dụng camera và các tính năng native
