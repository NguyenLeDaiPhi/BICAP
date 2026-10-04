# BICAP - Blockchain Integration in Clean Agricultural Production

## Giới thiệu

BICAP là hệ thống tích hợp Blockchain trong sản xuất nông sản sạch, được xây dựng theo kiến trúc Microservices. Hệ thống cho phép ghi nhận và xác minh tính toàn vẹn dữ liệu truy xuất nguồn gốc nông sản trên blockchain.

## Kiến trúc đang chạy

Bộ chạy chính nằm trong [docker-compose.yml](docker-compose.yml) ở thư mục gốc: **Kong + 7 backend trong services/ + 5 web Next.js trong frontend/web/ + MySQL**. RabbitMQ phục vụ các luồng tích hợp hiện có; Kafka, Redis và MinIO được khởi tạo cùng hạ tầng.

```text
5 Web Next.js (frontend/web)
           |
           v
     Kong Gateway :8000
           |
           v
Auth | Farm Production | Trading Order | Shipping Manager
Admin | Blockchain Adapter | Image Storage
           |
           v
6 MySQL databases + RabbitMQ + Kafka + Redis + MinIO
```

## Trợ lý AI tìm sản phẩm

Guest và retailer có nút **Hỏi AI tìm sản phẩm**, dùng Ollama `qwen3:4b` đang chạy trên máy để hiểu nhu cầu tiếng Việt, số lượng và ngân sách. Kết quả lấy từ sản phẩm đã duyệt, còn hàng trong database. Xem [hướng dẫn AI](docs/SHOPPING_ASSISTANT.md) và [báo cáo kiểm tra toàn dự án ngày 04/10/2026](BICAP_FULL_AUDIT_2026-10-04.md).

## Cấu trúc thư mục

```text
BICAP/
├── docker-compose.yml           # Điểm chạy chính, project bicap
├── docker-compose.base.yml      # Network/volume dùng chung
├── docker-compose.infra.yml     # DB, broker, Redis, MinIO, Kong
├── docker-compose.services.yml  # 7 backend đang chạy
├── docker-compose.apps.yml      # 5 web đang chạy
├── services/                    # Mã backend của Compose chính
├── frontend/web/                # Next.js và npm workspace chính
├── api-gateway/kong.yml          # Route của Kong
├── database/                    # SQL khởi tạo và migration
├── blockchain/                  # Smart contract và hướng dẫn
├── mobile/                      # Mobile, chạy riêng
├── infrastructure/docker/       # Lối vào tương thích với Compose gốc
├── infrastructure/k8s/          # Manifest tham khảo, cần đồng bộ trước triển khai
├── backend/                     # Service tách riêng, chưa thuộc bộ chạy chính
└── clients/                     # Web/mobile cũ, ngoài npm workspace chính
```

Bản cấu hình SQL Server/Spring Cloud Gateway trước đây được lưu tại `infrastructure/docker/*.sqlserver.yml.example` để tham khảo; chưa được kiểm chứng với mã hiện tại. `infrastructure/docker/docker-compose.yml` nay dùng bộ Compose gốc. `services-only-compose.yml` giữ ý nghĩa chạy hạ tầng của file cũ.

RULE.MD mô tả kiến trúc mục tiêu SQL Server/Spring Cloud Gateway. Bộ chạy hiện tại dùng MySQL/Kong; nếu tiêu chí nghiệm thu bắt buộc kiến trúc mục tiêu, cần chuyển đổi riêng và kiểm thử tích hợp trước triển khai.

## Blockchain Service ⭐

**Trạng thái hiện tại:** adapter và trang truy xuất vẫn có dữ liệu mô phỏng; các khả năng dưới đây là mục tiêu, chưa phải bằng chứng giao dịch trên mạng blockchain thật. Xem báo cáo audit trước khi dùng để xác thực nguồn gốc.

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

### Các service của Compose chính

Port host là cổng truy cập từ máy. Frontend gọi API qua Kong ở port 8000.

