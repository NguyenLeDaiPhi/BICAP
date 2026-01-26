package com.bicap.blockchain_adapter_service.controller;

import com.bicap.blockchain_adapter_service.dto.BlockchainRecordResponse;
import com.bicap.blockchain_adapter_service.dto.BlockchainStatsResponse;
import com.bicap.blockchain_adapter_service.dto.VerifyBlockchainResponse;
import com.bicap.blockchain_adapter_service.dto.WriteBlockchainRequest;
import com.bicap.blockchain_adapter_service.entity.BlockchainRecord;
import com.bicap.blockchain_adapter_service.repository.BlockchainRecordRepository;
import com.bicap.blockchain_adapter_service.service.IBlockchainService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/blockchain")
public class BlockchainController {

    private final IBlockchainService blockchainService;
    private final BlockchainRecordRepository recordRepository;

    public BlockchainController(
            IBlockchainService blockchainService,
            BlockchainRecordRepository recordRepository
    ) {
        this.blockchainService = blockchainService;
        this.recordRepository = recordRepository;
    }

    @PostMapping("/write")
    public ResponseEntity<String> writeToBlockchain(
            @RequestBody WriteBlockchainRequest request) {

        // ✅ Validate request ngay tại controller
        if (request == null
                || request.getBatchId() == null
                || request.getRawData() == null
                || request.getRawData().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("batchId and rawData are required");
        }

        blockchainService.write(
                request.getBatchId(),
                "BATCH",
                request.getRawData()
        );

        return ResponseEntity.ok("Written to blockchain");
    }

    @GetMapping("/verify/{batchId}")
    public ResponseEntity<VerifyBlockchainResponse> verify(
            @PathVariable Long batchId) {

        if (batchId == null) {
            return ResponseEntity.badRequest().build();
        }

        VerifyBlockchainResponse response =
                blockchainService.verify(batchId);

        return ResponseEntity.ok(response);
    }

    /**
     * =======================
     * ADMIN – SMART CONTRACT MANAGEMENT
     * =======================
     */

    @GetMapping("/records")
    public ResponseEntity<List<BlockchainRecordResponse>> getAllRecords() {
        List<BlockchainRecord> records = recordRepository.findAll();
        List<BlockchainRecordResponse> responses = records.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/records/{id}")
    public ResponseEntity<BlockchainRecordResponse> getRecordById(@PathVariable Long id) {
        BlockchainRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blockchain record not found: " + id));
        return ResponseEntity.ok(toResponse(record));
    }

    @GetMapping("/records/batch/{batchId}")
    public ResponseEntity<BlockchainRecordResponse> getRecordByBatchId(@PathVariable Long batchId) {
        BlockchainRecord record = recordRepository.findByBatchId(batchId)
                .orElseThrow(() -> new RuntimeException("Blockchain record not found for batch: " + batchId));
        return ResponseEntity.ok(toResponse(record));
    }

    @GetMapping("/stats")
    public ResponseEntity<BlockchainStatsResponse> getStats() {
        long totalRecords = recordRepository.count();
        long recordsToday = recordRepository.findAll().stream()
                .filter(r -> r.getCreatedAt().toLocalDate().equals(java.time.LocalDate.now()))
                .count();

        BlockchainStatsResponse stats = new BlockchainStatsResponse();
        stats.setTotalRecords(totalRecords);
        stats.setRecordsToday(recordsToday);
        stats.setNetwork("VeChainThor");

        return ResponseEntity.ok(stats);
    }

    private BlockchainRecordResponse toResponse(BlockchainRecord record) {
        BlockchainRecordResponse response = new BlockchainRecordResponse();
        response.setId(record.getId());
        response.setBatchId(record.getBatchId());
        response.setDataHash(record.getDataHash());
        response.setBlockchainTx(record.getBlockchainTx());
        response.setNetwork(record.getNetwork());
        response.setCreatedAt(record.getCreatedAt());
        return response;
    }
}
