package com.bicap.blockchain_adapter_service.service;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;

/**
 * BlockchainClient - Adapter mô phỏng tương tác với Blockchain (VeChainThor/Ethereum)
 * 
 * Component này cung cấp các phương thức để:
 * - Tạo Transaction Hash chuẩn Keccak256 (định dạng: 0x[64 ký tự hex])
 * - Sinh Block Number, Gas Used, Contract Address mô phỏng thực tế
 * - Xác minh hash dữ liệu bằng Keccak256
 * 
 * @author BICAP Team
 * @since 2026-09-06
 */
@Component
public class BlockchainClient {

    // =============================================
    // CONSTANTS
    // =============================================
    
    /** Độ dài chuẩn của Keccak256 hash (64 ký tự hex = 32 bytes) */
    private static final int KECCAK256_HASH_LENGTH = 64;
    
    /** Tiền tố chuẩn cho transaction hash */
    private static final String TX_HASH_PREFIX = "0x";
    
    /** Network identifier cho VeChainThor */
    private static final String NETWORK_ID = "VeChainThor";
    
    /** Chain ID của VeChainThor Mainnet */
    private static final long MAINNET_CHAIN_ID = 100;
    
    /** Chain ID của VeChainThor Testnet */
    private static final long TESTNET_CHAIN_ID = 1001;

    // =============================================
    // INSTANCE VARIABLES
    // =============================================
    
    private final SecureRandom secureRandom;
    
    // =============================================
    // CONSTRUCTOR
    // =============================================
    
    public BlockchainClient() {
        this.secureRandom = new SecureRandom();
    }

    // =============================================
    // CORE METHODS
    // =============================================

    /**
     * Ghi hash dữ liệu lên blockchain và trả về Transaction Hash chuẩn
     * 
     * @param dataHash Hash SHA-256 của dữ liệu gốc (64 ký tự hex)
     * @return Transaction Hash chuẩn Keccak256 (0x[64 ký tự hex])
     * 
     * @throws IllegalArgumentException nếu dataHash null hoặc rỗng
     * @throws RuntimeException nếu có lỗi khi tạo hash
     * 
     * @example
     * String txHash = writeHash("da242c242bba0f863542d4dd0e375e31ab7e86e14cc23a959f4172777a824a3c");
     * // Output: "0x8f4e2b1c3d5a7e9f2c4b6d8a1e3f5c7b9d2a4f6e8c1b3d5e7f9a2c4b6d8e1f3a5c7"
     */
    public String writeHash(String dataHash) {
        // Validation đầu vào
        if (dataHash == null || dataHash.isBlank()) {
            throw new IllegalArgumentException("dataHash must not be null or empty");
        }
        
        // Clean hash (loại bỏ tiền tố 0x nếu có)
        String cleanHash = cleanHash(dataHash);
        
        // Validate định dạng hex
        if (!isValidHex(cleanHash)) {
            throw new IllegalArgumentException("dataHash must be a valid 64-character hex string");
        }
        
        // Tạo transaction hash chuẩn Keccak256
        String txHash = generateKeccak256TransactionHash(cleanHash);
        
        return txHash;
    }

    /**
     * Xác minh hash dữ liệu trên blockchain
     * 
     * @param storedHash Hash đã lưu trên blockchain
     * @return true nếu hash hợp lệ (trong mô phỏng, luôn trả về true)
     * 
     * @deprecated Sử dụng {@link #verifyHashWithOriginalData(String, String)} để xác minh
     *             hash với dữ liệu gốc thực sự
     */
    @Deprecated
    public boolean verifyHash(String storedHash) {
        if (storedHash == null || storedHash.isBlank()) {
            return false;
        }
        
        // Mô phỏng: hash hợp lệ nếu có định dạng đúng
        String cleanHash = cleanHash(storedHash);
        return cleanHash.length() == KECCAK256_HASH_LENGTH && isValidHex(cleanHash);
    }