| Service | Chức năng | Port host | Port container |
|---------|-----------|-----------|----------------|
| kong-gateway | API Gateway | 8000; quản trị 8001 | 8000 / 8001 |
| auth-service | Xác thực, JWT | 8088 | 8080 |
| farm-production-service | Trang trại, mùa vụ, sản phẩm | 8081 | 8081 |
| trading-order-service | Sàn giao dịch, đơn hàng, thanh toán | 8082 | 8082 |
| shipping-manager-service | Vận chuyển | 8083 | 8083 |
| blockchain-adapter-service | Adapter blockchain, hiện mô phỏng | 8084 | 8084 |
| admin-service | Quản trị | 8085 | 8085 |
| image-storage-service | Lưu trữ ảnh | 8086 | 8086 |

| Web / npm workspace | Port | Docker service |
|---------------------|------|----------------|
| retailer-web | 3000 | retailer-web |
| admin-web | 3001 | admin-web |
| farm-manager-web | 3002 | farm-management-web |
| shipping-manager-web | 3003 | shipping-manager-web |
| guest-web | 3010 | guest-web |

## Công nghệ

### Backend và gateway đang chạy

- Java 21, Spring Boot, Spring Security + JWT, Spring Data JPA.
- MySQL 8, RabbitMQ, Kafka, Redis, MinIO.
- Kong API Gateway.

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

### 1. Chạy toàn hệ thống bằng Docker Compose

Mở Docker Desktop với Linux containers và chờ Docker engine sẵn sàng. Chạy **từ thư mục gốc BICAP** với Docker Compose hỗ trợ `include`. Dockerfile tự build Java và Next.js nên host không cần Maven/npm để chạy bằng Docker.

