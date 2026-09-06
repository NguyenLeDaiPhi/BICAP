package com.bicap.blockchain_adapter_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * Entity lưu trữ thông tin giao dịch blockchain
 * 
 * Mỗi bản ghi đại diện cho một transaction được ghi lên blockchain,
 * chứa đầy đủ thông tin về hash, block, gas, và dữ liệu gốc.
 * 
 * @author BICAP Team
 * @since 2026-09-06
 */
@Entity
@Table(name = "blockchain_records")
public class BlockchainRecord {

    // =============================================
    // PRIMARY KEY
    // =============================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =============================================
    // CORE IDENTIFIERS
    // =============================================

    /** Mã lô sản xuất liên kết với record này */
    @Column(name = "batch_id", nullable = false)
    private Long batchId;

    /** Mã lô sản xuất (nếu có) */
    @Column(name = "batch_code", length = 100)
    private String batchCode;

    /** Mã loại tài nguyên (PRODUCTION, ENVIRONMENT, SHIPPING, etc.) */
    @Column(name = "resource_type", length = 50)
    private String resourceType;

    // =============================================
    // HASH DATA
    // =============================================

    /**
     * Hash SHA-256 của dữ liệu gốc
     * - Độ dài: 64 ký tự hex
     * - Định dạng: [64 ký tự hex] (không có 0x)
     * 
     * @example "da242c242bba0f863542d4dd0e375e31ab7e86e14cc23a959f4172777a824a3c"
     */
    @Column(name = "data_hash", nullable = false, length = 64)
    private String dataHash;

    /**
     * Dữ liệu gốc được hash (lưu để phục vụ verify)
     * - Có thể là JSON string chứa thông tin lô sản xuất
     * - Được sử dụng để tính lại hash và so sánh
     * 
     * @example "{\"batchId\":1,\"farmName\":\"ABC Farm\",\"product\":\"Rice\",\"weight\":1000}"
     */
    @Lob
    @Column(name = "raw_data", columnDefinition = "TEXT")
    private String rawData;

    // =============================================
    // TRANSACTION INFO
    // =============================================

    /**
     * Transaction Hash - Định danh duy nhất của giao dịch trên blockchain
     * - Định dạng chuẩn: 0x[64 ký tự hex] (Keccak256)
     * - Độ dài: 66 ký tự (bao gồm 0x prefix)
     * 
     * @example "0x8f4e2b1c3d5a7e9f2c4b6d8a1e3f5c7b9d2a4f6e8c1b3d5e7f9a2c4b6d8e1f3a5c7"
     */
    @Column(name = "blockchain_tx", nullable = false, length = 66)
    private String blockchainTx;

    // =============================================
    // BLOCK INFO
    // =============================================

    /**
     * Số block chứa transaction này
     * - Trên VeChainThor: ~10 giây/block
     * - Trên Ethereum: ~12 giây/block
     * 
     * @example 150000001
     */
    @Column(name = "block_number")
    private Long blockNumber;

    /**
     * Block Hash - Hash của toàn bộ block chứa transaction
     * - Định dạng: 0x[64 ký tự hex]
     * 
     * @example "0xabc123def456..."
     */
    @Column(name = "block_hash", length = 66)
    private String blockHash;

    /**
     * Gas Used - Lượng gas tiêu tốn cho transaction
     * - recordBatch: ~100,000 - 150,000 gas
     * - verifyBatch: ~50,000 - 80,000 gas
     * 
     * @example 125000
     */
    @Column(name = "gas_used")
    private Long gasUsed;

    /**
     * Transaction Index - Vị trí transaction trong block
     * 
     * @example 0
     */
    @Column(name = "tx_index")
    private Integer transactionIndex;

    /**
     * Contract Address - Địa chỉ smart contract đã deploy
     * - Địa chỉ Ethereum: 20 bytes = 40 ký tự hex
     * - Địa chạng: 0x[40 ký tự hex]
     * 
     * @example "0x1234567890123456789012345678901234567890"
     */
    @Column(name = "contract_address", length = 42)
    private String contractAddress;

    // =============================================
    // NETWORK INFO
    // =============================================

    /**
     * Tên mạng blockchain
     * - "VeChainThor"
     * - "Ethereum"
     * - "BSC"
     */
    @Column(name = "network", length = 50)
    private String network;

    /**
     * Chain ID của mạng
     * - VeChainThor Mainnet: 100
     * - VeChainThor Testnet: 1001
     * - Ethereum Mainnet: 1
     * - Ethereum Sepolia: 11155111
     */
    @Column(name = "chain_id")
    private Long chainId;

    // =============================================
    // VERIFICATION STATUS
    // =============================================

