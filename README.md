# BICAP - Blockchain Integration in Clean Agricultural Production

## Giới thiệu

BICAP là hệ thống tích hợp Blockchain trong sản xuất nông sản sạch, được xây dựng theo kiến trúc Microservices.

## Kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                     │
│                    Web Application      Mobile App                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
                    Kubernetes Ingress
                              │
                              ▼
                    Spring Cloud Gateway
                              │
      ┌───────────────────────┼───────────────────────────────┐
      │                       │                               │
      ▼                       ▼                               ▼
  Auth Service            User Service                    Farm Service
      │                       │                               │
      ▼                       ▼                               ▼
   Auth DB               User DB                        Farm DB
      │                                                       │
      ▼                                                       ▼
  Product Service    Trading Service   Order Service   Payment Service
      │                       │                               │
      ▼                       ▼                               ▼
  Product DB         Trading DB        Order DB       Payment DB

                          Kafka
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   Notification      IoT Service       Blockchain Service
        │                    │                    │
        ▼                    ▼                    ▼
   Notify DB          IoT DB             VeChainThor
```

## Cấu trúc thư mục

```
BICAP/
├── backend/
│   ├── api-gateway/           # API Gateway
│   ├── auth-service/          # Authentication Service
│   ├── user-service/          # User Profile Service
│   ├── product-service/       # Product Management
│   ├── farm-service/          # Farm & Season Management
│   ├── trading-service/       # Trading Floor
│   ├── order-service/         # Order Management
│   ├── payment-service/       # Payment Processing
│   ├── shipping-service/      # Shipping Management
│   ├── notification-service/  # Notifications
│   ├── iot-service/          # IoT Data Collection
│   ├── blockchain-service/    # Blockchain Adapter
│   └── traceability-service/  # QR Code & Traceability
├── frontend/
│   └── web/
│       ├── admin-web/         # Admin Dashboard
│       ├── farm-manager-web/  # Farm Manager
│       ├── retailer-web/      # Retailer
│       ├── shipping-manager-web/
│       └── guest-web/         # Public Traceability
├── mobile/
│   ├── driver-app/            # Driver Mobile App
│   └── guest-app/             # Guest Mobile App
├── blockchain/
│   └── smart-contracts/       # Smart Contracts
├── infrastructure/
│   ├── docker/                # Docker files
│   └── k8s/                  # Kubernetes manifests
└── database/                  # Database schemas
```

## Các Service

| Service | Mô tả | Port |
|---------|--------|------|
| api-gateway | API Gateway | 8080 |
| auth-service | Xác thực, JWT | 8081 |
| user-service | Hồ sơ người dùng | 8082 |
| farm-service | Quản lý trang trại | 8083 |
| product-service | Quản lý sản phẩm | 8084 |
| trading-service | Sàn giao dịch | 8085 |
| order-service | Quản lý đơn hàng | 8086 |
| payment-service | Thanh toán | 8087 |
| shipping-service | Vận chuyển | 8088 |
| notification-service | Thông báo | 8089 |
| iot-service | IoT Data | 8091 |
| blockchain-service | Blockchain | 8092 |
| traceability-service | Truy xuất | 8093 |

## Công nghệ

### Backend
- Java 21
- Spring Boot 3.4.1
- Spring Cloud Gateway
- Spring Security + JWT
- Spring Data JPA
- SQL Server
- Kafka
- Redis

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- TanStack Query

### Mobile
- React Native
- Expo

### Infrastructure
- Docker
- Kubernetes
- VeChainThor (Blockchain)

## Cách chạy

### 1. Chạy với Docker Compose (Development)

```bash
cd infrastructure/docker
docker-compose up -d
```

### 2. Chạy với Kubernetes (Production)

```bash
kubectl apply -f infrastructure/k8s/
```

### 3. Chạy từng Service

```bash
# Auth Service
cd services/auth-service
mvn spring-boot:run

# User Service
cd backend/user-service
mvn spring-boot:run
```

## Roles

| Role | Mô tả |
|------|--------|
| ADMIN | Quản trị hệ thống |
| FARM_MANAGER | Quản lý trang trại |
| RETAILER | Nhà bán lẻ |
| SHIPPING_MANAGER | Quản lý vận chuyển |
| SHIPPING_DRIVER | Tài xế |
| GUEST | Khách (chỉ xem công khai) |

## API Endpoints

### Authentication
- POST `/api/auth/register` - Đăng ký
- POST `/api/auth/login` - Đăng nhập
- POST `/api/auth/refresh-token` - Làm mới token

### Users
- GET `/api/users/me` - Lấy thông tin của tôi
- PUT `/api/users/me` - Cập nhật thông tin

### Products
- GET `/api/products` - Danh sách sản phẩm
- GET `/api/products/{id}` - Chi tiết sản phẩm
- POST `/api/products` - Tạo sản phẩm

### Traceability (Public)
- GET `/api/trace/{traceCode}` - Truy xuất nguồn gốc

## License

MIT License
