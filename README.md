# BICAP - Blockchain Integration in Clean Agricultural Production

## Giới thiệu

BICAP là hệ thống tích hợp Blockchain trong sản xuất nông sản sạch, được xây dựng theo kiến trúc Microservices. Hệ thống cho phép ghi nhận và xác minh tính toàn vẹn dữ liệu truy xuất nguồn gốc nông sản trên blockchain.

## Kiến trúc

```
    ┌─────────────────────────────────────────────────────────────────┐
    │                         USERS                                   │
    │                   Web Application      Mobile App                 │
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
    Product DB     Trading DB        Order DB       Payment DB

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
│   ├── blockchain-adapter-service/  # Blockchain Adapter ⭐
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
│   └── guest-app/            # Guest Mobile App
├── blockchain/               # ⭐ Blockchain Components ⭐
│   └── smart-contracts/      # Smart Contracts
│       ├── AgriTraceability.sol    # Main Smart Contract
│       ├── abi/                   # Contract ABI
│       │   └── AgriTraceability.json
│       └── DEPLOY_GUIDE.md         # Deployment Guide
├── infrastructure/
│   ├── docker/               # Docker files
│   └── k8s/                  # Kubernetes manifests
└── database/                  # Database schemas
    └── blockchain-adapter-database/
        └── migration/         # DB Migrations
```

## Blockchain Service ⭐

### Tổng quan

Blockchain Adapter Service cung cấp khả năng ghi nhận và xác minh dữ liệu truy xuất nguồn gốc trên blockchain với các tính năng:

- **Ghi nhận dữ liệu**: Hash dữ liệu và lưu lên blockchain với transaction hash chuẩn
- **Xác minh tính toàn vẹn**: So khớp hash để phát hiện dữ liệu bị sửa đổi
- **Thông tin block đầy đủ**: Block number, gas used, contract address
- **Tương thích Smart Contract**: Hỗ trợ deploy và tương tác với Solidity contracts

### Smart Contract

#### AgriTraceability.sol

Smart contract được viết bằng Solidity ^0.8.20, cung cấp:

```solidity
struct BatchRecord {
    string  batchCode;      // Mã lô duy nhất
    bytes32 dataHash;       // Hash Keccak256 (64 ký tự hex)
    address farmAddress;    // Địa chỉ ví nông trại
    uint256 timestamp;      // Unix timestamp
    string  resourceType;   // Loại tài nguyên
    bool    isActive;       // Trạng thái
}
```

#### Các Functions chính

| Function | Mô tả | Gas Estimate |
|----------|-------|-------------|
| `recordBatch()` | Ghi nhận lô sản xuất mới | ~100,000 |
| `verifyBatch()` | Xác minh tính toàn vẹn dữ liệu | ~50,000 |
| `quickVerify()` | Xác minh nhanh bằng hash | ~30,000 |
| `getBatch()` | Lấy thông tin chi tiết lô | ~20,000 |

### API Endpoints

#### Ghi dữ liệu lên Blockchain

```http
POST /api/blockchain/write
Content-Type: application/json

{
  "batchId": 123,
  "rawData": "{\"farmId\":1,\"product\":\"Rice\",\"weight\":1000}",
  "resourceType": "PRODUCTION"
}
```

**Response:**
```json
{
  "message": "Written to blockchain successfully",
  "batchId": 123,
  "resourceType": "PRODUCTION",
  "success": true
}
```

#### Xác minh dữ liệu

```http
GET /api/blockchain/verify/{batchId}
```

**Response:**
```json
{
  "batchId": 123,
  "valid": true,
  "message": "✅ Data integrity verified: hash matches blockchain record",
  "success": true
}
```

#### Xác minh với dữ liệu bên ngoài

```http
GET /api/blockchain/verify-external?batchId=123&data={"farmId":1,"product":"Rice"}
```

#### Lấy thông tin Blockchain

```http
GET /api/blockchain/info/{batchId}
```

**Response:**
```json
{
  "batchId": 123,
  "dataHash": "da242c242bba0f863542d4dd0e375e31ab7e86e14cc23a959f4172777a824a3c",
  "blockchainTx": "0x8f4e2b1c3d5a7e9f2c4b6d8a1e3f5c7b9d2a4f6e8c1b3d5e7f9a2c4b6d8e1f3a5c7",
  "blockNumber": 150000001,
  "blockHash": "0xabc123def456...",
  "gasUsed": 125000,
  "network": "VeChainThor",
  "verified": true,
  "createdAt": "2026-09-06T10:30:00",
  "success": true
}
```