```bash
docker info
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

Truy cập web theo bảng port ở trên; Kong http://localhost:8000, RabbitMQ http://localhost:15672 và MinIO Console http://localhost:9001.

Chạy từng nhóm qua `make up-infra`, `make up-services`, `make up-apps`. Các lệnh dùng Compose gốc để tìm đủ dependency; không chạy riêng `docker-compose.services.yml` hoặc `docker-compose.apps.yml`. `make up-dev` build và chạy toàn hệ thống, không yêu cầu file override.

Windows không có make có thể dùng các lệnh sau; không cần cài npm dependency trước:

```bash
npm run compose:check
npm run compose:up
npm run compose:status
npm run compose:logs
npm run compose:down
```

Lệnh cũ `cd infrastructure/docker` rồi `docker compose up -d --build` cũng dùng project `bicap` và cùng cấu hình. Các lỗi YAML/API/schema được ghi trong [báo cáo readiness](BICAP_RUN_READINESS_2026-10-03.md); thống nhất cách chạy chưa có nghĩa toàn bộ nghiệp vụ đã được kiểm chứng.

### 2. Phát triển web bằng npm workspace

Cần Node.js/npm phù hợp với Next.js của dự án. Từ thư mục gốc:

```bash
npm install
npm run dev:admin
# Hoặc: dev:farm, dev:retailer, dev:shipping, dev:guest
```

Các web dev chạy đúng port trong bảng. Khởi động backend bằng `make up-services` và hạ tầng bằng `make up-infra`; tránh chạy web Docker và web local trên cùng port. Với production local, chạy `npm run build:web` trước `npm run start:admin`, `start:farm`, `start:retailer`, `start:shipping`, `start:guest`.

Backend local cần Java 21 và Maven wrapper từng service; profile local sẽ được xử lý riêng trong mục lỗi YAML. Mã backend của Compose chính nằm trong `services/`.

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

## Farm Manager Web (frontend/web/farm-manager-web)

### Tính năng chính

- **Quản lý Mùa vụ**: Tạo, xem, cập nhật mùa vụ nông sản
- **Quản lý Sản phẩm**: Thêm, sửa, xóa sản phẩm nông sản
- **Quản lý Trang trại**: Xem thông tin trang trại
- **Dashboard**: Tổng quan về hoạt động trang trại

### API Endpoints sử dụng

| Module | Endpoint | Method | Mô tả |
|--------|----------|--------|-------|
| Mùa vụ | `/api/production-batches` | GET | Lấy danh sách mùa vụ |
| Mùa vụ | `/api/production-batches` | POST | Tạo mùa vụ mới |
| Sản phẩm | `/api/products` | GET | Lấy danh sách sản phẩm |
| Sản phẩm | `/api/products` | POST | Tạo sản phẩm mới |
| Sản phẩm | `/api/products/{id}` | PUT | Cập nhật sản phẩm |
| Sản phẩm | `/api/products/{id}` | DELETE | Xóa sản phẩm (soft delete) |

### Các file chính

```
frontend/web/farm-manager-web/src/
├── app/
│   ├── seasons/page.tsx      # Trang quản lý mùa vụ
│   ├── products/page.tsx     # Trang quản lý sản phẩm
│   ├── dashboard/page.tsx    # Dashboard chính
│   └── lib/api.ts            # API client functions
└── ...
```

### Các lỗi đã sửa (2026-09-07)

#### Backend Fixes (farm-production-service)

1. **ProductionBatch.java**
   - Thêm trường `name` (tên mùa vụ)
   - Thêm trường `area` (diện tích, đơn vị: ha)
   - Thêm trường `quantity` (sản lượng dự kiến, đơn vị: tấn)

2. **ProductionBatchController.java**
   - Thêm `GET /api/production-batches` - Lấy danh sách mùa vụ (không cần farmId)
   - Thêm `POST /api/production-batches` - Tạo mùa vụ (không cần farmId)
   - Thêm `GET /api/production-batches/{id}` - Lấy chi tiết mùa vụ
   - Thêm `PUT /api/production-batches/{id}` - Cập nhật mùa vụ
   - Thêm `DELETE /api/production-batches/{id}` - Xóa mùa vụ
   - Giữ nguyên `POST /api/production-batches/farm/{farmId}` - Tạo theo farm cụ thể
   - Giữ nguyên `GET /api/production-batches/{id}/detail` - Chi tiết đầy đủ

3. **ProductionBatchService.java**
   - Thêm `createBatchWithoutFarmId()` - Tạo mùa vụ không cần farmId
   - Tự động sinh `batchCode` với format `VU-{timestamp}` nếu rỗng
   - Tự động lấy farm mặc định nếu không có farmId
   - Thêm `getAllBatches()`, `getBatchById()`, `updateBatch()`, `deleteBatch()`

4. **CreateMarketplaceProductRequest.java**
   - `farmId` trở thành nullable (không bắt buộc)
   - `exportBatchId` trở thành nullable (cho phép thêm sản phẩm trực tiếp)

5. **MarketplaceProductServiceImpl.java**
   - Xử lý khi `exportBatchId` là null
   - Tự động gán farm mặc định nếu `farmId` null

6. **MarketplaceProductController.java**
   - Map đa đường dẫn: `@RequestMapping({"/api/marketplace-products", "/api/products"})`
   - Thêm `GET /` - Lấy tất cả sản phẩm
   - Thêm `GET /my` - Lấy sản phẩm theo farm
   - Thêm `GET /{id}` - Chi tiết sản phẩm
   - Thêm `PUT /{id}` - Cập nhật sản phẩm (sửa lỗi 404)
   - Thêm `DELETE /{id}` - Xóa sản phẩm khỏi database

#### API Gateway Fixes (kong.yml)

1. **product-service**
   - Đổi URL từ `http://product-service:8085` sang `http://farm-production-service:8081`
   - Route `/api/products` giờ trỏ tới farm-production-service

2. **production-batches-api route**
   - Thêm methods: `PUT`, `DELETE` để hỗ trợ CRUD đầy đủ

#### Frontend Fixes (farm-manager-web)

1. **Tạo `src/app/seasons/[id]/page.tsx`**
   - Trang chi tiết mùa vụ mới
   - Hiển thị thông tin: tên, loại sản phẩm, ngày, diện tích, sản lượng
   - Hiển thị trạng thái blockchain (TxHash)
   - Form thêm nhật ký canh tác
   - Danh sách lô xuất hàng & mã QR

2. **Cập nhật `src/app/seasons/page.tsx`**
   - Sửa `fetchSeasons()` - hỗ trợ response format mới
   - Sửa `handleSubmit()` - chuyển đổi payload chuẩn

3. **Cập nhật `src/app/products/page.tsx`**
   - Sửa `fetchProducts()` - hỗ trợ response format mới
   - Sửa `handleCreate()` - gửi payload chuẩn, không cần exportBatchId
   - Sửa `handleUpdate()` - gọi PUT /api/products/{id} đúng cách
   - Sửa `handleDelete()` - gọi DELETE /api/products/{id} thực sự xóa khỏi DB