    /**
     * Trạng thái xác minh
     * - null: Chưa xác minh
     * - true: Đã xác minh thành công
     * - false: Xác minh thất bại (dữ liệu bị sửa)
     */
    @Column(name = "verified")
    private Boolean verified;

    /**
     * Thời gian xác minh gần nhất
     */
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    /**
     * Thông báo kết quả xác minh
     */
    @Column(name = "verification_message", length = 255)
    private String verificationMessage;

    // =============================================
    // TIMESTAMPS
    // =============================================

    /** Thời gian tạo bản ghi */
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Thời gian cập nhật gần nhất */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // =============================================
    // LIFECYCLE CALLBACKS
    // =============================================

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Set defaults nếu chưa có
        if (network == null) {
            network = "VeChainThor";
        }
        if (chainId == null) {
            chainId = 100L;
        }
    }

    // =============================================
    // CONSTRUCTORS
    // =============================================

    /** Constructor mặc định cho JPA */
    public BlockchainRecord() {
    }

    /**
     * Constructor với các thông số cơ bản
     */
    public BlockchainRecord(Long batchId, String dataHash, String blockchainTx, String network) {
        this.batchId = batchId;
        this.dataHash = dataHash;
        this.blockchainTx = blockchainTx;
        this.network = network;
    }

    // =============================================
    // GETTERS & SETTERS
    // =============================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public String getBatchCode() {
        return batchCode;
    }

    public void setBatchCode(String batchCode) {
        this.batchCode = batchCode;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getDataHash() {
        return dataHash;
    }

    public void setDataHash(String dataHash) {
        this.dataHash = dataHash;
    }

    public String getRawData() {
        return rawData;
    }

    public void setRawData(String rawData) {
        this.rawData = rawData;
    }

    public String getBlockchainTx() {
        return blockchainTx;
    }

    public void setBlockchainTx(String blockchainTx) {
        this.blockchainTx = blockchainTx;
    }

    public Long getBlockNumber() {
        return blockNumber;
    }

    public void setBlockNumber(Long blockNumber) {
        this.blockNumber = blockNumber;
    }

    public String getBlockHash() {
        return blockHash;
    }

    public void setBlockHash(String blockHash) {
        this.blockHash = blockHash;
    }

    public Long getGasUsed() {
        return gasUsed;
    }

    public void setGasUsed(Long gasUsed) {
        this.gasUsed = gasUsed;
    }

    public Integer getTransactionIndex() {
        return transactionIndex;
    }

    public void setTransactionIndex(Integer transactionIndex) {
        this.transactionIndex = transactionIndex;
    }

    public String getContractAddress() {
        return contractAddress;
    }

    public void setContractAddress(String contractAddress) {
        this.contractAddress = contractAddress;
    }

    public String getNetwork() {
        return network;
    }

    public void setNetwork(String network) {
        this.network = network;
    }

    public Long getChainId() {
        return chainId;
    }

    public void setChainId(Long chainId) {
        this.chainId = chainId;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getVerificationMessage() {
        return verificationMessage;
    }

    public void setVerificationMessage(String verificationMessage) {
        this.verificationMessage = verificationMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // =============================================
    // HELPER METHODS
    // =============================================

    /**
     * Kiểm tra xem record có phải là write operation không
     */
    public boolean isWriteOperation() {
        return gasUsed != null && gasUsed > 80_000;
    }

    /**
     * Lấy định dạng chuẩn của transaction hash (có prefix 0x)
     */
    public String getFormattedTxHash() {
        if (blockchainTx == null) {
            return null;
        }
        if (blockchainTx.startsWith("0x") || blockchainTx.startsWith("0X")) {
            return blockchainTx;
        }
        return "0x" + blockchainTx;
    }

    /**
     * Lấy địa chỉ explorer URL để xem transaction
     */
    public String getExplorerUrl() {
        if (blockchainTx == null || network == null) {
            return null;
        }
        
        String explorerBase;
        if ("VeChainThor".equals(network)) {
            explorerBase = "https://explore.vechain.org/transactions/";
        } else if ("Ethereum".equals(network)) {
            explorerBase = "https://etherscan.io/tx/";
        } else {
            explorerBase = "https://bscscan.com/tx/";
        }
        
        return explorerBase + getFormattedTxHash();
    }

    @Override
    public String toString() {
        return "BlockchainRecord{" +
                "id=" + id +
                ", batchId=" + batchId +
                ", batchCode='" + batchCode + '\'' +
                ", dataHash='" + dataHash + '\'' +
                ", blockchainTx='" + blockchainTx + '\'' +
                ", blockNumber=" + blockNumber +
                ", network='" + network + '\'' +
                ", verified=" + verified +
                ", createdAt=" + createdAt +
                '}';
    }
}
