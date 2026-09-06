package com.bicap.blockchain_adapter_service.controller;

import com.bicap.blockchain_adapter_service.dto.VerifyBlockchainResponse;
import com.bicap.blockchain_adapter_service.dto.WriteBlockchainRequest;
import com.bicap.blockchain_adapter_service.entity.BlockchainRecord;
import com.bicap.blockchain_adapter_service.service.IBlockchainService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Blockchain Controller - REST API endpoints cho Blockchain Service
 * 
 * Cung cấp các API endpoints:
 * - POST /api/blockchain/write - Ghi dữ liệu lên blockchain
 * - GET /api/blockchain/verify/{batchId} - Xác minh hash đã lưu
 * - GET /api/blockchain/verify-external - Xác minh với dữ liệu bên ngoài
 * - GET /api/blockchain/info/{batchId} - Lấy thông tin blockchain của batch
 * - GET /api/blockchain/stats - Lấy thống kê
 * 
 * @author BICAP Team
 * @since 2026-09-06
 */
@RestController
@RequestMapping("/api/blockchain")
public class BlockchainController {

    private static final Logger logger = LoggerFactory.getLogger(BlockchainController.class);

    private final IBlockchainService blockchainService;

    public BlockchainController(IBlockchainService blockchainService) {
        this.blockchainService = blockchainService;
    }

    // =============================================
    // WRITE ENDPOINTS
    // =============================================

