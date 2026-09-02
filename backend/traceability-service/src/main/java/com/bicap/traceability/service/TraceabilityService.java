package com.bicap.traceability.service;

import com.bicap.traceability.dto.TraceabilityResponse;

public interface TraceabilityService {
    TraceabilityResponse getTraceabilityByCode(String traceCode);
    String generateTraceCode(Long seasonId, Long farmId, Long productId, Long exportBatchId);
}
