package com.bicap.traceability.repository;

import com.bicap.traceability.entity.TraceCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TraceCodeRepository extends JpaRepository<TraceCode, Long> {
    Optional<TraceCode> findByTraceCode(String traceCode);
    boolean existsByTraceCode(String traceCode);
}