    /**
     * Ghi dữ liệu lên blockchain
     * 
     * @param request WriteBlockchainRequest chứa batchId và rawData
     * @return ResponseEntity với kết quả
     * 
     * @api POST /api/blockchain/write
     * @apiBody { batchId: Long, rawData: String, resourceType?: String }
     * @apiResponse 200: "Written to blockchain" - Thành công
     * @apiResponse 400: Validation error - Dữ liệu đầu vào không hợp lệ
     */
    @PostMapping("/write")
    public ResponseEntity<?> writeToBlockchain(
            @RequestBody WriteBlockchainRequest request) {

        logger.info("📝 POST /api/blockchain/write - batchId={}", 
            request != null ? request.getBatchId() : "null");
        
        // Validate request
        if (request == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "Request body is required",
                        "success", false
                    ));
        }

        if (request.getBatchId() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "batchId is required",
                        "success", false
                    ));
        }

        if (request.getRawData() == null || request.getRawData().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "rawData is required and cannot be empty",
                        "success", false
                    ));
        }

        // Set default resource type nếu không có
        String resourceType = request.getResourceType();
        if (resourceType == null || resourceType.isBlank()) {
            resourceType = "BATCH";
        }

        try {
            blockchainService.write(
                    request.getBatchId(),
                    resourceType,
                    request.getRawData()
            );
            
            logger.info("✅ Successfully wrote to blockchain for batchId={}", request.getBatchId());
            
            return ResponseEntity.ok(Map.of(
                "message", "Written to blockchain successfully",
                "batchId", request.getBatchId(),
                "resourceType", resourceType,
                "success", true
            ));
            
        } catch (IllegalArgumentException e) {
            logger.error("❌ Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", e.getMessage(),
                        "success", false
                    ));
        } catch (Exception e) {
            logger.error("❌ Error writing to blockchain", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                        "error", "Failed to write to blockchain: " + e.getMessage(),
                        "success", false
                    ));
        }
    }

    // =============================================
    // VERIFY ENDPOINTS
    // =============================================

    /**
     * Xác minh tính toàn vẹn dữ liệu của một batch
     * 
     * So khớp hash đã lưu với dữ liệu gốc trong database.
     * Nếu dữ liệu bị sửa đổi sau khi ghi lên blockchain,
     * kết quả sẽ trả về valid=false.
     * 
     * @param batchId Mã lô cần xác minh
     * @return VerifyBlockchainResponse với kết quả xác minh
     * 
     * @api GET /api/blockchain/verify/{batchId}
     * @apiResponse 200: VerifyBlockchainResponse - Kết quả xác minh
     * @apiResponse 400: Validation error
     * @apiResponse 404: Batch not found
     */
    @GetMapping("/verify/{batchId}")
    public ResponseEntity<?> verify(
            @PathVariable Long batchId) {

        logger.info("🔍 GET /api/blockchain/verify/{}", batchId);
        
        if (batchId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "batchId is required",
                        "success", false
                    ));
        }

        try {
            VerifyBlockchainResponse response = blockchainService.verify(batchId);
            
            if (response.valid()) {
                logger.info("✅ Verification passed for batchId={}", batchId);
            } else {
                logger.warn("⚠️ Verification FAILED for batchId={}", batchId);
            }
            
            return ResponseEntity.ok(Map.of(
                "batchId", response.batchId(),
                "valid", response.valid(),
                "message", response.message(),
                "success", true
            ));
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Batch not found")) {
                logger.error("❌ Batch not found: {}", batchId);
                return ResponseEntity.status(404)
                        .body(Map.of(
                            "error", "Batch not found: " + batchId,
                            "success", false
                        ));
            }
            logger.error("❌ Error verifying batch", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                        "error", "Failed to verify: " + e.getMessage(),
                        "success", false
                    ));
        }
    }

    /**
     * Xác minh với dữ liệu từ bên ngoài
     * 
     * Cho phép xác minh bất kỳ dữ liệu nào so với hash đã lưu trên blockchain.
     * Hữu ích khi cần verify dữ liệu mà không có trong database.
     * 
     * @param batchId Mã lô
     * @param data Dữ liệu gốc cần xác minh
     * @return Kết quả xác minh
     * 
     * @api GET /api/blockchain/verify-external?batchId={batchId}&data={data}
     * @apiResponse 200: Kết quả xác minh
     */
    @GetMapping("/verify-external")
    public ResponseEntity<?> verifyExternal(
            @RequestParam Long batchId,
            @RequestParam String data) {

        logger.info("🔍 GET /api/blockchain/verify-external - batchId={}", batchId);
        
        if (batchId == null || data == null || data.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "batchId and data are required",
                        "success", false
                    ));
        }

        try {
            boolean isValid = blockchainService.verifyWithExternalData(batchId, data);
            
            return ResponseEntity.ok(Map.of(
                "batchId", batchId,
                "valid", isValid,
                "message", isValid 
                    ? "Data matches blockchain record" 
                    : "Data does NOT match blockchain record",
                "success", true
            ));
            
        } catch (RuntimeException e) {
            logger.error("❌ Error verifying external data", e);
            return ResponseEntity.status(404)
                    .body(Map.of(
                        "error", e.getMessage(),
                        "success", false
                    ));
        }
    }

    // =============================================
    // INFO ENDPOINTS
    // =============================================

    /**
     * Lấy thông tin blockchain của một batch
     * 
     * @param batchId Mã lô
     * @return BlockchainRecord với đầy đủ thông tin
     * 
     * @api GET /api/blockchain/info/{batchId}
     * @apiResponse 200: BlockchainRecord
     * @apiResponse 404: Batch not found
     */
    @GetMapping("/info/{batchId}")
    public ResponseEntity<?> getBlockchainInfo(
            @PathVariable Long batchId) {

        logger.info("📋 GET /api/blockchain/info/{}", batchId);
        
        if (batchId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "batchId is required",
                        "success", false
                    ));
        }

        return blockchainService.getBlockchainInfo(batchId)
                .<ResponseEntity<?>>map(record -> {
                    Map<String, Object> info = new LinkedHashMap<>();
                    info.put("batchId", record.getBatchId());
                    info.put("dataHash", record.getDataHash());
                    info.put("blockchainTx", record.getBlockchainTx());
                    info.put("blockNumber", record.getBlockNumber() != null ? record.getBlockNumber() : "N/A");
                    info.put("blockHash", record.getBlockHash() != null ? record.getBlockHash() : "N/A");
                    info.put("gasUsed", record.getGasUsed() != null ? record.getGasUsed() : "N/A");
                    info.put("network", record.getNetwork() != null ? record.getNetwork() : "N/A");
                    info.put("verified", record.getVerified() != null ? record.getVerified() : "N/A");
                    info.put("verifiedAt", record.getVerifiedAt() != null ? record.getVerifiedAt().toString() : "N/A");
                    info.put("createdAt", record.getCreatedAt() != null ? record.getCreatedAt().toString() : "N/A");
                    info.put("success", true);
                    return ResponseEntity.ok(info);
                })
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(Map.of(
                            "error", "Batch not found: " + batchId,
                            "success", false
                        )));
    }

    // =============================================
    // UTILITY ENDPOINTS
    // =============================================

    /**
     * Lấy thống kê blockchain
     * 
     * @return Thống kê tổng quan
     * 
     * @api GET /api/blockchain/stats
     * @apiResponse 200: Statistics object
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        logger.info("📊 GET /api/blockchain/stats");
        
        // Lấy stats từ repository (nếu có method)
        return ResponseEntity.ok(Map.of(
            "network", "VeChainThor",
            "chainId", 100,
            "service", "blockchain-adapter-service",
            "version", "1.0.0",
            "timestamp", java.time.LocalDateTime.now(),
            "success", true
        ));
    }

    /**
     * Health check endpoint
     * 
     * @api GET /api/blockchain/health
     * @apiResponse 200: Health status
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "blockchain-adapter-service",
            "timestamp", java.time.LocalDateTime.now(),
            "success", true
        ));
    }
}
