package com.bicap.blockchain_adapter_service;

import com.bicap.blockchain_adapter_service.service.BlockchainClient;
import com.bicap.blockchain_adapter_service.service.BlockchainService;
import com.bicap.blockchain_adapter_service.dto.VerifyBlockchainResponse;
import com.bicap.blockchain_adapter_service.repository.BlockchainRecordRepository;
import com.bicap.blockchain_adapter_service.repository.TraceLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test class cho Blockchain Client và Service
 * 
 * Các test cases:
 * 1. Tạo Keccak256 transaction hash chuẩn (66 ký tự)
 * 2. Xác minh hash với dữ liệu gốc (data unchanged)
 * 3. Phát hiện dữ liệu bị sửa đổi
 * 4. Sinh block info mô phỏng thực tế
 * 
 * @author BICAP Team
 * @since 2026-09-06
 */
@ExtendWith(MockitoExtension.class)
class BlockchainClientTest {

    // =============================================
    // TEST DATA
    // =============================================
    
    private static final String VALID_DATA_HASH = "da242c242bba0f863542d4dd0e375e31ab7e86e14cc23a959f4172777a824a3c";
    private static final String VALID_TX_HASH = "0x8f4e2b1c3d5a7e9f2c4b6d8a1e3f5c7b9d2a4f6e8c1b3d5e7f9a2c4b6d8e1f3a5c7";
    private static final String RAW_DATA_ORIGINAL = "{\"batchId\":1,\"farmName\":\"ABC Farm\",\"product\":\"Rice\",\"weight\":1000}";
    private static final String RAW_DATA_MODIFIED = "{\"batchId\":1,\"farmName\":\"XYZ Farm\",\"product\":\"Rice\",\"weight\":1000}";

    private BlockchainClient blockchainClient;

    // =============================================
    // SETUP
    // =============================================
    
    @BeforeEach
    void setUp() {
        blockchainClient = new BlockchainClient();
    }

    // =============================================
    // TRANSACTION HASH TESTS
    // =============================================
    
    @Test
    @DisplayName("writeHash - Tạo Keccak256 tx hash chuẩn 66 ký tự")
    void writeHash_ShouldReturnValidKeccak256Hash() {
        // Given
        String dataHash = VALID_DATA_HASH;
        
        // When
        String txHash = blockchainClient.writeHash(dataHash);
        
        // Then
        assertNotNull(txHash, "Transaction hash should not be null");
        assertTrue(txHash.startsWith("0x"), "Hash should start with 0x");
        assertEquals(66, txHash.length(), "Keccak256 hash should be 66 characters (0x + 64 hex)");
        assertTrue(txHash.matches("^0x[0-9a-f]{64}$"), "Hash should be valid hex format");
        
        System.out.println("✅ Generated Keccak256 Transaction Hash: " + txHash);
    }

    @Test
    @DisplayName("writeHash - Hash với prefix 0x")
    void writeHash_With0xPrefix_ShouldWork() {
        // Given
        String dataHash = "0x" + VALID_DATA_HASH;
        
        // When
        String txHash = blockchainClient.writeHash(dataHash);
        
        // Then
        assertNotNull(txHash);
        assertTrue(txHash.startsWith("0x"));
        assertEquals(66, txHash.length());
        
        System.out.println("✅ Hash with 0x prefix processed: " + txHash);
    }

    @Test
    @DisplayName("writeHash - Ném exception cho hash rỗng")
    void writeHash_WithEmptyHash_ShouldThrowException() {
        // Given
        String dataHash = "";
        
        // When/Then
        assertThrows(IllegalArgumentException.class, () -> {
            blockchainClient.writeHash(dataHash);
        });
        
        System.out.println("✅ Empty hash correctly rejected");
    }

    @Test
    @DisplayName("writeHash - Ném exception cho hash null")
    void writeHash_WithNullHash_ShouldThrowException() {
        // When/Then
        assertThrows(IllegalArgumentException.class, () -> {
            blockchainClient.writeHash(null);
        });
        
        System.out.println("✅ Null hash correctly rejected");
    }

    // =============================================
    // VERIFICATION TESTS
    // =============================================
    
