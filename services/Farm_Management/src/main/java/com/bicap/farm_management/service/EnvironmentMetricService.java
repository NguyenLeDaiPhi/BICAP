package com.bicap.farm_management.service;

import com.bicap.farm_management.entity.EnvironmentMetric;
import com.bicap.farm_management.entity.ProductionBatch;
import com.bicap.farm_management.repository.EnvironmentMetricRepository;
import com.bicap.farm_management.repository.ProductionBatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;

@Service
public class EnvironmentMetricService {
    @Autowired
    private EnvironmentMetricRepository metricRepository;
    
    @Autowired
    private ProductionBatchRepository batchRepository;

    public EnvironmentMetric addMetric(Long batchId, EnvironmentMetric metric) {
        // 1. Tìm lô sản xuất
        ProductionBatch batch = batchRepository.findById(batchId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy Lô sản xuất ID: " + batchId));
            
        // 2. Gán lô sản xuất cho chỉ số này
        metric.setProductionBatch(batch);
        
        // === FIX LỖI TẠI ĐÂY: Gán thêm Farm lấy từ Lô sản xuất ===
        // Vì trong Entity bạn đặt tên biến là 'farmId' (kiểu Farm) nên setter là setFarmId
        metric.setFarmId(batch.getFarm()); 
        
        // 3. Tự động điền ngày giờ nếu thiếu
        if (metric.getRecordedAt() == null) {
            metric.setRecordedAt(LocalDateTime.now());
        }
        
        // 4. Lưu vào DB
        return metricRepository.save(metric);
    }

    public List<EnvironmentMetric> getMetricsByBatch(Long batchId) {
        return metricRepository.findByProductionBatchId(batchId);
    }
}