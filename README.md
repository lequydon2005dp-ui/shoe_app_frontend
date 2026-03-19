# 👟 Shoe Store Mobile App

Ứng dụng thương mại điện tử mua sắm giày trên nền tảng di động (Android), tích hợp Trợ lý ảo AI và bản đồ thông minh.

## ✨ Tính năng nổi bật
* **Trợ lý ảo AI:** Tích hợp Google Gemini API giúp tư vấn sản phẩm, size giày và giải đáp thắc mắc của khách hàng theo thời gian thực.
* **Bản đồ thông minh:** Sử dụng Google Maps API tự động xác định vị trí và điền địa chỉ giao hàng.
* **Trải nghiệm mượt mà:** Giao diện tối ưu, xử lý giỏ hàng, đặt hàng và quản lý tài khoản người dùng với hiệu năng cao.

## 🛠 Công nghệ sử dụng
* **Framework:** React Native (Expo)
* **Ngôn ngữ:** JavaScript
* **Thư viện chính:** React Navigation (chuyển trang), Axios (gọi API).
* **Dịch vụ tích hợp:** Google Gemini API, Google Maps API.

## 🚀 Hướng dẫn cài đặt

**1. Yêu cầu hệ thống**
* Node.js (phiên bản 18.x trở lên)
* Ứng dụng Expo Go trên điện thoại Android hoặc Android Studio Emulator.

**2. Cài đặt và khởi chạy**
Clone dự án về máy:
\`\`\`bash
git clone https://github.com/ten-cua-ban/ten-repo-frontend.git
cd ten-repo-frontend
\`\`\`

Cài đặt các thư viện:
* Mở thư mục bằng Terminal và gõ
\`\`\`
npm install
\`\`\`

Cấu hình môi trường (Tạo file `.env` ở thư mục gốc):
\`\`\`env
EXPO_PUBLIC_API_URL=http://dia-chi-ip-backend-cua-ban:8000/api

EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key_here
\`\`\`

Cấu hình lại địa chỉ mạng hiện tại của máy bạn và tìm bằng cung cụ Search thay thế địa chỉ ip cũ.

Khởi chạy ứng dụng (Xóa cache để nhận `.env` mới):

\`\`\`
npx expo start -c
\`\`\`

Quét mã QR bằng ứng dụng Expo Go trên điện thoại Android để trải nghiệm.