    /**
     * Xác minh hash dữ liệu bằng cách so khớp với dữ liệu gốc
     * 
     * Đây là phương pháp xác minh CHÍNH XÁC, so sánh trực tiếp:
     * - Tính hash SHA-256 từ dữ liệu gốc
     * - So sánh với hash đã lưu trên blockchain
     * - Trả về false nếu dữ liệu bị sửa đổi
     * 
     * @param storedHash Hash đã lưu trên blockchain
     * @param originalData Dữ liệu gốc để xác minh
     * @return true nếu dữ liệu khớp với hash, false nếu dữ liệu bị sửa
     * 
     * @throws IllegalArgumentException nếu storedHash hoặc originalData null
     * 
     * @example
     * // Dữ liệu đúng - trả về true
     * boolean valid1 = verifyHashWithOriginalData(
     *     "da242c242bba0f863542d4dd0e375e31ab7e86e14cc23a959f4172777a824a3c",
     *     "{\"batchId\":1,\"farmName\":\"ABC Farm\",\"product\":\"Rice\"}"
     * );
     * 
     * // Dữ liệu bị sửa - trả về false
     * boolean valid2 = verifyHashWithOriginalData(
     *     "da242c242bba0f863542d4dd0e375e31ab7e86e14cc23a959f4172777a824a3c",
     *     "{\"batchId\":1,\"farmName\":\"XYZ Farm\",\"product\":\"Rice\"}"  // Tên khác!
     * );
     */
    public boolean verifyHashWithOriginalData(String storedHash, String originalData) {
        // Validation
        if (storedHash == null || storedHash.isBlank()) {
            throw new IllegalArgumentException("storedHash must not be null or empty");
        }
        if (originalData == null) {
            throw new IllegalArgumentException("originalData must not be null");
        }
        
        // Clean hash
        String cleanStoredHash = cleanHash(storedHash);
        
        // Tính hash SHA-256 từ dữ liệu gốc
        String computedHash = calculateSHA256(originalData);
        
        // So sánh hash (case-insensitive vì hex có thể viết hoa/thường)
        boolean isValid = cleanStoredHash.equalsIgnoreCase(computedHash);
        
        return isValid;
    }

    // =============================================
    // BLOCK INFORMATION METHODS
    // =============================================

    /**
     * Lấy Block Number hiện tại (mô phỏng)
     * 
     * @return Block number hiện tại của blockchain
     */
    public long getCurrentBlockNumber() {
        // Mô phỏng: block number tăng theo thời gian
        long baseBlock = 150_000_000L; // Block khởi đầu mô phỏng
        long secondsSinceEpoch = Instant.now().getEpochSecond();
        long estimatedBlock = baseBlock + (secondsSinceEpoch / 10); // ~10s/block
        
        return estimatedBlock;
    }

    /**
     * Tạo Block Hash chuẩn
     * 
     * @param blockNumber Số block
     * @return Block hash (0x[64 ký tự hex])
     */
    public String generateBlockHash(long blockNumber) {
        String input = NETWORK_ID + ":" + blockNumber + ":" + Instant.now().toEpochMilli();
        return TX_HASH_PREFIX + calculateKeccak256Hex(input);
    }

    /**
     * Tạo Gas Used ngẫu nhiên mô phỏng thực tế
     * 
     * Gas used thực tế phụ thuộc vào độ phức tạp của transaction
     * - recordBatch: ~100,000 - 150,000 gas
     * - verifyBatch: ~50,000 - 80,000 gas
     * 
     * @param isWriteOperation True nếu là write operation
     * @return Gas used (long)
     */
    public long generateGasUsed(boolean isWriteOperation) {
        if (isWriteOperation) {
            // recordBatch: 100,000 - 150,000 gas
            return 100_000L + (long)(secureRandom.nextDouble() * 50_000);
        } else {
            // verifyBatch: 50,000 - 80,000 gas
            return 50_000L + (long)(secureRandom.nextDouble() * 30_000);
        }
    }

    /**
     * Sinh Contract Address mô phỏng
     * 
     * Contract address được sinh từ deployer address + nonce
     * Format: 0x[40 ký tự hex] (20 bytes - địa chỉ Ethereum)
     * 
     * @return Contract address
     */
    public String generateContractAddress() {
        // Tạo địa chỉ contract ngẫu nhiên (mô phỏng)
        byte[] addressBytes = new byte[20];
        secureRandom.nextBytes(addressBytes);
        
        // Đảm bảo byte cuối không phải 0 để tránh address có nhiều số 0
        addressBytes[19] = (byte) (secureRandom.nextInt(255) + 1);
        
        return TX_HASH_PREFIX + HexFormat.of().formatHex(addressBytes);
    }

    /**
     * Tạo Transaction Receipt mô phỏng đầy đủ
     * 
     * @param dataHash Hash dữ liệu
     * @param isWriteOperation Write operation hay read operation
     * @return Transaction receipt info
     */
    public TransactionReceipt generateTransactionReceipt(String dataHash, boolean isWriteOperation) {
        long blockNumber = getCurrentBlockNumber();
        String txHash = writeHash(dataHash);
        String blockHash = generateBlockHash(blockNumber);
        long gasUsed = generateGasUsed(isWriteOperation);
        
        // Transaction index trong block
        int txIndex = secureRandom.nextInt(100);
        
        return new TransactionReceipt(
            txHash,
            blockNumber,
            blockHash,
            gasUsed,
            txIndex,
            true,  // status: success
            NETWORK_ID,
            Instant.now().toEpochMilli()
        );
    }

    // =============================================
    // UTILITY METHODS
    // =============================================

