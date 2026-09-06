# Hướng Dẫn Deploy Smart Contract AgriTraceability

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
3. [Cách 1: Deploy bằng Hardhat](#cách-1-deploy-bằng-hardhat)
4. [Cách 2: Deploy bằng Truffle](#cách-2-deploy-bằng-truffle)
5. [Cách 3: Deploy bằng Remix IDE](#cách-3-deploy-bằng-remix-ide)
6. [Tích hợp với Backend](#tích-hợp-với-backend)
7. [Kiểm tra hoạt động](#kiểm-tra-hoạt-động)

---

## Tổng quan

### Mục đích
Smart Contract `AgriTraceability.sol` được thiết kế để:
- Ghi nhận thông tin lô sản xuất nông nghiệp lên blockchain
- Đảm bảo tính minh bạch và không thể sửa đổi dữ liệu
- Xác minh tính toàn vẹn dữ liệu một cách bảo mật

### Thông số kỹ thuật
| Thông số | Giá trị |
|----------|---------|
| Ngôn ngữ | Solidity ^0.8.20 |
| License | MIT |
| Mạng hỗ trợ | Ethereum, Binance Smart Chain, VeChainThor |
| Gas Estimation (recordBatch) | ~100,000 gas |
| Gas Estimation (verifyBatch) | ~50,000 gas |

### Cấu trúc dữ liệu

```solidity
struct BatchRecord {
    string  batchCode;      // Mã lô duy nhất
    bytes32 dataHash;       // Hash Keccak256 (64 ký tự hex)
    address farmAddress;     // Địa chỉ ví nông trại
    uint256 timestamp;      // Unix timestamp
    string  resourceType;   // Loại tài nguyên
    bool    isActive;       // Trạng thái
}
```

---

## Yêu cầu hệ thống

### Công cụ cần thiết

| Công cụ | Phiên bản | Mục đích |
|---------|-----------|----------|
| Node.js | >= 18.x | Runtime |
| npm/yarn | Latest | Package manager |
| Hardhat/Truffle | Latest | Development framework |

### Cài đặt Node.js

```bash
# Kiểm tra phiên bản Node.js
node --version  # Phải >= 18.x

# Nếu chưa có, cài đặt từ https://nodejs.org/
```

---

## Cách 1: Deploy bằng Hardhat (Khuyên dùng)

### Bước 1: Khởi tạo project Hardhat

```bash
# Tạo thư mục mới
mkdir blockchain-deployment
cd blockchain-deployment

# Khởi tạo npm project
npm init -y

# Cài đặt Hardhat và các dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Tạo file cấu hình Hardhat
npx hardhat init
```

### Bước 2: Copy Smart Contract

```bash
# Copy file contract vào thư mục contracts
cp ../BICAP/blockchain/smart-contracts/AgriTraceability.sol contracts/

# Copy file ABI (tùy chọn)
cp ../BICAP/blockchain/smart-contracts/abi/AgriTraceability.json abi/
```

### Bước 3: Tạo Script Deploy

Tạo file `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("🔄 Bắt đầu deploy AgriTraceability Contract...");

  // Lấy contract factory
  const AgriTraceability = await hre.ethers.getContractFactory("AgriTraceability");

  // Deploy contract
  console.log("⛓️  Đang deploy...");
  const contract = await AgriTraceability.deploy();

  // Đợi contract được mine
  await contract.waitForDeployment();

  // Lấy địa chỉ contract
  const contractAddress = await contract.getAddress();
  const owner = await contract.owner();

  console.log("✅ Deploy thành công!");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`👤 Owner: ${owner}`);
  console.log(`🔗 Explorer: https://sepolia.etherscan.io/address/${contractAddress}`);

  // Lưu thông tin deploy
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    owner: owner,
    timestamp: new Date().toISOString(),
    abiPath: "./abi/AgriTraceability.json"
  };

  console.log("\n📋 Thông tin deployment:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main().catch((error) => {
  console.error("❌ Deploy thất bại:", error);
  process.exit(1);
});
```

### Bước 4: Cấu hình Network

Tạo file `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // Local Hardhat Network
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    },
    // Binance Smart Chain Testnet
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 97
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  }
};
```

### Bước 5: Tạo file .env

```bash
# Tạo file .env
cat > .env << 'EOF'
# Testnet RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545

# Private Key (KHÔNG BAO GIỜ commit file này!)
PRIVATE_KEY=your_private_key_here

# Etherscan API Key (để verify contract)
ETHERSCAN_API_KEY=your_etherscan_api_key
EOF
```

### Bước 6: Deploy

```bash
# Deploy lên local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy lên Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Deploy lên BSC testnet
npx hardhat run scripts/deploy.js --network bscTestnet
```

### Bước 7: Verify Contract (tùy chọn)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

## Cách 2: Deploy bằng Truffle

### Bước 1: Cài đặt Truffle

```bash
npm install -g truffle

# Khởi tạo project
mkdir truffle-project && cd truffle-project
truffle init
```

### Bước 2: Cấu trúc thư mục

```
truffle-project/
├── contracts/
│   └── AgriTraceability.sol
├── migrations/
│   └── 1_initial_migration.js
│   └── 2_deploy_contracts.js
├── truffle-config.js
└── test/
```

### Bước 3: Tạo Migration Script

Tạo file `migrations/2_deploy_contracts.js`:

```javascript
const AgriTraceability = artifacts.require("AgriTraceability");