### Transaction Hash Format

Transaction hash được tạo theo chuẩn **Keccak256**:

- **Format**: `0x` + 64 ký tự hex (66 ký tự total)
- **Ví dụ**: `0x8f4e2b1c3d5a7e9f2c4b6d8a1e3f5c7b9d2a4f6e8c1b3d5e7f9a2c4b6d8e1f3a5c7`
- **Độ dài**: 32 bytes (256 bits)

### Hash Verification Logic

```
┌──────────────┐     SHA-256      ┌──────────────┐
│  Raw Data   │ ──────────────▶  │  Data Hash   │
│  (JSON)     │                 │  (64 hex)    │
└──────────────┘                 └──────┬───────┘
                                        │
                                        │ Compare
                                        ▼
┌──────────────┐     SHA-256      ┌──────────────┐
│ Stored Hash │ ◀──────────────  │  Stored Hash │
│  (DB)       │                 │  (on-chain)  │
└──────────────┘                 └──────────────┘
                                        │
                                        ▼
                              ┌──────────────────────┐
                              │  VALID / INVALID      │
                              │  (Data unchanged or   │
                              │   modified)           │
                              └──────────────────────┘
```

### Các Service

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
| blockchain-adapter-service | Blockchain | 8092 ⭐ |
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

### Blockchain
- Solidity ^0.8.20 ⭐
- VeChainThor / Ethereum
- Hardhat / Truffle (Deployment)

### Infrastructure
- Docker
- Kubernetes

## Cách chạy

### 1. Chạy với Docker Compose (Development)

```bash
cd infrastructure/docker
docker-compose up -d
```

### 2. Chạy Blockchain Adapter Service riêng

```bash
cd services/blockchain-adapter-service
mvn spring-boot:run
```

### 3. Compile Smart Contract

```bash
# Cài đặt Hardhat
npm install --save-dev hardhat

# Compile contracts
npx hardhat compile

# Chạy tests
npx hardhat test
```

### 4. Deploy Smart Contract

```bash
# Deploy lên local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy lên testnet
npx hardhat run scripts/deploy.js --network sepolia
```

Xem chi tiết tại: [blockchain/smart-contracts/DEPLOY_GUIDE.md](blockchain/smart-contracts/DEPLOY_GUIDE.md)

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

### Blockchain (Public)
- POST `/api/blockchain/write` - Ghi dữ liệu lên blockchain
- GET `/api/blockchain/verify/{batchId}` - Xác minh hash
- GET `/api/blockchain/info/{batchId}` - Lấy thông tin blockchain

### Traceability (Public)
- GET `/api/trace/{traceCode}` - Truy xuất nguồn gốc

## Database Schema

### blockchain_records

```sql
CREATE TABLE blockchain_records (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_id        BIGINT NOT NULL,
    batch_code      VARCHAR(100),
    resource_type   VARCHAR(50),
    data_hash       VARCHAR(64) NOT NULL,          -- SHA-256 hash (64 hex)
    raw_data        TEXT,                           -- Original data for verification
    blockchain_tx   VARCHAR(66) NOT NULL,           -- Keccak256 tx hash (0x + 64 hex)
    block_number    BIGINT,                         -- Block number
    block_hash      VARCHAR(66),                    -- Block hash
    gas_used        BIGINT,                         -- Gas consumed
    tx_index        INT,                           -- TX index in block
    contract_address VARCHAR(42),                   -- Smart contract address
    network         VARCHAR(50),                    -- Network name
    chain_id        BIGINT,                        -- Chain ID
    verified        TINYINT(1),                     -- Verification status
    verified_at     DATETIME,                      -- Last verification time
    verification_message VARCHAR(255),
    created_at      DATETIME,
    updated_at      DATETIME
);
```

## Tài liệu tham khảo

- [Smart Contract Deployment Guide](blockchain/smart-contracts/DEPLOY_GUIDE.md)
- [AgriTraceability ABI](blockchain/smart-contracts/abi/AgriTraceability.json)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [VeChainThor Developer Portal](https://developers.vechain.org/)
- [Hardhat Documentation](https://hardhat.org/docs)

## License

MIT License