4. **Cập nhật `src/lib/api.ts`**
   - Thêm `getSeasonDetail()`, `deleteSeason()`, `createProcess()` cho farmProductionApi
   - Hoàn thiện comments cho các API methods

### Các lỗi đã sửa (2026-09-08)

#### 1. HibernateProxy Serialization Error - FIXED ✅

**Vấn đề**: `SeasonDetailResponse` trả về trực tiếp Hibernate entity, gây lỗi serialization:
```
com.fasterxml.jackson.databind.exc.InvalidDefinitionException: No serializer found for class org.hibernate.proxy.HibernateProxy
```

**Nguyên nhân**: `@ManyToOne` relationship mặc định sử dụng `LAZY` loading, tạo ra proxy object thay vì actual entity.

**Cách sửa**:
```java
// ProductionBatch.java
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductionBatch { ... }

// Và cho relationship Farm
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "farm_id", nullable = false)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
private Farm farm;
```

```java
// Farm.java
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Farm { ... }
```

#### 2. Double Injection - FIXED ✅

**Vấn đề**: `MarketplaceProductServiceImpl` có cả `@Autowired` annotation và constructor injection.

**Cách sửa**: Xóa `@Autowired` annotation vì constructor injection đã đủ:
```java
// TRƯỚC
@Autowired
private final MarketplaceProductRepository repository;
public MarketplaceProductServiceImpl(...) { ... }

// SAU
private final MarketplaceProductRepository repository;
public MarketplaceProductServiceImpl(...) { ... }
```

#### 3. getAllBatches() Logic Bug - FIXED ✅

**Vấn đề**: `getAllBatches()` luôn chỉ lấy data của farm đầu tiên trong hệ thống. Nếu có nhiều farm manager, data sẽ bị lẫn.

**Cách sửa**: Trả về tất cả batches từ tất cả farms:
```java
// TRƯỚC
public List<ProductionBatch> getAllBatches() {
    Optional<Farm> defaultFarm = farmRepository.findAll().stream().findFirst();
    if (defaultFarm.isPresent()) {
        return batchRepository.findByFarmId(defaultFarm.get().getId());
    }
    return List.of();
}

// SAU
public List<ProductionBatch> getAllBatches() {
    return batchRepository.findAll();
}
```

**Lưu ý**: Cần triển khai user-context aware filtering (JWT token) để frontend chỉ thấy data của farm mình quản lý.

### JWT-Based Access Control (2026-09-08) - IMPLEMENTED ✅

**Mục tiêu**: Đảm bảo mỗi farm manager chỉ thấy và quản lý data của farm mình.

**File mới**: `SecurityUtils.java`
```java
// Lấy userId từ JWT token (đã được JwtAuthenticationFilter set vào request attribute)
Long userId = securityUtils.getCurrentUserId();

// Lấy farm của user hiện tại
Farm farm = securityUtils.getCurrentUserFarm();

// Kiểm tra role
boolean isAdmin = securityUtils.isAdmin();
boolean isFarmManager = securityUtils.isFarmManager();
```

**Các method đã được cập nhật**:

1. **getAllBatches()**
   - `ADMIN`: Xem tất cả batches từ mọi farm
   - `FARM_MANAGER`: Chỉ xem batches của farm mình

2. **getBatchById()**
   - Kiểm tra quyền truy cập trước khi trả về chi tiết

3. **createBatchWithoutFarmId()**
   - `FARM_MANAGER`: Tự động gán farm của mình
   - `ADMIN`: Có thể chỉ định farmId cụ thể

4. **updateBatch() / deleteBatch()**
   - Chỉ chủ sở hữu farm hoặc ADMIN mới được thực hiện

5. **getSeasonDetail()**
   - Kiểm tra quyền truy cập trước khi trả về chi tiết

**Lưu ý quan trọng**: Để hệ thống hoạt động chính xác:
1. JWT token phải chứa `userId` matching với `Farm.ownerId`
2. `Farm.ownerId` trong database phải khớp với `User.id` từ auth-service
3. **FARM_MANAGER phải tạo farm trước** (qua API `/api/farms`) trước khi tạo mùa vụ

## License

MIT License