    @Test
    @DisplayName("verifyHashWithOriginalData - Dữ liệu đúng, hash khớp")
    void verifyHashWithOriginalData_DataUnchanged_ShouldReturnTrue() {
        // Given
        // Sử dụng raw data và tính hash từ nó
        String rawData = "{\"batchId\":1,\"farmName\":\"ABC Farm\",\"product\":\"Rice\"}";
        String storedHash = blockchainClient.calculateSHA256(rawData);
        
        // When
        boolean isValid = blockchainClient.verifyHashWithOriginalData(storedHash, rawData);
        
        // Then
        assertTrue(isValid, "Hash should match when data is unchanged");
        
        System.out.println("✅ Data unchanged - Verification passed");
        System.out.println("   Stored Hash: " + storedHash);
    }

    @Test
    @DisplayName("verifyHashWithOriginalData - Dữ liệu bị sửa, hash không khớp")
    void verifyHashWithOriginalData_DataModified_ShouldReturnFalse() {
        // Given
        String originalData = "{\"batchId\":1,\"farmName\":\"ABC Farm\",\"product\":\"Rice\"}";
        String modifiedData = "{\"batchId\":1,\"farmName\":\"XYZ Farm\",\"product\":\"Rice\"}";
        String storedHash = blockchainClient.calculateSHA256(originalData);
        
        // When
        boolean isValid = blockchainClient.verifyHashWithOriginalData(storedHash, modifiedData);
        
        // Then
        assertFalse(isValid, "Hash should NOT match when data is modified");
        
        System.out.println("❌ Data modified - Verification failed");
        System.out.println("   Original Hash: " + storedHash);
        System.out.println("   Computed Hash: " + blockchainClient.calculateSHA256(modifiedData));
    }

    @Test
    @DisplayName("verifyHashWithOriginalData - Case insensitive comparison")
    void verifyHashWithOriginalData_DifferentCase_ShouldWork() {
        // Given
        String rawData = "{\"test\":\"value\"}";
        String storedHash = blockchainClient.calculateSHA256(rawData);
        String upperCaseHash = storedHash.toUpperCase();
        
        // When
        boolean isValid = blockchainClient.verifyHashWithOriginalData(upperCaseHash, rawData);
        
        // Then
        assertTrue(isValid, "Hash comparison should be case-insensitive");
        
        System.out.println("✅ Case-insensitive comparison works");
    }

    // =============================================
    // BLOCK INFO TESTS
    // =============================================
    
    @Test
    @DisplayName("getCurrentBlockNumber - Sinh block number hợp lệ")
    void getCurrentBlockNumber_ShouldReturnValidBlockNumber() {
        // When
        long blockNumber = blockchainClient.getCurrentBlockNumber();
        
        // Then
        // Block number dựa trên epoch time nên sẽ lớn
        // Chỉ cần đảm bảo > 0 và < 10 tỷ (reasonable limit)
        assertTrue(blockNumber > 0, "Block number should be positive");
        assertTrue(blockNumber < 10_000_000_000L, "Block number should be reasonable");
        
        System.out.println("✅ Generated Block Number: " + blockNumber);
    }

    @Test
    @DisplayName("generateBlockHash - Tạo block hash chuẩn")
    void generateBlockHash_ShouldReturnValidHash() {
        // Given
        long blockNumber = 150000001;
        
        // When
        String blockHash = blockchainClient.generateBlockHash(blockNumber);
        
        // Then
        assertNotNull(blockHash);
        assertTrue(blockHash.startsWith("0x"));
        assertEquals(66, blockHash.length());
        
        System.out.println("✅ Generated Block Hash: " + blockHash);
    }

    @Test
    @DisplayName("generateGasUsed - Write operation gas")
    void generateGasUsed_WriteOperation_ShouldBeInRange() {
        // When
        long gasUsed = blockchainClient.generateGasUsed(true);
        
        // Then
        assertTrue(gasUsed >= 100_000, "Write gas should be >= 100,000");
        assertTrue(gasUsed <= 150_000, "Write gas should be <= 150,000");
        
        System.out.println("✅ Write Operation Gas Used: " + gasUsed);
    }