    /**
     * Tính SHA-256 hash của dữ liệu
     * 
     * @param data Dữ liệu cần hash
     * @return Hash dạng hex (64 ký tự, không có 0x)
     */
    public String calculateSHA256(String data) {
        if (data == null) {
            throw new IllegalArgumentException("data must not be null");
        }
        
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    /**
     * Tính Keccak256 hash (định dạng Ethereum)
     * 
     * Lưu ý: Java không có Keccak256 native, sử dụng SHA-3 với
     * output length tương đương. Trong thực tế, cần dùng
     * thư viện Web3j hoặc web3j-java.
     * 
     * @param input Dữ liệu đầu vào
     * @return Hash dạng hex (64 ký tự, không có 0x)
     */
    public String calculateKeccak256Hex(String input) {
        if (input == null) {
            throw new IllegalArgumentException("input must not be null");
        }
        
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA3-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            // Fallback: sử dụng SHA-256 nếu SHA3-256 không có
            return calculateSHA256(input);
        }
    }

    /**
     * Kiểm tra hash có đúng định dạng hex không
     * 
     * @param hex Chuỗi hex cần kiểm tra
     * @return true nếu hợp lệ
     */
    public boolean isValidHex(String hex) {
        if (hex == null) {
            return false;
        }
        return hex.matches("^[0-9a-fA-F]+$");
    }

    // =============================================
    // PRIVATE HELPER METHODS
    // =============================================

    /**
     * Làm sạch hash (loại bỏ tiền tố 0x, khoảng trắng)
     * 
     * @param hash Hash cần làm sạch
     * @return Hash đã được làm sạch
     */
    private String cleanHash(String hash) {
        if (hash == null) {
            return "";
        }
        
        String cleaned = hash.trim();
        
        // Loại bỏ tiền tố 0x
        if (cleaned.startsWith("0x") || cleaned.startsWith("0X")) {
            cleaned = cleaned.substring(2);
        }
        
        return cleaned.toLowerCase();
    }

    /**
     * Tạo Keccak256 Transaction Hash chuẩn
     * 
     * Transaction hash trong Ethereum/VeChainThor được tính bằng:
     * Keccak256(rlp_encode(transaction))
     * 
     * Trong mô phỏng này, chúng ta tạo hash từ:
     * - Network ID
     * - Data hash (đã hash trước đó)
     * - Timestamp
     * - Random nonce
     * 
     * @param dataHash Hash dữ liệu gốc (64 ký tự hex)
     * @return Transaction hash chuẩn (0x[64 ký tự hex])
     */
    private String generateKeccak256TransactionHash(String dataHash) {
        // Tạo input cho hash
        String timestamp = String.valueOf(Instant.now().toEpochMilli());
        int nonce = secureRandom.nextInt(Integer.MAX_VALUE);
        
        // Kết hợp các thành phần
        String input = NETWORK_ID + ":" + dataHash + ":" + timestamp + ":" + nonce;
        
        // Tính Keccak256
        String txHash = calculateKeccak256Hex(input);
        
        // Đảm bảo độ dài đúng (64 ký tự hex)
        if (txHash.length() > KECCAK256_HASH_LENGTH) {
            txHash = txHash.substring(0, KECCAK256_HASH_LENGTH);
        } else if (txHash.length() < KECCAK256_HASH_LENGTH) {
            // Padding nếu cần
            txHash = String.format("%64s", txHash).replace(' ', '0');
        }
        
        return TX_HASH_PREFIX + txHash;
    }

    // =============================================
    // INNER CLASSES
    // =============================================

    /**
     * Transaction Receipt - Lưu trữ thông tin giao dịch blockchain
     */
    public static class TransactionReceipt {
        private final String txHash;
        private final long blockNumber;
        private final String blockHash;
        private final long gasUsed;
        private final int transactionIndex;
        private final boolean status;
        private final String network;
        private final long timestamp;

        public TransactionReceipt(String txHash, long blockNumber, String blockHash,
                                 long gasUsed, int transactionIndex, boolean status,
                                 String network, long timestamp) {
            this.txHash = txHash;
            this.blockNumber = blockNumber;
            this.blockHash = blockHash;
            this.gasUsed = gasUsed;
            this.transactionIndex = transactionIndex;
            this.status = status;
            this.network = network;
            this.timestamp = timestamp;
        }

        // Getters
        public String getTxHash() { return txHash; }
        public long getBlockNumber() { return blockNumber; }
        public String getBlockHash() { return blockHash; }
        public long getGasUsed() { return gasUsed; }
        public int getTransactionIndex() { return transactionIndex; }
        public boolean isStatus() { return status; }
        public String getNetwork() { return network; }
        public long getTimestamp() { return timestamp; }

        @Override
        public String toString() {
            return "TransactionReceipt{" +
                    "txHash='" + txHash + '\'' +
                    ", blockNumber=" + blockNumber +
                    ", blockHash='" + blockHash + '\'' +
                    ", gasUsed=" + gasUsed +
                    ", transactionIndex=" + transactionIndex +
                    ", status=" + status +
                    ", network='" + network + '\'' +
                    ", timestamp=" + timestamp +
                    '}';
        }
    }
}
