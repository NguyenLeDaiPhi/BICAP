package com.bicap.farm_management.service;

import com.bicap.farm_management.entity.Farm;
import com.bicap.farm_management.entity.ProductionBatch;
import com.bicap.farm_management.repository.FarmRepository;
import com.bicap.farm_management.repository.ProductionBatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductionBatchService {

    @Autowired
    private ProductionBatchRepository batchRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private BlockchainProducer blockchainProducer;

    // SỬA: Thêm tham số userId để kiểm tra quyền sở hữu
    public ProductionBatch createBatch(Long farmId, ProductionBatch batch, Long userId) {
        // 1. Kiểm tra Farm có tồn tại không
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trang trại với ID: " + farmId));
        
        // 2. KIỂM TRA QUYỀN SỞ HỮU (Chặn nếu không phải chủ trang trại)
        if (!farm.getOwnerId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền tạo mùa vụ cho trang trại này (ID: " + farmId + ")");
        }

        batch.setFarm(farm);
        batch.setStatus("PENDING_BLOCKCHAIN"); // Đặt trạng thái chờ
        
        // 3. Lưu vào DB trước để lấy ID
        ProductionBatch savedBatch = batchRepository.save(batch);

        // 4. Bắn tin nhắn sang Blockchain Adapter
        try {
            Map<String, Object> dataToHash = new HashMap<>();
            dataToHash.put("id", savedBatch.getId());
            dataToHash.put("batchCode", savedBatch.getBatchCode());
            dataToHash.put("productType", savedBatch.getProductType());
            dataToHash.put("status", savedBatch.getStatus());
            dataToHash.put("farmId", farm.getId());
            
            if (savedBatch.getStartDate() != null) {
                dataToHash.put("startDate", savedBatch.getStartDate().toString());
            }
            if (savedBatch.getEndDate() != null) {
                dataToHash.put("endDate", savedBatch.getEndDate().toString());
            }

            blockchainProducer.sendToBlockchain(savedBatch.getId(), "BATCH", dataToHash);
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi gửi RabbitMQ: " + e.getMessage());
            e.printStackTrace();
        }

        return savedBatch;
    }

    public List<ProductionBatch> getBatchesByFarm(Long farmId) {
        return batchRepository.findByFarmId(farmId);
    }
    
    public void updateBlockchainStatus(Long batchId, String txHash) {
        ProductionBatch batch = batchRepository.findById(batchId).orElse(null);
        if (batch != null) {
            batch.setStatus("SYNCED");
            batch.setTxHash(txHash);
            batchRepository.save(batch);
            System.out.println("✅ Đã cập nhật trạng thái SYNCED cho Batch ID: " + batchId);
        } else {
            System.err.println("⚠️ Không tìm thấy Batch ID: " + batchId + " để cập nhật.");
        }
    }
}