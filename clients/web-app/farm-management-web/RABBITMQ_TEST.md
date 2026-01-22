# Kiểm tra kết nối RabbitMQ

## Tóm tắt các cải tiến đã thực hiện:

### 1. **Non-blocking Connection**
- Sử dụng `setImmediate()` để không block server startup
- Server khởi động ngay lập tức, RabbitMQ connection được thử ở background

### 2. **Connection Timeout**
- Timeout 10 giây cho mỗi lần kết nối
- Tránh treo lâu khi RabbitMQ không có sẵn

### 3. **Exponential Backoff Retry**
- Lần 1: 5 giây
- Lần 2: 10 giây  
- Lần 3: 20 giây
- Lần 4: 40 giây
- Lần 5+: 60 giây (tối đa)

### 4. **Giới hạn Retry**
- Tối đa 10 lần retry
- Sau đó dừng và log cảnh báo rõ ràng

### 5. **Graceful Degradation**
- Server vẫn chạy bình thường dù không có RabbitMQ
- Notifications hoạt động in-memory
- Có thể tắt RabbitMQ bằng `RABBITMQ_ENABLED=false`

## Cấu hình RabbitMQ:

### Trong Docker Compose:
```yaml
RABBITMQ_URL=amqp://root:root@bicap-message-queue:5672
```

### Trong .env (nếu chạy local):
```env
RABBITMQ_URL=amqp://localhost:5672
# hoặc
RABBITMQ_URL=amqp://root:root@localhost:5672

# Tắt RabbitMQ (optional):
RABBITMQ_ENABLED=false
```

## Kiểm tra kết nối:

### 1. Kiểm tra RabbitMQ đang chạy:
```bash
docker ps | grep rabbitmq
# hoặc
docker ps | grep bicap-message-queue
```

### 2. Kiểm tra logs của farm-management-web:
```bash
docker logs farm-management-web
# hoặc nếu chạy local:
npm start
```

### 3. Kết quả mong đợi:

**Khi RabbitMQ có sẵn:**
```
[1/10] Connecting to RabbitMQ at: amqp://root:root@bicap-message-queue:5672
✓ RabbitMQ connected. Listening on queue: farm.notifications
```

**Khi RabbitMQ không có sẵn:**
```
[1/10] Connecting to RabbitMQ at: amqp://root:root@bicap-message-queue:5672
Failed to connect to RabbitMQ (attempt 1/10): getaddrinfo ENOTFOUND bicap-message-queue
Retrying in 5 seconds...
   Server will continue running. Notifications will work in-memory only until RabbitMQ is available.
```

**Sau 10 lần retry:**
```
❌ RabbitMQ: Max retry count reached. Stopping retry attempts.
   Notifications will work in-memory only. To re-enable, restart the server.
```

## Test kết nối:

### 1. Test với RabbitMQ có sẵn:
```bash
# Khởi động RabbitMQ
docker-compose up -d bicap-message-queue

# Khởi động farm-management-web
cd clients/web-app/farm-management-web
npm start
```

### 2. Test với RabbitMQ không có:
```bash
# Không khởi động RabbitMQ, chỉ chạy farm-management-web
cd clients/web-app/farm-management-web
npm start
# Server vẫn chạy bình thường
```

### 3. Test tắt RabbitMQ:
```bash
# Thêm vào .env hoặc docker-compose.yml
RABBITMQ_ENABLED=false

# Server sẽ log:
⚠️  RabbitMQ is disabled. Notifications will work in-memory only.
```

## Kết luận:

✅ Server khởi động nhanh, không bị block
✅ Xử lý lỗi tốt với timeout và retry logic
✅ Graceful degradation khi RabbitMQ không có
✅ Log rõ ràng, dễ debug
✅ Có thể tắt RabbitMQ nếu không cần
