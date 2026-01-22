# Port Mapping - BICAP Project

Tài liệu này mô tả mapping port giữa các service và Docker containers.

## 📋 Tổng quan Port Mapping

| Service | Port trong Container | Port trên Host | Trạng thái |
|---------|---------------------|----------------|------------|
| **auth-service** | 8080 | 8088 | ✅ Đã đồng bộ |
| **farm-production-service** | 8081 | 8081 | ✅ Đã đồng bộ |
| **trading-order-service** | 8082 | 8082 | ✅ Đã đồng bộ |
| **shipping-manager-service** | 8083 | ❌ Không expose | ✅ Gọi qua Kong Gateway |
| **blockchain-adapter-service** | 8084 | 8084 | ✅ Đã đồng bộ |

## 🗄️ Database Port Mapping

| Database | Port trong Container | Port trên Host | Database Name |
|----------|---------------------|----------------|---------------|
| **auth-db** | 3306 | 3307 | bicap_auth_db |
| **farm-production-db** | 3306 | 3308 | farm_production_db |
| **trading-order-db** | 3306 | 3309 | bicap_order_db |
| **shipping-db** | 3306 | 3310 | shipping_db |
| **blockchain-db** | 3306 | 3311 | bicap_blockchain_db |

## 🔌 Infrastructure Services

| Service | Port trong Container | Port trên Host | Mô tả |
|---------|---------------------|----------------|-------|
| **RabbitMQ** | 5672 | 5672 | Message Queue |
| **RabbitMQ Management** | 15672 | 15672 | Management UI |
| **Kong Gateway** | 8000 | 8000 | API Gateway |
| **Kong Admin** | 8001 | 8001 | Kong Admin API |

## 🌐 Web Applications

| Application | Port trong Container | Port trên Host |
|-------------|---------------------|----------------|
| **retailer-web** | 3000 | 3000 |
| **admin-web** | 3001 | 3001 |
| **farm-management-web** | 3002 | 3002 |
| **shipping-manager-web** | 3003 | 3003 |

## 🔗 Service URLs trong Docker Network

Khi các service giao tiếp với nhau trong Docker network, sử dụng tên service:

- `http://auth-service:8080`
- `http://farm-production-service:8081`
- `http://trading-order-service:8082`
- `http://shipping-manager-service:8083`
- `http://blockchain-adapter-service:8084`
- `http://kong-gateway:8000`

## 📝 Cấu hình Files

### auth-service
- **File**: `services/auth-service/src/main/resources/application.properties`
- **Port**: `8080` (trong container)

### farm-production-service
- **File**: `services/farm-production-service/src/main/resources/application.properties`
- **Port**: `8081`

### trading-order-service
- **File**: `services/trading-order-service/src/main/resources/application.properties`
- **Port**: `8082`

### shipping-manager-service
- **File**: `services/shipping-manager-service/src/main/resources/application.properties`
- **Port**: `8083`

### blockchain-adapter-service
- **File**: `services/blockchain-adapter-service/src/main/resources/application.yml`
- **Port**: `8084`

## 🚀 Truy cập từ Host Machine

Khi truy cập từ máy host (không phải trong Docker network):

- Auth Service: `http://localhost:8088`
- Farm Production Service: `http://localhost:8081`
- Trading Order Service: `http://localhost:8082`
- Shipping Manager Service: `http://localhost:8000/api/*` (qua Kong Gateway)
- Blockchain Adapter Service: `http://localhost:8084`
- Kong Gateway: `http://localhost:8000`
- RabbitMQ Management: `http://localhost:15672`

## ✅ Checklist Đồng bộ Port

- [x] auth-service: Port 8080 trong container → 8088 trên host
- [x] farm-production-service: Port 8081 → 8081
- [x] trading-order-service: Port 8082 → 8082
- [x] shipping-manager-service: Port 8083 (chỉ trong container, không expose) → Gọi qua Kong Gateway
- [x] blockchain-adapter-service: Port 8084 → 8084 (mới thêm)
- [x] Tất cả database ports đã được map
- [x] Service URLs trong docker-compose.yml đã được cập nhật

## 📌 Lưu ý

1. **Trong Docker Network**: Các service giao tiếp với nhau sử dụng tên service (ví dụ: `http://auth-service:8080`)
2. **Từ Host Machine**: Sử dụng `localhost` với port trên host (ví dụ: `http://localhost:8088`)
3. **Environment Variables**: Docker Compose override các giá trị trong config files thông qua environment variables
4. **Database Connections**: Trong Docker, các service kết nối database qua tên service (ví dụ: `auth-db:3306`)
5. **Shipping Manager Service**: Không expose port 8083 ra ngoài. Frontend gọi qua Kong Gateway tại `http://localhost:8000/api/shipments`, `/api/drivers`, `/api/vehicles`, `/api/orders`, `/api/reports`
