package com.example.farm_management.repository;

import com.example.farm_management.entity.ExportBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ExportBatchRepository extends JpaRepository<ExportBatch, Long> {}
