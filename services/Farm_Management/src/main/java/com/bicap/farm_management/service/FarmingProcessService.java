package com.bicap.farm_management.service;

import com.bicap.farm_management.entity.FarmingProcess;
import com.bicap.farm_management.entity.ProductionBatch;
import com.bicap.farm_management.repository.FarmingProcessRepository;
import com.bicap.farm_management.repository.ProductionBatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FarmingProcessService {
    @Autowired
    private FarmingProcessRepository processRepository;
    @Autowired
    private ProductionBatchRepository batchRepository;
    @Autowired
    private BlockchainProducer blockchainProducer;

    // SỬA: Thêm tham số userId (Long userId) vào đây
    public FarmingProcess addProcess(Long batchId, FarmingProcess process, Long userId) {
        
        // 1. Tìm lô sản xuất
        ProductionBatch batch = batchRepository.findById(batchId)
            .orElseThrow(() -> new RuntimeException("Lô sản xuất không tồn tại!"));

        // 2. [QUAN TRỌNG] Kiểm tra quyền sở hữu
        // Chỉ cho phép nếu Farm của Batch này thuộc về userId đang đăng nhập
        if (!batch.getFarm().getOwnerId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thêm nhật ký cho trang trại này!");
        }

        process.setProductionBatch(batch);
        process.setStatus("PENDING_BLOCKCHAIN");

        // 3. Lưu DB
        FarmingProcess savedProcess = processRepository.save(process);

        // 4. Bắn lên Blockchain
        try {
            Map<String, Object> dataToHash = new HashMap<>();
            dataToHash.put("id", savedProcess.getId());
            dataToHash.put("type", "PROCESS");
            dataToHash.put("processType", savedProcess.getProcessType());
            dataToHash.put("description", savedProcess.getDescription());
            dataToHash.put("batchId", batch.getId());
            
            if (savedProcess.getPerformedDate() != null) {
                dataToHash.put("date", savedProcess.getPerformedDate().toString());
            }

            blockchainProducer.sendToBlockchain(savedProcess.getId(), "PROCESS", dataToHash);
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi gửi Blockchain: " + e.getMessage());
        }

        return savedProcess;
    }

    public List<FarmingProcess> getProcessesByBatch(Long batchId) {
        return processRepository.findByProductionBatchId(batchId);
    }
    
    public void updateBlockchainStatus(Long processId, String txHash) {
        FarmingProcess process = processRepository.findById(processId).orElse(null);
        if (process != null) {
            process.setStatus("SYNCED");
            process.setTxHash(txHash);
            processRepository.save(process);
            System.out.println("✅ Nhật ký ID " + processId + " đã được xác thực trên Blockchain!");
        }
    }
}