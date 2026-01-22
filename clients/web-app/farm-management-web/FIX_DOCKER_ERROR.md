# Fix Docker API Error

## Vấn đề
Lỗi: `request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.52/containers/...`

## Nguyên nhân
- Docker Desktop chưa khởi động hoặc có vấn đề
- Code đang cố detect Docker environment nhưng gặp lỗi khi gọi Docker API

## Giải pháp đã áp dụng

### 1. Sửa Docker Detection Logic
- **Trước**: Có thể gọi Docker API hoặc file system checks gây lỗi
- **Sau**: Chỉ dùng environment variables và safe checks
  - `process.env.DOCKER_ENV === 'true'`
  - `process.env.HOSTNAME?.includes('container')`
  - `fs.existsSync('/.dockerenv')` - chỉ trên Linux/Mac, không check trên Windows

### 2. Auto-fallback về localhost
- Nếu detect không phải Docker → tự động dùng `localhost`
- Không cần Docker Desktop chạy để server hoạt động

### 3. Safe Error Handling
- Tất cả Docker-related checks đều có try-catch
- Server vẫn chạy được dù Docker có vấn đề

## Cách chạy

### Option 1: Chạy local không cần Docker
```bash
cd clients/web-app/farm-management-web
npm start
```
Server sẽ tự động dùng `localhost` cho RabbitMQ.

### Option 2: Chạy với Docker
1. Khởi động Docker Desktop trước
2. Set environment variable:
   ```bash
   $env:DOCKER_ENV="true"
   ```
3. Chạy server:
   ```bash
   npm start
   ```

### Option 3: Tắt RabbitMQ hoàn toàn
```bash
$env:RABBITMQ_ENABLED="false"
npm start
```

## Kiểm tra

### Server đã chạy thành công nếu thấy:
```
Farm Management web app started on http://localhost:3002
Environment: development
RabbitMQ: Enabled
⚠️  Detected local environment, using localhost instead of bicap-message-queue
```

### Nếu vẫn có lỗi Docker:
1. Khởi động Docker Desktop
2. Hoặc set `RABBITMQ_ENABLED=false` để tắt RabbitMQ
3. Server vẫn chạy bình thường, chỉ notifications sẽ không hoạt động

## Lưu ý

- Server **KHÔNG CẦN** Docker để chạy
- RabbitMQ có thể chạy local hoặc trong Docker
- Tất cả Docker detection đều safe và không gây crash