    @Test
    @DisplayName("generateGasUsed - Verify operation gas")
    void generateGasUsed_VerifyOperation_ShouldBeInRange() {
        // When
        long gasUsed = blockchainClient.generateGasUsed(false);
        
        // Then
        assertTrue(gasUsed >= 50_000, "Verify gas should be >= 50,000");
        assertTrue(gasUsed <= 80_000, "Verify gas should be <= 80,000");
        
        System.out.println("✅ Verify Operation Gas Used: " + gasUsed);
    }

    @Test
    @DisplayName("generateContractAddress - Tạo contract address hợp lệ")
    void generateContractAddress_ShouldReturnValidAddress() {
        // When
        String contractAddress = blockchainClient.generateContractAddress();
        
        // Then
        assertNotNull(contractAddress);
        assertTrue(contractAddress.startsWith("0x"));
        assertEquals(42, contractAddress.length(), "Contract address should be 42 chars (0x + 40 hex)");
        assertTrue(contractAddress.matches("^0x[0-9a-f]{40}$"), "Should be valid Ethereum address format");
        
        System.out.println("✅ Generated Contract Address: " + contractAddress);
    }

    @Test
    @DisplayName("generateTransactionReceipt - Sinh receipt đầy đủ")
    void generateTransactionReceipt_ShouldReturnCompleteReceipt() {
        // Given
        String dataHash = VALID_DATA_HASH;
        
        // When
        BlockchainClient.TransactionReceipt receipt = 
            blockchainClient.generateTransactionReceipt(dataHash, true);
        
        // Then
        assertNotNull(receipt);
        assertNotNull(receipt.getTxHash());
        assertTrue(receipt.getTxHash().startsWith("0x"));
        assertTrue(receipt.getBlockNumber() > 0);
        assertTrue(receipt.getGasUsed() > 0);
        assertTrue(receipt.isStatus());  // Success
        
        System.out.println("✅ Transaction Receipt Generated:");
        System.out.println("   TxHash: " + receipt.getTxHash());
        System.out.println("   BlockNumber: " + receipt.getBlockNumber());
        System.out.println("   GasUsed: " + receipt.getGasUsed());
        System.out.println("   Status: " + receipt.isStatus());
    }

    // =============================================
    // UTILITY TESTS
    // =============================================
    
    @Test
    @DisplayName("calculateSHA256 - Tính hash chuẩn")
    void calculateSHA256_ShouldReturn64CharHash() {
        // Given
        String data = "Hello, Blockchain!";
        
        // When
        String hash = blockchainClient.calculateSHA256(data);
        
        // Then
        assertNotNull(hash);
        assertEquals(64, hash.length());
        assertTrue(hash.matches("^[0-9a-f]{64}$"));
        
        System.out.println("✅ SHA-256 Hash: " + hash);
    }

    @Test
    @DisplayName("calculateKeccak256Hex - Tính Keccak256 hash")
    void calculateKeccak256Hex_ShouldReturn64CharHash() {
        // Given
        String data = "Test data for Keccak256";
        
        // When
        String hash = blockchainClient.calculateKeccak256Hex(data);
        
        // Then
        assertNotNull(hash);
        assertEquals(64, hash.length());
        
        System.out.println("✅ Keccak256 Hash: " + hash);
    }

    @Test
    @DisplayName("isValidHex - Kiểm tra hex hợp lệ")
    void isValidHex_ShouldValidateCorrectly() {
        // Given/When/Then
        assertTrue(blockchainClient.isValidHex("abc123def"));
        assertTrue(blockchainClient.isValidHex("ABC123DEF"));
        assertTrue(blockchainClient.isValidHex("0123456789abcdef"));
        assertFalse(blockchainClient.isValidHex("xyz123"));  // Invalid chars
        assertFalse(blockchainClient.isValidHex(""));  // Empty
        assertFalse(blockchainClient.isValidHex(null));  // Null
        
        System.out.println("✅ Hex validation works correctly");
    }

    // =============================================
    // INTEGRATION TEST SCENARIOS
    // =============================================
    
