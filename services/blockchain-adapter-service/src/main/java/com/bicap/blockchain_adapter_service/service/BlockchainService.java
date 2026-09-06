package com.bicap.blockchain_adapter_service.service;

import com.bicap.blockchain_adapter_service.dto.VerifyBlockchainResponse;
import com.bicap.blockchain_adapter_service.entity.BlockchainRecord;
import com.bicap.blockchain_adapter_service.entity.TraceLog;
import com.bicap.blockchain_adapter_service.repository.BlockchainRecordRepository;
import com.bicap.blockchain_adapter_service.repository.TraceLogRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

/**
 * BlockchainService - Dịch vụ xử lý giao dịch blockchain
 * 
 * Cung cấp các chức năng:
 * - Ghi hash dữ liệu lên blockchain (với tx hash chuẩn Keccak256)
 * - Xác minh tính toàn vẹn dữ liệu bằng cách so khớp hash
 * - Lưu trữ thông tin giao dịch đầy đủ (block, gas, etc.)
 * 
 * @author BICAP Team
 * @since 2026-09-06
 */
@Service
public class BlockchainService implements IBlockchainService {

    // =============================================
    // LOGGING
    // =============================================
    
    private static final Logger logger = LoggerFactory.getLogger(BlockchainService.class);

    // =============================================
    // DEPENDENCIES
    // =============================================
    
    private final BlockchainRecordRepository recordRepository;
    private final TraceLogRepository traceLogRepository;
    private final BlockchainClient blockchainClient;

    // =============================================
    // CONSTRUCTOR
    // =============================================
    
    public BlockchainService(BlockchainRecordRepository recordRepository,
                            TraceLogRepository traceLogRepository,
                            BlockchainClient blockchainClient) {
        this.recordRepository = recordRepository;
        this.traceLogRepository = traceLogRepository;
        this.blockchainClient = blockchainClient;
    }

    // =============================================
    // CORE METHODS
    // =============================================

    /**
     * Ghi hash dữ liệu lên blockchain
     * 
     * Quy trình:
     * 1. Validate dữ liệu đầu vào
     * 2. Tính SHA-256 hash từ dữ liệu gốc
     * 3. Tạo Transaction Hash chuẩn Keccak256
     * 4. Tạo Block Info (block number, gas, etc.)
     * 5. Lưu vào database với đầy đủ thông tin
     * 6. Ghi log truy vết
     * 
     * @param batchId Mã lô sản xuất
     * @param resourceType Loại tài nguyên (PRODUCTION, ENVIRONMENT, SHIPPING, etc.)
     * @param rawData Dữ liệu gốc (JSON string) - Sẽ được hash và lưu lại để verify
     * 
     * @throws IllegalArgumentException nếu tham số đầu vào không hợp lệ
     * @throws RuntimeException nếu có lỗi khi tạo hash hoặc lưu database
     */
    @Override
    @Transactional
    public void write(Long batchId, String resourceType, String rawData) {
        long startTime = System.currentTimeMillis();
        logger.info("🔄 Starting blockchain write for batchId={}, resourceType={}", batchId, resourceType);
        
        // =============================================
        // STEP 1: Validate dữ liệu đầu vào
        // =============================================
        
        validateWriteInput(batchId, resourceType, rawData);
        
        // =============================================
        // STEP 2: Tính SHA-256 hash từ dữ liệu gốc
        // =============================================
        
        String dataHash = calculateSHA256(rawData);
        logger.debug("📊 Computed SHA-256 hash: {}", dataHash);
        
        // =============================================
        // STEP 3: Tạo Transaction Hash chuẩn Keccak256
        // =============================================
        
        String txHash = blockchainClient.writeHash(dataHash);
        logger.debug("📝 Generated Transaction Hash: {}", txHash);
        
        // =============================================
        // STEP 4: Tạo Block Info mô phỏng
        // =============================================
        
        BlockchainClient.TransactionReceipt receipt = 
            blockchainClient.generateTransactionReceipt(dataHash, true);
        
        logger.debug("📦 Block Number: {}", receipt.getBlockNumber());
        logger.debug("⛽ Gas Used: {}", receipt.getGasUsed());
        
        // =============================================
        // STEP 5: Lưu vào database với đầy đủ thông tin
        // =============================================
        
        BlockchainRecord record = new BlockchainRecord();
        record.setBatchId(batchId);
        record.setDataHash(dataHash);
        record.setRawData(rawData);  // Lưu dữ liệu gốc để verify sau
        record.setBlockchainTx(txHash);
        record.setBlockNumber(receipt.getBlockNumber());
        record.setBlockHash(receipt.getBlockHash());
        record.setGasUsed(receipt.getGasUsed());
        record.setTransactionIndex(receipt.getTransactionIndex());
        record.setContractAddress(blockchainClient.generateContractAddress());
        record.setNetwork(receipt.getNetwork());
        record.setChainId(100L);  // VeChainThor Mainnet
        record.setResourceType(resourceType);
        record.setCreatedAt(LocalDateTime.now());
        
        BlockchainRecord savedRecord = recordRepository.save(record);
        logger.info("✅ Blockchain record saved with id={}", savedRecord.getId());
        
        // =============================================
        // STEP 6: Ghi log truy vết
        // =============================================
        
        TraceLog log = new TraceLog();
        log.setObjectType(resourceType);
        log.setObjectId(batchId);
        log.setAction("WRITE_BLOCKCHAIN");
        log.setCreatedAt(LocalDateTime.now());
        traceLogRepository.save(log);
        
        long elapsed = System.currentTimeMillis() - startTime;
        logger.info("✅ Blockchain write completed in {}ms for batchId={}", elapsed, batchId);
    }

