package com.bicap.farm_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bicap.farm_management.entity.ExportBatch; // Nhớ import List

@Repository
public interface ExportBatchRepository extends JpaRepository<ExportBatch, Long> {
    // THÊM DÒNG NÀY: Để tìm các đợt xuất hàng thuộc về một lô sản xuất cụ thể
    List<ExportBatch> findByProductionBatchId(Long productionBatchId);
}