package com.bicap.traceability.service.impl;

import com.bicap.traceability.dto.TraceabilityResponse;
import com.bicap.traceability.entity.TraceCode;
import com.bicap.traceability.exception.ResourceNotFoundException;
import com.bicap.traceability.repository.TraceCodeRepository;
import com.bicap.traceability.service.TraceabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TraceabilityServiceImpl implements TraceabilityService {

    private final TraceCodeRepository traceCodeRepository;

    @Override
    @Transactional
    public String generateTraceCode(Long seasonId, Long farmId, Long productId, Long exportBatchId) {
        log.info("Generating trace code for season: {}", seasonId);

        // Generate trace code format: BICAP-TRC-YYYY-NNNNNN
        int year = java.time.Year.now().getValue();
        long count = traceCodeRepository.count() + 1;
        String traceCode = String.format("BICAP-TRC-%d-%06d", year, count);

        // Generate QR code data
        String qrData = "https://bicap.vn/trace/" + traceCode;

        // Create trace code record
        TraceCode trace = TraceCode.builder()
                .traceCode(traceCode)
                .seasonId(seasonId)
                .farmId(farmId)
                .productId(productId)
                .exportBatchId(exportBatchId)
                .qrCodeData(qrData)
                .isVerified(false)
                .build();

        traceCodeRepository.save(trace);
        log.info("Trace code generated: {}", traceCode);

        return traceCode;
    }

    @Override
    public TraceabilityResponse getTraceabilityByCode(String traceCode) {
        log.info("Getting traceability for code: {}", traceCode);

        TraceCode trace = traceCodeRepository.findByTraceCode(traceCode)
                .orElseThrow(() -> new ResourceNotFoundException("Mã truy xuất", "traceCode", traceCode));

        // Build response - in production, this would call other services to get full data
        TraceabilityResponse response = TraceabilityResponse.builder()
                .product(TraceabilityResponse.ProductInfo.builder()
                        .id(trace.getProductId())
                        .name("Nông sản")
                        .origin("Việt Nam")
                        .build())
                .farm(TraceabilityResponse.FarmInfo.builder()
                        .id(trace.getFarmId())
                        .name("Trang trại")
                        .address("Địa chỉ trang trại")
                        .build())
                .season(TraceabilityResponse.SeasonInfo.builder()
                        .id(trace.getSeasonId())
                        .seasonName("Mùa vụ")
                        .build())
                .blockchain(TraceabilityResponse.BlockchainInfo.builder()
                        .transactionHash(trace.getBlockchainTxHash())
                        .isValid(trace.getIsVerified())
                        .build())
                .build();

        return response;
    }
}