    /**
     * Xác minh tính toàn vẹn dữ liệu của một lô
     * 
     * Quy trình xác minh:
     * 1. Lấy record từ database
     * 2. Tính hash SHA-256 từ dữ liệu gốc đã lưu
     * 3. So sánh với hash đã lưu trên blockchain
     * 4. Trả về kết quả với thông báo chi tiết
     * 
     * Nếu dữ liệu bị sửa đổi sau khi ghi lên blockchain,
     * hash sẽ KHÔNG khớp và verify sẽ trả về false.
     * 
     * @param batchId Mã lô cần xác minh
     * @return VerifyBlockchainResponse chứa kết quả xác minh
     * 
     * @throws IllegalArgumentException nếu batchId null
     * @throws RuntimeException nếu batch không tìm thấy
     */
    @Override
    @Transactional
    public VerifyBlockchainResponse verify(Long batchId) {
        long startTime = System.currentTimeMillis();
        logger.info("🔍 Starting blockchain verification for batchId={}", batchId);
        
        // =============================================
        // STEP 1: Validate input
        // =============================================
        
        if (batchId == null) {
            throw new IllegalArgumentException("batchId must not be null");
        }
        
        // =============================================
        // STEP 2: Lấy record từ database
        // =============================================
        
        BlockchainRecord record = recordRepository
                .findByBatchId(batchId)
                .orElseThrow(() -> {
                    logger.error("❌ Batch not found: {}", batchId);
                    return new RuntimeException("Batch not found: " + batchId);
                });
        
        // =============================================
        // STEP 3: Xác minh hash thực tế
        // =============================================
        
        boolean isValid;
        String message;
        String computedHash = null;
        
        if (record.getRawData() != null && !record.getRawData().isBlank()) {
            // Case 1: Có dữ liệu gốc -> verify thực sự
            // Tính lại hash từ dữ liệu gốc
            computedHash = calculateSHA256(record.getRawData());
            
            // So sánh với hash đã lưu
            isValid = computedHash.equalsIgnoreCase(record.getDataHash());
            
            if (isValid) {
                message = "✅ Data integrity verified: hash matches blockchain record";
                logger.info("✅ Verification passed for batchId={}", batchId);
            } else {
                message = "❌ Data integrity FAILED: hash mismatch - data may have been modified!";
                logger.warn("⚠️ Verification FAILED for batchId={}. Expected: {}, Got: {}", 
                    batchId, record.getDataHash(), computedHash);
            }
        } else {
            // Case 2: Không có dữ liệu gốc -> chỉ kiểm tra format
            isValid = isValidHash(record.getDataHash());
            message = isValid 
                ? "⚠️ Hash format is valid but original data not available for full verification"
                : "❌ Invalid hash format";
            logger.warn("⚠️ Cannot fully verify batchId={}: no original data", batchId);
        }
        
        // =============================================
        // STEP 4: Cập nhật trạng thái verify
        // =============================================
        
        record.setVerified(isValid);
        record.setVerifiedAt(LocalDateTime.now());
        record.setVerificationMessage(message);
        recordRepository.save(record);
        
        // =============================================
        // STEP 5: Ghi log truy vết
        // =============================================
        
        TraceLog log = new TraceLog();
        log.setObjectType("BATCH");
        log.setObjectId(batchId);
        log.setAction("VERIFY_BLOCKCHAIN");
        log.setCreatedAt(LocalDateTime.now());
        traceLogRepository.save(log);
        
        long elapsed = System.currentTimeMillis() - startTime;
        logger.info("🔍 Verification completed in {}ms for batchId={}: valid={}", 
            elapsed, batchId, isValid);
        
        return new VerifyBlockchainResponse(
                batchId,
                isValid,
                message
        );
    }

