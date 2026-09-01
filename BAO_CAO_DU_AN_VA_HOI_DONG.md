# BÁO CÁO TỔNG KẾT DỰ ÁN & TÀI LIỆU TRẢ LỜI HỘI ĐỒNG BẢO VỆ
**Dự án:** Hệ thống Thương mại Điện tử Đa nền tảng TechStore (E-Commerce Platform)  
**Tác giả:** HOÀNG KIM QUÝ PHÚ  
**Môi trường triển khai:**
- **Frontend:** Vercel (`https://phu-hkq.vercel.app`)
- **Backend API & WebSocket:** Render (`https://phu-hkq.onrender.com`)
- **Database:** MongoDB Atlas Cloud

---

## MỤC LỤC
1. [Kiến trúc Tổng thể Hệ thống (System Architecture)](#1-kiến-trúc-tổng-thể-hệ-thống)
2. [Các Chức Năng Nổi Bật Đã Xây Dựng & Hoàn Thiện](#2-các-chức-năng-nổi-bật-đã-xây-dựng--hoàn-thiện)
3. [Các Vấn Đề Kỹ Thuật Phức Tạp Đã Giải Quyết (Technical Highlights)](#3-các-vấn-đề-kỹ-thuật-phức-tạp-đã-giải-quyết)
4. [Cơ Sở Dữ Liệu & Thiết Kế Thực Thể (Database Schema)](#4-cơ-sở-dữ-liệu--thiết-kế-thực-thể)
5. [Bộ Câu Hỏi & Câu Trả Lời Bảo Vệ Trước Hội Đồng (Defense Q&A)](#5-bộ-câu-hỏi--câu-trả-lời-bảo-vệ-trước-hội-đồng)

---

## 1. KIẾN TRÚC TỔNG THỂ HỆ THỐNG

Dự án được xây dựng theo mô hình **Phân tán Micro-services / Decoupled Client-Server**:

```
[ Trình duyệt Khách hàng / Admin ]
          │                    │
          ▼ (HTTPS)            ▼ (WSS / WebSocket)
   [ Vercel CDN ]      [ Render Cloud Backend ]
   (React Vite SPA)    (Node.js + Express + Socket.io)
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
[ MongoDB Atlas ]      [ SePay Webhook ]       [ Resend API ] & [ Gemini AI ]
(Cloud NoSQL DB)     (Cổng thanh toán QR)     (Email & Chatbot tự động)
```

- **Frontend (Client-side):**
  - **Framework:** React 18 (Vite Bundler), cấu trúc Component hóa rõ ràng.
  - **Styling & UI:** TailwindCSS, Vanilla CSS, tối ưu UI/UX chuẩn Modern E-Commerce, Responsive 100% trên Mobile/Tablet/Desktop.
  - **State Management:** React Context API (`AuthContext`, `CartContext`, `LanguageContext`).
  - **Đa ngôn ngữ (i18n):** Hệ thống song ngữ Anh - Việt linh hoạt.
  - **Real-time Client:** `socket.io-client` kết nối liên tục với backend.

- **Backend (Server-side):**
  - **Runtime:** Node.js, Express.js RESTful API.
  - **Bảo mật & Phân quyền:** JWT (JSON Web Token), Bcrypt băm mật khẩu, Middleware RBAC (`authenticateToken`, `authorizeAdmin`).
  - **Giao tiếp thời gian thực:** Socket.io Server xử lý hội thoại AI Chatbot tức thì.
  - **Database ODM:** Mongoose kết nối MongoDB Atlas có cấu hình Connection Pooling.

---

## 2. CÁC CHỨC NĂNG NỔI BẬT ĐÃ XÂY DỰNG & HOÀN THIỆN

### A. Phân Hệ Khách Hàng (Customer Experience)
1. **Duyệt & Tìm Kiếm Sản Phẩm Đa Chiều:**
   - Xem danh mục, lọc theo khoảng giá, danh mục, phân trang và sắp xếp.
   - Trang chi tiết sản phẩm hiển thị thông số, tình trạng tồn kho và đánh giá sao.
2. **Hệ Thống Giỏ Hàng & Mã Giảm Giá (Coupon System):**
   - Thêm/sửa/xóa giỏ hàng mượt mà, lưu trữ đồng bộ.
   - Nhập mã giảm giá khuyến mãi (giảm theo % hoặc số tiền cố định, kiểm tra điều kiện đơn hàng tối thiểu và hạn sử dụng).
3. **Thanh Toán Tự Động VietQR qua SePay:**
   - Tạo mã QR chuyển khoản tự động kèm nội dung thanh toán mã hóa đơn.
   - Tự động lắng nghe Webhook ngân hàng và cập nhật đơn hàng sang "Đã thanh toán" chỉ sau 2-3 giây mà không cần nhân viên duyệt tay.
4. **Quản Lý Tài Khoản & Bảo Mật:**
   - Đăng ký, đăng nhập, bảo vệ tuyến đường mua sắm.
   - Chức năng **Quên mật khẩu / Đặt lại mật khẩu** gửi link xác thực bảo mật 1 lần qua email.
5. **Trợ Lý Ảo Thông Minh TechStore AI (Gemini Flash):**
   - Chatbot tích hợp trực tiếp trên website.
   - Hỗ trợ tra cứu sản phẩm, kiểm tra khuyến mãi và kiểm tra tình trạng đơn hàng bằng số điện thoại/email của khách.
6. **Hệ Thống Đánh Giá & Nhận Xét (Reviews):**
   - Đánh giá sao (1 - 5 sao), bình luận thực tế từ người mua.

### B. Phân Hệ Quản Trị (Admin Dashboard)
1. **Báo Cáo Phân Tích Doanh Thu & Đơn Hàng:**
   - Biểu đồ trực quan hóa dữ liệu bán hàng, số lượng khách hàng mới, tỷ lệ đơn thành công.
2. **Quản Lý Sản Phẩm Toàn Diện:**
   - Thêm, sửa, xóa, tìm kiếm và phân trang sản phẩm.
   - Upload hình ảnh trực tiếp từ máy tính (chuyển đổi Base64 tức thì) hoặc dán link URL.
3. **Quản Lý Danh Mục:** Phân cấp sản phẩm theo danh mục công nghệ.
4. **Quản Lý Đơn Hàng:** Theo dõi tiến trình từ Chờ thanh toán ➔ Đang xử lý ➔ Đang giao ➔ Hoàn thành/Đã hủy.
5. **Quản Lý Người Dùng & Khuyến Mãi:** Phân quyền quản trị viên, tạo và kích hoạt mã giảm giá mới.

---

## 3. CÁC VẤN ĐỀ KỸ THUẬT PHỨC TẠP ĐÃ GIẢI QUYẾT

| STT | Vấn đề Kỹ thuật gặp phải | Nguyên nhân sâu xa | Giải pháp triển khai tối ưu |
|---|---|---|---|
| **1** | **Treo gửi Email trên Production (Render)** | Cloud host (Render/AWS/GCP) chặn tất cả các cổng SMTP truyền thống (25, 465, 587) vì lý do chống Spam, khiến Nodemailer bị Timeout. | Tích hợp **Resend HTTP REST API** qua cổng HTTPS 443. Bypass 100% việc chặn cổng, tốc độ gửi email dưới 1 giây. |
| **2** | **Lỗi 404 khi truy cập link sâu trên Vercel** | Ứng dụng React là Single Page Application (SPA). Khi bấm link reset password từ email, máy chủ Vercel tìm file vật lý không thấy nên báo 404. | Thêm tệp cấu hình **`vercel.json`** với Rewrite Rules điều hướng tất cả URL sâu về `index.html` để React Router tiếp nhận. |
| **3** | **Lỗi Kết nối Chatbot Socket.io** | Backend Socket.io viết cứng danh sách origin localhost, từ chối WebSocket Handshake từ domain Vercel do vi phạm CORS. | Cập nhật cấu hình Socket.io Server nhận diện động biến `process.env.FRONTEND_URL`, cấp quyền CORS an toàn cho Vercel. |
| **4** | **Lỗi Vỡ/Mất ảnh khi Upload Sản Phẩm/Danh Mục** | File lưu vào ổ cứng cục bộ của Render sẽ mất khi server restart; đồng thời Vercel không đọc được file trên Render qua đường dẫn tĩnh. | Chuyển Multer sang **MemoryStorage** kết hợp mã hóa **Base64 Data URI** lưu trực tiếp vào MongoDB Atlas và dùng **FileReader API** hiển thị tức thì 0ms. |
| **5** | **Tự động hóa Thanh toán Ngân hàng (VietQR)** | Cần kiểm tra thanh toán tự động mà không phụ thuộc vào cổng quốc tế đắt đỏ hay duyệt tay thủ công. | Tích hợp SePay Webhook với cơ chế **Xác thực Secret Key**, tự động phân tích cú pháp chuyển khoản bằng Regex (`THANH TOAN DON HANG <SUFFIX>`) để duyệt đơn tự động. |

---

## 4. CƠ SỞ DỮ LIỆU & THIẾT KẾ THỰC THỂ

Hệ thống được thiết kế trên **MongoDB Atlas** với các Collection chính:
1. **Users:** Quản lý tài khoản, vai trò (`admin`, `customer`), mật khẩu mã hóa bcrypt, token reset mật khẩu kèm thời hạn hết hạn (`resetPasswordToken`, `resetPasswordExpires`).
2. **Categories:** Danh mục sản phẩm công nghệ (Tên, mô tả, ảnh đại diện).
3. **Products:** Thông tin sản phẩm, giá, số lượng tồn kho, danh mục liên kết (`category_id`), hình ảnh, trạng thái hoạt động.
4. **Orders & OrderItems:** Đơn hàng, địa chỉ giao hàng, phương thức thanh toán (`COD`, `VietQR / SePay`), trạng thái đơn (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), trạng thái thanh toán (`UNPAID`, `PAID`).
5. **PaymentTransactions:** Bản ghi lịch sử giao dịch ngân hàng do Webhook ghi nhận (Mã giao dịch, số tiền, nội dung chuyển khoản, thời gian).
6. **Coupons:** Mã giảm giá, loại giảm (`percentage`, `fixed`), giá trị, đơn hàng tối thiểu, ngày hết hạn.
7. **Reviews:** Đánh giá sản phẩm của người dùng đã mua hàng.

---

## 5. BỘ CÂU HỎI & CÂU TRẢ LỜI BẢO VỆ TRƯỚC HỘI ĐỒNG

### 🎯 Câu 1: Em hãy giải thích luồng xác thực (Authentication & Authorization) trong hệ thống?
* **Trả lời:**
  - Hệ thống sử dụng cơ chế **JWT (JSON Web Token)** không trạng thái (stateless).
  - Khi người dùng đăng nhập thành công, backend tạo một JWT chứa `userId` và `role`, được ký bằng khóa bí mật `JWT_SECRET` với thời hạn hợp lệ.
  - Client lưu token này trong `localStorage` và tự động gắn vào Header `Authorization: Bearer <token>` trong mỗi request API.
  - Phía backend có middleware `authenticateToken` giải mã và xác thực tính hợp lệ của token, cùng middleware `authorizeAdmin` kiểm tra quyền hạn trước khi cho phép truy cập các tài nguyên quản trị.

---

### 🎯 Câu 2: Chức năng Thanh toán SePay hoạt động như thế nào và làm sao đảm bảo an toàn?
* **Trả lời:**
  - **Luồng hoạt động:** Khi khách chọn thanh toán Chuyển khoản VietQR, hệ thống sinh ra mã QR chứa: Số tài khoản ngân hàng, Số tiền chính xác và Nội dung chuyển khoản chứa mã đơn hàng (Ví dụ: `THANH TOAN DON HANG B2C8BBCE`).
  - Khi khách hàng quét mã và chuyển tiền thành công, SePay nhận biến động số dư từ ngân hàng và gửi một `HTTP POST Webhook` đến endpoint `/api/payments/sepay-webhook` của backend.
  - **Tính an toàn & Toàn vẹn:**
    1. Backend kiểm tra mã bí mật `x-secret-key` hoặc `Authorization` gửi từ SePay khớp với `SEPAY_WEBHOOK_SECRET_KEY` cấu hình trong biến môi trường.
    2. Backend trích xuất mã đơn hàng, kiểm tra đơn hàng có tồn tại và đang ở trạng thái `UNPAID` không.
    3. Kiểm tra số tiền chuyển thực tế (`transferAmount`) phải lớn hơn hoặc bằng tổng tiền đơn hàng.
    4. Cập nhật trạng thái đơn sang `PAID` và lưu bản ghi vào `PaymentTransactions` để chống trùng lặp (Idempotency).

---

### 🎯 Câu 3: Làm thế nào em tích hợp Chatbot AI vào dự án và nó hỗ trợ tra cứu dữ liệu thật như thế nào?
* **Trả lời:**
  - Em sử dụng mô hình **Google Gemini AI** kết hợp công nghệ **Function Calling (Tool Calling)** và truyền thông hai chiều qua **Socket.io (WebSocket)**.
  - Khi người dùng gửi tin nhắn (ví dụ: *"Tìm cho tôi laptop dưới 20 triệu"* hoặc *"Kiểm tra đơn hàng số 0912345678"*):
    1. Gemini nhận diện ý định và kích hoạt hàm tương ứng (`searchProducts` hoặc `getUserOrders`).
    2. Backend thực thi truy vấn trực tiếp trong MongoDB để lấy dữ liệu thực tế.
    3. Kết quả dữ liệu được trả ngược lại cho Gemini để AI tổng hợp thành câu trả lời bằng tiếng Việt thân thiện, chính xác và trả về cho client qua WebSocket.

---

### 🎯 Câu 4: Vì sao em chọn lưu trữ ảnh dạng Base64 Data URI thay vì lưu file tĩnh trên ổ cứng máy chủ?
* **Trả lời:**
  - Vì dự án được triển khai trên kiến trúc Cloud phân tán (Frontend trên Vercel, Backend trên Render). Ổ đĩa của Render là **ổ đĩa tạm thời (Ephemeral Storage)**, sẽ tự động bị xóa sạch khi máy chủ restart hoặc chuyển sang trạng thái ngủ (Sleep mode).
  - Bằng cách sử dụng **FileReader API** ở Frontend và chuyển thành chuỗi **Base64 Data URI** lưu trực tiếp vào MongoDB Atlas:
    1. Hình ảnh được lưu trữ **vĩnh viễn** cùng bản ghi sản phẩm/danh mục.
    2. Hiển thị tức thì 0ms trên giao diện quản trị mà không cần chờ tải file lên server.
    3. Không bị lỗi phân tán domain giữa Vercel và Render, không cần tốn chi phí thuê các dịch vụ lưu trữ đám mây bên thứ ba phức tạp.

---

### 🎯 Câu 5: Nếu hệ thống có lượng người dùng tăng đột biến, em sẽ tối ưu hóa (Scale) hệ thống như thế nào?
* **Trả lời:**
  - **Database:** Đánh chỉ mục (Index) trên các trường thường xuyên tìm kiếm như `slug`, `category_id`, `name`, `status`, `createdAt`. Áp dụng Redis Caching cho các dữ liệu ít thay đổi như Danh mục và Danh sách sản phẩm nổi bật.
  - **Backend:** Chuyển sang kiến trúc Stateless hoàn toàn, sử dụng Socket.io Redis Adapter để mở rộng nhiều node backend chạy song song cân bằng tải (Load Balancing).
  - **Frontend:** Tận dụng CDN của Vercel để cache các tài nguyên tĩnh và áp dụng kỹ thuật Lazy Loading hình ảnh.

---

*Chúc bạn có một buổi bảo vệ tốt nghiệp / chấm đồ án thành công rực rỡ và đạt điểm số tối đa!*
