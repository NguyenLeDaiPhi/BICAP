package com.bicap.farm_management.service;

import com.bicap.farm_management.dto.CreateProductionBatchRequest;
import com.bicap.farm_management.entity.Farm;
import com.bicap.farm_management.entity.ProductionBatch;
import com.bicap.farm_management.repository.FarmRepository;
import com.bicap.farm_management.repository.ProductionBatchRepository;
import com.bicap.farm_management.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductionBatchService {

    @Autowired
    private ProductionBatchRepository batchRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private BlockchainProducer blockchainProducer;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Tạo mùa vụ mới - KHÔNG cần farmId trong URL
     * Tự động lấy farm từ JWT token của user đang đăng nhập
     * ADMIN có thể chỉ định farmId cụ thể
     */
    public ProductionBatch createBatchWithoutFarmId(CreateProductionBatchRequest request) {
        Farm farm;

        // Nếu có farmId trong request
        if (request.getFarmId() != null) {
            // Kiểm tra quyền: chỉ ADMIN mới được tạo batch cho farm khác
            if (!securityUtils.isAdmin()) {
                // Non-admin: kiểm tra farmId có phải của mình không
                Farm userFarm = securityUtils.getCurrentUserFarm();
                if (userFarm == null || !userFarm.getId().equals(request.getFarmId())) {
                    throw new RuntimeException("Bạn không có quyền tạo mùa vụ cho farm này");
                }
            }
            farm = farmRepository.findById(request.getFarmId())
                    .orElseThrow(() -> new RuntimeException("Farm not found with ID: " + request.getFarmId()));
        } else {
            // Không có farmId: lấy farm từ JWT token
            if (securityUtils.isAdmin()) {
                // ADMIN: lấy farm đầu tiên hoặc báo lỗi
                farm = farmRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("No farm found in system"));
            } else {
                // FARM_MANAGER: lấy farm của mình
                farm = securityUtils.getCurrentUserFarmOrThrow();
            }
        }
        
        // 2. Tạo batch entity
        ProductionBatch batch = new ProductionBatch();
        batch.setFarm(farm);
        batch.setName(request.getName());
        batch.setProductType(request.getProductType());
        batch.setStartDate(request.getStartDate());
        batch.setEndDate(request.getEndDate());
        batch.setArea(request.getArea());
        batch.setQuantity(request.getQuantity());
        batch.setStatus(request.getStatus() != null ? request.getStatus() : "PLANNING");
        
        // 3. Tự sinh batchCode nếu rỗng (định dạng: VU-{timestamp})
        if (batch.getBatchCode() == null || batch.getBatchCode().isEmpty()) {
            batch.setBatchCode("VU-" + System.currentTimeMillis());
        }
        
        return saveBatchWithBlockchain(batch);
    }

    public ProductionBatch createBatch(Long farmId, ProductionBatch batch) {
        // 1. Kiểm tra Farm có tồn tại không
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found with ID: " + farmId));
        
        batch.setFarm(farm);
        batch.setStatus("PENDING_BLOCKCHAIN"); // Đặt trạng thái chờ
        
        // Tự sinh batchCode nếu rỗng
        if (batch.getBatchCode() == null || batch.getBatchCode().isEmpty()) {
            batch.setBatchCode("VU-" + System.currentTimeMillis());
        }
        
        // Lưu vào DB trước để lấy ID
        ProductionBatch savedBatch = batchRepository.save(batch);

        // Bắn tin nhắn sang Blockchain
        sendToBlockchain(savedBatch, farm);

        return savedBatch;
    }
    
    /**
     * Lấy tất cả mùa vụ
     * - ADMIN: xem tất cả batches từ mọi farm
     * - FARM_MANAGER: chỉ xem batches của farm mình (nếu đã tạo farm)
     */
    public List<ProductionBatch> getAllBatches() {
        if (securityUtils.isAdmin()) {
            // ADMIN: lấy tất cả batches
            return batchRepository.findAll();
        } else {
            // FARM_MANAGER: chỉ lấy batches của farm mình
            if (!securityUtils.hasFarm()) {
                // User chưa có farm -> trả về list rỗng (không lỗi)
                return List.of();
            }
            Long farmId = securityUtils.getCurrentFarmId();
            return batchRepository.findByFarmId(farmId);
        }
    }
    
    /**
     * Lấy chi tiết mùa vụ theo ID
     * Kiểm tra quyền truy cập
     */
    public ProductionBatch getBatchById(Long id) {
        ProductionBatch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mùa vụ với ID: " + id));

        // Kiểm tra quyền truy cập
        checkBatchAccess(batch);

        return batch;
    }

    /**
     * Kiểm tra user có quyền truy cập batch không
     */
    private void checkBatchAccess(ProductionBatch batch) {
        if (securityUtils.isAdmin()) {
            return; // ADMIN có quyền truy cập tất cả
        }

        // FARM_MANAGER: kiểm tra batch thuộc farm của mình
        Farm userFarm = securityUtils.getCurrentUserFarm();
        if (userFarm == null || !userFarm.getId().equals(batch.getFarm().getId())) {
            throw new RuntimeException("Bạn không có quyền truy cập mùa vụ này");
        }
    }
    
    /**
     * Cập nhật mùa vụ - chỉ chủ sở hữu hoặc ADMIN mới được sửa
     */
    public ProductionBatch updateBatch(Long id, CreateProductionBatchRequest request) {
        ProductionBatch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mùa vụ với ID: " + id));

        // Kiểm tra quyền truy cập
        checkBatchAccess(batch);

        // Cập nhật các trường
        if (request.getName() != null) batch.setName(request.getName());
        if (request.getProductType() != null) batch.setProductType(request.getProductType());
        if (request.getStartDate() != null) batch.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) batch.setEndDate(request.getEndDate());
        if (request.getArea() != null) batch.setArea(request.getArea());
        if (request.getQuantity() != null) batch.setQuantity(request.getQuantity());
        if (request.getStatus() != null) batch.setStatus(request.getStatus());

        return batchRepository.save(batch);
    }

    /**
     * Xóa mùa vụ - chỉ chủ sở hữu hoặc ADMIN mới được xóa
     */
    public void deleteBatch(Long id) {
        ProductionBatch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mùa vụ với ID: " + id));

        // Kiểm tra quyền truy cập
        checkBatchAccess(batch);

        batchRepository.delete(batch);
    }

    public List<ProductionBatch> getBatchesByFarm(Long farmId) {
        return batchRepository.findByFarmId(farmId);
    }
    
    // Hàm cập nhật kết quả từ Blockchain
    public void updateBlockchainStatus(Long batchId, String txHash) {
        ProductionBatch batch = batchRepository.findById(batchId).orElse(null);
        if (batch != null) {
            batch.setStatus("SYNCED");
            batch.setTxHash(txHash);
            batchRepository.save(batch);
            System.out.println("Đã cập nhật trạng thái SYNCED cho Batch ID: " + batchId);
        } else {
            System.err.println("Không tìm thấy Batch ID: " + batchId + " để cập nhật.");
        }
    }

    @Autowired
    private com.bicap.farm_management.repository.FarmingProcessRepository processRepository;
    
    @Autowired
    private com.bicap.farm_management.repository.ExportBatchRepository exportBatchRepository;

    // CHỨC NĂNG MỚI: Lấy chi tiết toàn bộ mùa vụ (Monitor)
    public com.bicap.farm_management.dto.SeasonDetailResponse getSeasonDetail(Long batchId) {
        // 1. Lấy thông tin mùa vụ
        ProductionBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mùa vụ với ID: " + batchId));

        // 2. Kiểm tra quyền truy cập
        checkBatchAccess(batch);

        // 3. Lấy danh sách nhật ký canh tác (Tiến trình)
        List<com.bicap.farm_management.entity.FarmingProcess> processes = processRepository.findByProductionBatchId(batchId);

        // 4. Lấy danh sách đợt xuất hàng (đã có QR)
        List<com.bicap.farm_management.entity.ExportBatch> exports = exportBatchRepository.findByProductionBatchId(batchId);

        return new com.bicap.farm_management.dto.SeasonDetailResponse(batch, processes, exports);
    }
    
    // ============== Private helper methods ==============
    
    private ProductionBatch saveBatchWithBlockchain(ProductionBatch batch) {
        // 1. Lưu vào DB trước để lấy ID
        ProductionBatch savedBatch = batchRepository.save(batch);

        // 2. Bắn tin nhắn sang Blockchain Adapter
        try {
            sendToBlockchain(savedBatch, savedBatch.getFarm());
        } catch (Exception e) {
            System.err.println("Lỗi gửi RabbitMQ: " + e.getMessage());
            // Không ném lỗi ra ngoài để tránh rollback transaction
        }

        return savedBatch;
    }
    
    private void sendToBlockchain(ProductionBatch savedBatch, Farm farm) {
        // === PHẦN SỬA LỖI QUAN TRỌNG ===
        // Không gửi cả object 'savedBatch' vì nó chứa Hibernate Proxy gây lỗi.
        // Thay vào đó, tạo một Map thủ công chỉ chứa dữ liệu cần thiết.
        Map<String, Object> dataToHash = new HashMap<>();
        dataToHash.put("id", savedBatch.getId());
        dataToHash.put("batchCode", savedBatch.getBatchCode());
        dataToHash.put("name", savedBatch.getName());
        dataToHash.put("productType", savedBatch.getProductType());
        dataToHash.put("status", savedBatch.getStatus());
        dataToHash.put("farmId", farm.getId()); // Chỉ lấy ID, không lấy cả object Farm
        
        // Xử lý ngày tháng: Chuyển về String để tránh lỗi định dạng
        if (savedBatch.getStartDate() != null) {
            dataToHash.put("startDate", savedBatch.getStartDate().toString());
        }
        if (savedBatch.getEndDate() != null) {
            dataToHash.put("endDate", savedBatch.getEndDate().toString());
        }
        if (savedBatch.getArea() != null) {
            dataToHash.put("area", savedBatch.getArea());
        }
        if (savedBatch.getQuantity() != null) {
            dataToHash.put("quantity", savedBatch.getQuantity());
        }

        // Gửi Map này đi để tính Hash (Gson xử lý Map rất tốt)
        blockchainProducer.sendToBlockchain(savedBatch.getId(), "BATCH", dataToHash);
    }
}