module.exports = function(deployer) {
  deployer.deploy(AgriTraceability);
};
```

### Bước 4: Cấu hình Truffle

Tạo file `truffle-config.js`:

```javascript
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,
        process.env.SEPOLIA_RPC_URL
      ),
      network_id: 11155111,
      confirmations: 2,
      timeoutBlocks: 200
    }
  },
  compilers: {
    solc: {
      version: "0.8.20"
    }
  }
};
```

### Bước 5: Deploy

```bash
# Compile contracts
truffle compile

# Deploy
truffle migrate --network sepolia
```

---

## Cách 3: Deploy bằng Remix IDE

### Bước 1: Truy cập Remix IDE

1. Mở trình duyệt, truy cập: https://remix.ethereum.org

### Bước 2: Tạo file contract

1. Click **File Explorers** (icon thư mục)
2. Click **Create New File**
3. Đặt tên: `AgriTraceability.sol`
4. Copy nội dung file `AgriTraceability.sol` và paste vào

### Bước 3: Compile

1. Click **Solidity Compiler** (icon bên trái)
2. Chọn compiler version: **0.8.20**
3. Click **Compile AgriTraceability.sol**

### Bước 4: Deploy

1. Click **Deploy & Run Transactions** (icon play)
2. Chọn **Injected Provider** (MetaMask)
3. Click **Deploy**
4. Xác nhận giao dịch trong MetaMask

### Bước 5: Lưu Contract Address

Sau khi deploy thành công, copy **Contract Address** để sử dụng trong backend.

---

## Tích hợp với Backend

### Cập nhật Application Configuration

Sau khi deploy, cập nhật file `application.yml`:

```yaml
# VeChainThor / Ethereum Config
vechainthor:
  node:
    url: https://mainnet.veblocks.net  # Hoặc RPC của mạng bạn deploy
    api:
      key: ${BLOCKCHAIN_API_KEY:}

# Smart Contract Configuration
blockchain:
  contract:
    address: "0xYourContractAddressHere"  # ← Thay bằng địa chỉ contract
    abi-path: "classpath:contracts/AgriTraceability.json"
```

### Lấy Contract Address

Sau khi deploy, bạn sẽ nhận được contract address. Cập nhật vào config:

```bash
# Ví dụ contract address
export CONTRACT_ADDRESS="0x1234567890abcdef1234567890abcdef12345678"
```

### Tương tác với Contract

#### Ghi nhận Batch (recordBatch)

```javascript
// Ví dụ Web3.js
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

// Ghi nhận lô mới
await contract.methods.recordBatch(
  "BATCH-001",                    // batchCode
  dataHash,                        // bytes32 hash
  "0xFarmWalletAddress",          // farm address
  "PRODUCTION"                     // resource type
).send({ from: walletAddress });
```

#### Xác minh Batch (verifyBatch)

```javascript
// Xác minh dữ liệu
const [isValid, storedHash] = await contract.methods.verifyBatch(
  batchId,       // uint256
  dataToVerify   // bytes32
).call();

console.log(`Valid: ${isValid}`);
console.log(`Stored Hash: ${storedHash}`);
```

---

## Kiểm tra hoạt động

### Test Cases

```javascript
const chai = require("chai");
const { expect } = chai;

describe("AgriTraceability", function() {
  let contract;
  let owner;
  let farmAddress;

  beforeEach(async function() {
    const AgriTraceability = await ethers.getContractFactory("AgriTraceability");
    contract = await AgriTraceability.deploy();
    [owner, farmAddress] = await ethers.getSigners();
  });

  it("should record a new batch", async function() {
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test data"));
    
    const tx = await contract.recordBatch(
      "BATCH-001",
      dataHash,
      farmAddress.address,
      "PRODUCTION"
    );
    
    const receipt = await tx.wait();
    const batchId = receipt.events[0].args.batchId;
    
    expect(batchId).to.equal(1);
  });

  it("should verify valid data", async function() {
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test data"));
    
    await contract.recordBatch(
      "BATCH-001",
      dataHash,
      farmAddress.address,
      "PRODUCTION"
    );
    
    const [isValid, storedHash] = await contract.verifyBatch(1, dataHash);
    
    expect(isValid).to.be.true;
    expect(storedHash).to.equal(dataHash);
  });

  it("should reject modified data", async function() {
    const originalHash = ethers.keccak256(ethers.toUtf8Bytes("original"));
    const modifiedHash = ethers.keccak256(ethers.toUtf8Bytes("modified"));
    
    await contract.recordBatch(
      "BATCH-001",
      originalHash,
      farmAddress.address,
      "PRODUCTION"
    );
    
    const [isValid] = await contract.verifyBatch(1, modifiedHash);
    
    expect(isValid).to.be.false;
  });
});
```

### Chạy Tests

```bash
npx hardhat test
```

---

## Troubleshooting

### Lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `nonce too low` | Transaction đang chờ xử lý | Reset MetaMask hoặc đợi transaction trước hoàn tất |
| `insufficient funds` | Không đủ ETH/BNB | Nạp thêm tiền vào ví testnet |
| `gas required exceeds allowance` | Contract quá phức tạp | Tối ưu contract hoặc tăng gas limit |
| `compilation error` | Syntax error | Kiểm tra lại code Solidity |

### Kiểm tra trên Etherscan

```bash
# Xem contract trên Etherscan
open https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

# Kiểm tra transactions
open https://sepolia.etherscan.io/tx/YOUR_TX_HASH
```

---

## Liên hệ & Hỗ trợ

Nếu gặp vấn đề trong quá trình deploy, vui lòng:
1. Kiểm tra logs trong terminal
2. Tham khảo tài liệu Hardhat/Truffle
3. Liên hệ đội ngũ phát triển BICAP

---

*Document version: 1.0*
*Last updated: 2026-09-06*
*Author: BICAP Development Team*