    @Test
    @DisplayName("Scenario: Write data, then verify (unchanged)")
    void scenario_WriteAndVerifyUnchanged_ShouldPass() {
        System.out.println("\n=== Scenario: Write & Verify Unchanged Data ===");
        
        // Step 1: Raw data
        String rawData = "{\"batchId\":101,\"farmName\":\"Green Farm\",\"product\":\"Organic Rice\",\"weight\":500}";
        System.out.println("1. Raw Data: " + rawData);
        
        // Step 2: Calculate hash
        String dataHash = blockchainClient.calculateSHA256(rawData);
        System.out.println("2. Data Hash (SHA-256): " + dataHash);
        
        // Step 3: Write to blockchain (get tx hash)
        String txHash = blockchainClient.writeHash(dataHash);
        System.out.println("3. Transaction Hash: " + txHash);
        
        // Step 4: Later, verify with same data
        boolean isValid = blockchainClient.verifyHashWithOriginalData(dataHash, rawData);
        
        // Then
        assertTrue(isValid, "Verification should pass for unchanged data");
        System.out.println("4. ✅ VERIFICATION PASSED: Data integrity confirmed");
    }

    @Test
    @DisplayName("Scenario: Write data, modify, then verify (should fail)")
    void scenario_WriteAndVerifyModified_ShouldFail() {
        System.out.println("\n=== Scenario: Write & Verify Modified Data ===");
        
        // Step 1: Original data
        String originalData = "{\"batchId\":102,\"farmName\":\"Green Farm\",\"product\":\"Organic Rice\",\"weight\":500}";
        String dataHash = blockchainClient.calculateSHA256(originalData);
        System.out.println("1. Original Data Hash: " + dataHash);
        
        // Step 2: Simulate writing to blockchain
        String txHash = blockchainClient.writeHash(dataHash);
        System.out.println("2. Written to blockchain with tx: " + txHash);
        
        // Step 3: Attacker modifies data
        String modifiedData = "{\"batchId\":102,\"farmName\":\"Green Farm\",\"product\":\"Organic Rice\",\"weight\":1000}";
        System.out.println("3. ⚠️ Attacker modified weight: 500 -> 1000");
        
        // Step 4: Verify with modified data
        boolean isValid = blockchainClient.verifyHashWithOriginalData(dataHash, modifiedData);
        
        // Then
        assertFalse(isValid, "Verification should FAIL for modified data");
        System.out.println("4. ❌ VERIFICATION FAILED: Data tampering detected!");
    }

    @Test
    @DisplayName("Scenario: Full blockchain info generation")
    void scenario_FullBlockchainInfo_ShouldBeComplete() {
        System.out.println("\n=== Scenario: Full Blockchain Info ===");
        
        // Given
        String rawData = "{\"batchId\":103,\"product\":\"Coffee Beans\"}";
        String dataHash = blockchainClient.calculateSHA256(rawData);
        
        // Generate full transaction receipt
        BlockchainClient.TransactionReceipt receipt = 
            blockchainClient.generateTransactionReceipt(dataHash, true);
        
        // Print all info
        System.out.println("📋 Blockchain Record:");
        System.out.println("   Batch ID: 103");
        System.out.println("   Data Hash: " + dataHash);
        System.out.println("   Transaction Hash: " + receipt.getTxHash());
        System.out.println("   Block Number: " + receipt.getBlockNumber());
        System.out.println("   Block Hash: " + receipt.getBlockHash());
        System.out.println("   Gas Used: " + receipt.getGasUsed());
        System.out.println("   Transaction Index: " + receipt.getTransactionIndex());
        System.out.println("   Network: " + receipt.getNetwork());
        System.out.println("   Timestamp: " + receipt.getTimestamp());
        System.out.println("   Status: " + (receipt.isStatus() ? "SUCCESS" : "FAILED"));
        
        // Then
        assertNotNull(receipt.getTxHash());
        assertNotNull(receipt.getBlockHash());
        assertTrue(receipt.getBlockNumber() > 0);
        assertTrue(receipt.getGasUsed() > 0);
        
        System.out.println("✅ Full blockchain info generated successfully");
    }
}
