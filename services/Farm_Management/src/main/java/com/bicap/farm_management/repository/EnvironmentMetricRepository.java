package com.bicap.farm_management.repository;

import com.bicap.farm_management.entity.EnvironmentMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnvironmentMetricRepository extends JpaRepository<EnvironmentMetric, Long> {
    // Tìm các chỉ số môi trường theo Lô sản xuất
    List<EnvironmentMetric> findByProductionBatchId(Long batchId);
}