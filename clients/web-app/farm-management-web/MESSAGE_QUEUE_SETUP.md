# Message Queue Setup - Thay thế CORS bằng RabbitMQ

## Tổng quan

Farm Management Web đã được cấu hình để sử dụng RabbitMQ thay vì HTTP với CORS cho giao tiếp giữa các services.

## Các cải tiến đã thực hiện

### 1. **Auto-detect RabbitMQ URL**
- Tự động phát hiện môi trường (Docker vs Local)
- Fallback về `localhost` khi chạy local
- Sử dụng `bicap-message-queue` khi chạy trong Docker

### 2. **RabbitMQ Client Helper** (`rabbitmqClient.js`)
- Connection pooling
- RPC request/response pattern
- Publish/subscribe pattern
- Auto-reconnection

### 3. **Improved Error Handling**
- Connection timeout
- Exponential backoff retry
- Graceful degradation
- Clear error messages với hints

## Cấu trúc RabbitMQ

### Exchange
- **Name**: `bicap.internal.exchange`
- **Type**: `topic`
- **Durable**: `true`

### Queues
- **Request Queue**: `farm.web.request.*` (dynamic, per request)
- **Response Queue**: `farm.web.response.*` (dynamic, per request)
- **Notification Queue**: `farm.notifications` (durable)

### Routing Keys
- `farm.production.batch.get` - Lấy danh sách mùa vụ
- `farm.production.batch.get.detail` - Lấy chi tiết mùa vụ
- `farm.production.batch.create` - Tạo mùa vụ mới
- `farm.production.process.add` - Thêm tiến trình
- `farm.production.export.create` - Tạo export batch
- `farm.features.get` - Lấy thông tin farm
- `farm.features.update` - Cập nhật thông tin farm

## Cách sử dụng RabbitMQ Client

### 1. RPC Request (Request/Response)
```javascript
const rabbitmqClient = require('./rabbitmqClient');

// Gửi request và chờ response
try {
    const response = await rabbitmqClient.sendRPCRequest(
        'farm.production.batch.get',
        { farmId: 123 },
        30000 // timeout 30s
    );
    console.log('Response:', response);
} catch (error) {
    console.error('Error:', error.message);
}
```

### 2. Publish Message (Fire and Forget)
```javascript
const rabbitmqClient = require('./rabbitmqClient');

// Gửi message không cần response
await rabbitmqClient.publishMessage(
    'farm.production.batch.created',
    { batchId: 123, farmId: 456 }
);
```

## Migration từ HTTP sang RabbitMQ

### Trước (HTTP với CORS):
```javascript
const response = await axios.get(`${API_URL}/production-batches/farm/${farmId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

### Sau (RabbitMQ):
```javascript
const rabbitmqClient = require('./rabbitmqClient');

const response = await rabbitmqClient.sendRPCRequest(
    'farm.production.batch.get',
    { 
        farmId: farmId,
        token: token // JWT token được gửi trong payload
    }
);
```

## Cấu hình Environment Variables

### Local Development
```env
RABBITMQ_URL=amqp://root:root@localhost:5672
RABBITMQ_ENABLED=true
```

### Docker
```env
RABBITMQ_URL=amqp://root:root@bicap-message-queue:5672
DOCKER_ENV=true
RABBITMQ_ENABLED=true
```

### Disable RabbitMQ
```env
RABBITMQ_ENABLED=false
```

## Lợi ích của Message Queue

1. **Không cần CORS**: Giao tiếp qua message queue, không có CORS issues
2. **Decoupling**: Services không cần biết địa chỉ của nhau
3. **Scalability**: Dễ dàng scale các services
4. **Reliability**: Message persistence, retry mechanism
5. **Async Processing**: Không block request/response

## Troubleshooting

### RabbitMQ không kết nối được
```bash
# Kiểm tra RabbitMQ đang chạy
docker ps | grep rabbitmq

# Kiểm tra logs
docker logs bicap-message-queue

# Test connection
docker exec -it bicap-message-queue rabbitmqctl status
```

### Lỗi ACCESS_REFUSED
- Kiểm tra username/password trong RABBITMQ_URL
- Default: `root:root`

### Lỗi ENOTFOUND
- Kiểm tra hostname trong RABBITMQ_URL
- Local: `localhost`
- Docker: `bicap-message-queue`

## Next Steps

1. Migrate các HTTP calls trong `seasonMonitorController.js` sang RabbitMQ
2. Migrate các HTTP calls trong `farmController.js` sang RabbitMQ
3. Update Java services để listen trên RabbitMQ queues
4. Test end-to-end với message queue
