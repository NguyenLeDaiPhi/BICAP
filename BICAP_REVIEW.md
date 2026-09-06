# BICAP Project - Comprehensive Review

## 📋 Tổng quan dự án

### Cấu trúc dự án
- **Services (Backend)**: 5 microservices
  - `auth-service` (Port 8088)
  - `farm-production-service` (Port 8081)
  - `trading-order-service` (Port 8082)
  - `blockchain-adapter-service` (Port 8084)
  - `shipping-manager-service` (Port 8083, không expose ra ngoài)

- **Clients (Frontend)**: 4 web applications
  - `admin-web` (Port 3001)
  - `farm-management-web` (Port 3002)
  - `retailer-web` (Port 3000)
  - `shipping-manager-web` (Port 3003)

- **Databases**: 5 MySQL databases
  - `auth-db` (Port 3307)
  - `farm-production-db` (Port 3308)
  - `trading-order-db` (Port 3309)
  - `shipping-db` (Port 3310)
  - `blockchain-db` (Port 3311)

- **Infrastructure**:
  - `kong-gateway` (Port 8000, 8001) - API Gateway
  - `bicap-message-queue` (RabbitMQ) - Port 5672, 15672

## ✅ Trạng thái hiện tại

### Containers đang chạy
Tất cả containers đều đang chạy và healthy:
- ✅ All services: Running
- ✅ All databases: Healthy
- ✅ Kong Gateway: Healthy
- ✅ RabbitMQ: Running

## 🔍 Vấn đề đang gặp phải

### 1. Error Message không hiển thị đúng trên frontend

**Vấn đề**: Khi tạo Vehicle/Driver với dữ liệu trùng (biển số, license, citizenId), frontend hiển thị "Request failed with status code 400" thay vì error message cụ thể từ backend.

**Nguyên nhân gốc rễ**:
- Backend BICAP đóng gói lỗi với key `"error"` trong JSON response
- Frontend tìm kiếm key `"message"` → không tìm thấy → fallback sang `err.message`
- `err.message` mặc định của Axios khi status 400 là "Request failed with status code 400"

**Backend trả về**:
```java
Map<String, String> errorResponse = new HashMap<>();
errorResponse.put("error", e.getMessage()); // Key là "error"
return ResponseEntity.status(400).body(errorResponse);
// Response: { "error": "Số điện thoại / GPLX đã tồn tại trong hệ thống" }
```

**Frontend cũ** (sai):
```typescript
const errorMsg =
  err.response?.data?.message || // ❌ undefined (vì key là "error")
  (typeof err.response?.data === 'string' ? err.response.data : null) ||
  err.message || // ✅ Rơi vào đây → "Request failed with status code 400"
  'Đăng nhập thất bại';
```

**✅ ĐÃ KHẮC PHỤC**:
- Thêm hàm `getErrorMessage()` helper vào tất cả 5 file `api.ts`
- Hàm kiểm tra theo thứ tự: `error` → `message` → string → `err.message`
- Cập nhật tất cả login/register/trace pages sử dụng helper này

```typescript
// frontend/web/*/src/lib/api.ts
export const getErrorMessage = (err: any): string => {
  if (err.response?.data?.error) return err.response.data.error;  // ✅ Backend BICAP format
  if (err.response?.data?.message) return err.response.data.message;
  if (typeof err.response?.data === 'string') return err.response.data;
  if (err.message) return err.message;
  return 'Đã xảy ra lỗi không xác định';
};
```

## ✅ Giải pháp đã triển khai

### 1. Thêm hàm `getErrorMessage()` vào tất cả api.ts
**Files đã cập nhật**:
- `frontend/web/admin-web/src/lib/api.ts`
- `frontend/web/farm-manager-web/src/lib/api.ts`
- `frontend/web/guest-web/src/lib/api.ts`
- `frontend/web/retailer-web/src/lib/api.ts`
- `frontend/web/shipping-manager-web/src/lib/api.ts`

### 2. Cập nhật các trang sử dụng error handling
**Login pages** (4 files):
- `admin-web/src/app/login/page.tsx`
- `farm-manager-web/src/app/login/page.tsx`
- `retailer-web/src/app/login/page.tsx`
- `shipping-manager-web/src/app/login/page.tsx`

**Register pages** (3 files):
- `farm-manager-web/src/app/register/page.tsx`
- `retailer-web/src/app/register/page.tsx`
- `shipping-manager-web/src/app/register/page.tsx`

**Other pages** (1 file):
- `retailer-web/src/app/trace/page.tsx`

### 3. Nguyên lý hoạt động
Hàm `getErrorMessage()` kiểm tra theo thứ tự ưu tiên:
1. `err.response?.data?.error` - Backend BICAP trả về `{ error: "..." }`
2. `err.response?.data?.message` - Một số service trả về `{ message: "..." }`
3. `typeof err.response?.data === 'string'` - Response là string trực tiếp
4. `err.message` - Fallback cuối cùng

## 📝 Checklist kiểm tra

- [x] ~~Test API trực tiếp qua curl~~
- [x] ~~Kiểm tra Content-Type header trong response~~
- [x] ~~Kiểm tra Kong Gateway có modify response không~~
- [x] **ĐÃ SỬA**: Thêm helper `getErrorMessage()` kiểm tra key `"error"` trước `"message"`
- [x] **ĐÃ SỬA**: Cập nhật tất cả login/register/trace pages sử dụng helper
- [ ] Kiểm tra logs của shipping-manager-service để xem error message được trả về

## 🎯 Các tính năng đã hoàn thành

### Shipping Manager Service
- ✅ CRUD cho Vehicle (với validation unique plate)
- ✅ CRUD cho Driver (với validation unique license và citizenId)
- ✅ CRUD cho Shipment
- ✅ Quản lý Orders
- ✅ Reports (DriverReport, AdminReport)
- ✅ Notifications qua RabbitMQ
- ✅ Integration với Farm Production Service
- ✅ Integration với Blockchain Adapter Service

### Shipping Manager Web
- ✅ EJS templates cho tất cả pages
- ✅ CRUD UI cho Vehicle
- ✅ CRUD UI cho Driver
- ✅ Shipment management UI
- ✅ Orders management UI
- ✅ Reports UI
- ✅ Notifications UI
- ✅ Dashboard với statistics

## 🚀 Các bước tiếp theo

1. **Fix error message display**: Đảm bảo error message từ backend hiển thị đúng trên frontend
2. **Testing**: Test toàn bộ workflows
3. **Documentation**: Hoàn thiện documentation
4. **Performance**: Tối ưu performance nếu cần