    /**
     * Xác minh với dữ liệu từ bên ngoài (không cần đã lưu raw data)
     * 
     * Phương thức này cho phép xác minh bất kỳ dữ liệu nào so với
     * hash đã lưu trên blockchain.
     * 
     * @param batchId Mã lô cần xác minh
     * @param originalData Dữ liệu gốc cần xác minh
     * @return true nếu dữ liệu khớp với hash trên blockchain
     */
    @Transactional
    public boolean verifyWithExternalData(Long batchId, String originalData) {
        if (batchId == null || originalData == null) {
            throw new IllegalArgumentException("batchId and originalData must not be null");
        }
        
        BlockchainRecord record = recordRepository
                .findByBatchId(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found: " + batchId));
        
        // Tính hash từ dữ liệu được cung cấp
        String computedHash = calculateSHA256(originalData);
        
        // So sánh với hash đã lưu
        return computedHash.equalsIgnoreCase(record.getDataHash());
    }

    /**
     * Lấy thông tin blockchain của một batch
     * 
     * @param batchId Mã lô
     * @return Optional chứa BlockchainRecord nếu tìm thấy
     */
    public Optional<BlockchainRecord> getBlockchainInfo(Long batchId) {
        if (batchId == null) {
            return Optional.empty();
        }
        return recordRepository.findByBatchId(batchId);
    }

    // =============================================
    // PRIVATE HELPER METHODS
    // =============================================

    /**
     * Validate dữ liệu đầu vào cho write operation
     */
    private void validateWriteInput(Long batchId, String resourceType, String rawData) {
        if (batchId == null) {
            throw new IllegalArgumentException("batchId must not be null");
        }

        if (resourceType == null || resourceType.isBlank()) {
            throw new IllegalArgumentException("resourceType must not be empty");
        }

        if (rawData == null || rawData.isBlank()) {
            throw new IllegalArgumentException("rawData must not be empty");
        }
        
        logger.debug("✅ Input validation passed for batchId={}", batchId);
    }

    /**
     * Tính SHA-256 hash của dữ liệu
     * 
     * @param data Dữ liệu cần hash
     * @return Hash dạng hex (64 ký tự, không có 0x)
     */
    private String calculateSHA256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            logger.error("❌ Error calculating SHA-256 hash", e);
            throw new RuntimeException("Error calculating hash", e);
        }
    }

    /**
     * Kiểm tra hash có đúng định dạng không
     * 
     * @param hash Hash cần kiểm tra
     * @return true nếu là hex 64 ký tự hợp lệ
     */
    private boolean isValidHash(String hash) {
        if (hash == null || hash.isBlank()) {
            return false;
        }
        // Loại bỏ prefix 0x
        String cleanHash = hash.startsWith("0x") ? hash.substring(2) : hash;
        return cleanHash.matches("^[0-9a-fA-F]{64}$");
    }
}
