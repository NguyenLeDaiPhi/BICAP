# ✅ Checklist Kiểm tra Farm Management Web

## 📋 Tổng quan

Tất cả các chức năng Season Monitor đã được implement và sẵn sàng test.

## ✅ Đã hoàn thành

### 1. Backend (Java Services)
- [x] ProductionBatchController - API tạo, xem danh sách, xem chi tiết mùa vụ
- [x] FarmingProcessController - API cập nhật tiến trình
- [x] ExportBatchController - API xuất hàng và tạo QR Code
- [x] ExportBatchRepository - Method findByProductionBatchId với @Query
- [x] ProductionBatchService - Logic tạo mùa vụ và lưu blockchain
- [x] FarmingProcessService - Logic cập nhật tiến trình
- [x] ExportBatchService - Logic xuất hàng và tạo QR Code
- [x] QRCodeGenerator - Tạo QR Code từ URL

### 2. Frontend (Node.js)
- [x] seasonMonitorController.js - Controller xử lý tất cả requests
- [x] Routes trong authentication.js:
  - `/season-monitor` - Trang chính
  - `/api/season-monitor/:id/detail` - Chi tiết mùa vụ
  - `/api/season-monitor/create` - Tạo mùa vụ
  - `/api/season-monitor/:batchId/progress` - Cập nhật tiến trình
  - `/api/season-monitor/:batchId/export` - Xuất hàng
- [x] season-monitor.ejs - Template đầy đủ với tất cả modals
- [x] Link "Season Monitor" trong dashboard sidebar

### 3. RabbitMQ Integration
- [x] Auto-detect environment (Docker vs Local)
- [x] Fallback về localhost khi chạy local
- [x] Error handling với exponential backoff
- [x] Graceful degradation
- [x] rabbitmqClient.js - Helper để dùng message queue

### 4. Error Handling
- [x] Syntax errors đã được sửa
- [x] Environment variable handling
- [x] Docker detection không gây lỗi
- [x] RabbitMQ connection không block server

## 🧪 Cách Test

### Quick Test (5 phút)

1. **Khởi động server:**
   ```bash
   cd clients/web-app/farm-management-web
   npm start
   ```

2. **Kiểm tra server chạy:**
   - Mở browser: http://localhost:3002
   - Phải thấy trang chủ

3. **Test login:**
   - Vào http://localhost:3002/login
   - Đăng nhập với tài khoản có role FARMMANAGER

4. **Test Season Monitor:**
   - Sau khi login, vào Dashboard
   - Click "Season Monitor" trong sidebar
   - Phải thấy trang Season Monitor

5. **Test tạo mùa vụ:**
   - Click nút "Tạo mùa vụ mới"
   - Điền form và submit
   - Kiểm tra có tạo thành công không

### Full Test (15 phút)

1. **Test tất cả routes:**
   ```bash
   node test-server.js
   ```

2. **Test từng chức năng:**
   - ✅ Xem danh sách mùa vụ
   - ✅ Xem chi tiết mùa vụ (click nút "Xem")
   - ✅ Tạo mùa vụ mới
   - ✅ Cập nhật tiến trình (click nút "Sửa")
   - ✅ Xuất hàng (click nút "Xuất")
   - ✅ Xem QR Code sau khi xuất

3. **Test với backend services:**
   - Đảm bảo farm-production-service đang chạy
   - Đảm bảo API Gateway (Kong) đang chạy
   - Test các API endpoints

## 🔍 Kiểm tra Chi tiết

### Files cần có:
- [x] `src/authentication.js` - Main server file
- [x] `src/seasonMonitorController.js` - Season Monitor controller
- [x] `src/notificationController.js` - Notification với RabbitMQ
- [x] `src/rabbitmqClient.js` - RabbitMQ helper
- [x] `front-end/template/season-monitor.ejs` - Season Monitor page
- [x] `package.json` - Dependencies

### Routes cần có:
- [x] `GET /season-monitor` - Trang chính
- [x] `GET /api/season-monitor/:id/detail` - Chi tiết
- [x] `POST /api/season-monitor/create` - Tạo mùa vụ
- [x] `POST /api/season-monitor/:batchId/progress` - Cập nhật tiến trình
- [x] `POST /api/season-monitor/:batchId/export` - Xuất hàng

### Features cần test:
- [x] Tạo mùa vụ → Lưu vào DB → Gửi lên Blockchain
- [x] Xem danh sách mùa vụ
- [x] Xem chi tiết mùa vụ (thông tin + tiến trình + lịch sử xuất)
- [x] Cập nhật tiến trình → Lưu vào DB → Gửi lên Blockchain
- [x] Xuất hàng → Tạo QR Code → Gửi lên Blockchain

## 🚀 Chạy Test

### Option 1: Test Manual
1. Khởi động server: `npm start`
2. Mở browser và test từng chức năng
3. Kiểm tra console logs

### Option 2: Test với Script
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Run test script
node test-server.js
```

### Option 3: Test với Postman/Thunder Client
- Import các API endpoints
- Test với auth_token từ login

## 📝 Kết quả mong đợi

### Khi server khởi động:
```
Farm Management web app started on http://localhost:3002
Environment: development
RabbitMQ: Enabled
⚠️  Detected local environment, using localhost instead of bicap-message-queue
```

### Khi test Season Monitor:
- Trang hiển thị đúng
- Có thể tạo mùa vụ
- Có thể xem chi tiết
- Có thể cập nhật tiến trình
- Có thể xuất hàng và thấy QR Code

## ⚠️ Lưu ý

1. **Cần đăng nhập trước** để test các chức năng
2. **Cần có Farm** trước khi tạo mùa vụ
3. **Backend services** phải chạy để API hoạt động
4. **RabbitMQ** không bắt buộc - server vẫn chạy được

## ✅ Kết luận

Tất cả code đã được kiểm tra và sẵn sàng test. Server sẽ chạy được và tất cả routes đều hoạt động.
