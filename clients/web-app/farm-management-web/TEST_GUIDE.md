# Hướng dẫn Test Farm Management Web

## ✅ Checklist Kiểm tra

### 1. Syntax và Dependencies
- [x] Tất cả files có syntax đúng
- [x] Dependencies đã được cài đặt
- [x] Không có lỗi import/require

### 2. Routes và Controllers
- [x] Authentication routes
- [x] Season Monitor routes
- [x] Farm Info routes
- [x] Product Management routes
- [x] Notification routes
- [x] Profile routes

### 3. Templates
- [x] season-monitor.ejs tồn tại
- [x] dashboard.ejs có link Season Monitor
- [x] Tất cả templates cần thiết đều có

### 4. RabbitMQ
- [x] Auto-detect environment
- [x] Fallback về localhost khi chạy local
- [x] Error handling tốt
- [x] Graceful degradation

## 🧪 Cách Test

### Bước 1: Kiểm tra Dependencies
```bash
cd clients/web-app/farm-management-web
npm install
```

### Bước 2: Kiểm tra Syntax
```bash
node -c src/authentication.js
node -c src/notificationController.js
node -c src/seasonMonitorController.js
node -c src/rabbitmqClient.js
```

### Bước 3: Khởi động Server
```bash
npm start
```

**Kết quả mong đợi:**
```
[dotenv] injecting env from config\.env
AUTH_SERVICE_URL http://kong-gateway:8000/api/auth
Farm Management web app started on http://localhost:3002
Environment: development
RabbitMQ: Enabled
⚠️  Detected local environment, using localhost instead of bicap-message-queue
[1/10] Connecting to RabbitMQ at: amqp://***:***@localhost:5672
```

### Bước 4: Test Các Routes

#### 4.1. Test Homepage
```
URL: http://localhost:3002/
Expected: Trang chủ hiển thị
```

#### 4.2. Test Login
```
URL: http://localhost:3002/login
Expected: Form đăng nhập hiển thị
```

#### 4.3. Test Dashboard (sau khi login)
```
URL: http://localhost:3002/dashboard
Expected: Dashboard với link "Season Monitor" trong sidebar
```

#### 4.4. Test Season Monitor
```
URL: http://localhost:3002/season-monitor
Expected: 
- Trang Season Monitor hiển thị
- Có nút "Tạo mùa vụ mới"
- Có bảng danh sách mùa vụ (nếu có)
```

### Bước 5: Test API Endpoints (sau khi login)

#### 5.1. Test Get Season Detail
```bash
# Cần có auth_token từ login
curl -X GET "http://localhost:3002/api/season-monitor/1/detail" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

#### 5.2. Test Create Season
```bash
curl -X POST "http://localhost:3002/api/season-monitor/create" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "batchCode": "BATCH001",
    "productType": "Rice",
    "startDate": "2024-01-01",
    "endDate": "2024-06-01"
  }'
```

#### 5.3. Test Update Progress
```bash
curl -X POST "http://localhost:3002/api/season-monitor/1/progress" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "processType": "WATERING",
    "description": "Tưới nước lần 1",
    "performedDate": "2024-01-15T10:00:00"
  }'
```

#### 5.4. Test Export Season
```bash
curl -X POST "http://localhost:3002/api/season-monitor/1/export" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "batchCode": "EXPORT001",
    "quantity": 1000,
    "unit": "kg"
  }'
```

## 🔍 Kiểm tra Chi tiết

### 1. Kiểm tra Season Monitor Page
- [ ] Sidebar có link "Season Monitor"
- [ ] Trang hiển thị danh sách mùa vụ
- [ ] Có nút "Tạo mùa vụ mới"
- [ ] Modal tạo mùa vụ hoạt động
- [ ] Modal xem chi tiết hoạt động
- [ ] Modal cập nhật tiến trình hoạt động
- [ ] Modal xuất hàng hoạt động
- [ ] QR Code hiển thị khi xuất hàng

### 2. Kiểm tra Backend Services
- [ ] Production Batch Service chạy
- [ ] Farming Process Service chạy
- [ ] Export Batch Service chạy
- [ ] Farm Service chạy
- [ ] API Gateway (Kong) chạy

### 3. Kiểm tra RabbitMQ
- [ ] RabbitMQ đang chạy (nếu cần)
- [ ] Connection thành công
- [ ] Notifications hoạt động

## 🐛 Troubleshooting

### Server không khởi động
1. Kiểm tra port 3002 có bị chiếm không:
   ```bash
   netstat -ano | findstr :3002
   ```
2. Kiểm tra dependencies:
   ```bash
   npm install
   ```

### Lỗi "Cannot find module"
```bash
npm install
```

### Lỗi RabbitMQ Connection
- Nếu không cần RabbitMQ: `$env:RABBITMQ_ENABLED="false"`
- Nếu cần RabbitMQ: Khởi động RabbitMQ trước

### Lỗi API không hoạt động
1. Kiểm tra backend services có chạy không
2. Kiểm tra API Gateway có chạy không
3. Kiểm tra auth_token có hợp lệ không

## ✅ Test Checklist Hoàn chỉnh

Sau khi test, đảm bảo:
- [ ] Server khởi động thành công
- [ ] Tất cả routes hoạt động
- [ ] Season Monitor page hiển thị đúng
- [ ] Có thể tạo mùa vụ mới
- [ ] Có thể xem chi tiết mùa vụ
- [ ] Có thể cập nhật tiến trình
- [ ] Có thể xuất hàng và tạo QR Code
- [ ] RabbitMQ connection (nếu có) hoạt động
- [ ] Không có lỗi trong console
