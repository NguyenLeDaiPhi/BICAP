package com.bicap.farm_management.repository;

import com.bicap.farm_management.entity.ExportBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExportBatchRepository extends JpaRepository<ExportBatch, Long> {
    List<ExportBatch> findByProductionBatch_Farm_Id(Long farmId);
}