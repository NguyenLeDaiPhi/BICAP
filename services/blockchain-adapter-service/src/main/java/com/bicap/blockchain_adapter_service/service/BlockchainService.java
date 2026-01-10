package com.bicap.blockchain_adapter_service.service;

import com.bicap.blockchain_adapter_service.dto.VerifyBlockchainResponse;
import com.bicap.blockchain_adapter_service.entity.BlockchainRecord;
import com.bicap.blockchain_adapter_service.entity.TraceLog;
import com.bicap.blockchain_adapter_service.repository.BlockchainRecordRepository;
import com.bicap.blockchain_adapter_service.repository.TraceLogRepository;

<<<<<<< HEAD
=======
import org.apache.commons.codec.digest.DigestUtils;
>>>>>>> Farm-product-service
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class BlockchainService implements IBlockchainService {

    private final BlockchainRecordRepository recordRepository;
    private final TraceLogRepository traceLogRepository;
    private final BlockchainClient blockchainClient;

    public BlockchainService(BlockchainRecordRepository recordRepository,
                             TraceLogRepository traceLogRepository,
                             BlockchainClient blockchainClient) {
        this.recordRepository = recordRepository;
        this.traceLogRepository = traceLogRepository;
        this.blockchainClient = blockchainClient;
    }

    @Override
    public void write(Long batchId, String dataHash) {

        // ✅ Validate dữ liệu đầu vào (BẮT BUỘC)
        if (batchId == null) {
            throw new IllegalArgumentException("batchId must not be null");
        }

        if (dataHash == null || dataHash.isBlank()) {
            throw new IllegalArgumentException("dataHash must not be empty");
        }

        // 1. Ghi hash lên blockchain (MOCK)
        String txHash = blockchainClient.writeHash(dataHash);

        // 2. Lưu off-chain DB
        BlockchainRecord record = new BlockchainRecord();
        record.setBatchId(batchId);
        record.setDataHash(dataHash);
        record.setBlockchainTx(txHash);
        record.setNetwork("VeChainThor");
        record.setCreatedAt(LocalDateTime.now());

        recordRepository.save(record);

<<<<<<< HEAD
        // 3. Ghi log truy vết
=======
        // 4. Ghi log truy vết
>>>>>>> Farm-product-service
        TraceLog log = new TraceLog();
        log.setObjectType("BATCH");
        log.setObjectId(batchId);
        log.setAction("WRITE_BLOCKCHAIN");
        log.setCreatedAt(LocalDateTime.now());

        traceLogRepository.save(log);
    }

    @Override
    public VerifyBlockchainResponse verify(Long batchId) {

        if (batchId == null) {
            throw new IllegalArgumentException("batchId must not be null");
        }

        BlockchainRecord record = recordRepository
                .findByBatchId(batchId)
                .orElseThrow(() ->
                        new RuntimeException("Batch not found: " + batchId)
                );

        boolean valid = blockchainClient.verifyHash(record.getDataHash());

        TraceLog log = new TraceLog();
        log.setObjectType("BATCH");
        log.setObjectId(batchId);
        log.setAction("VERIFY_BLOCKCHAIN");
        log.setCreatedAt(LocalDateTime.now());

        traceLogRepository.save(log);

        return new VerifyBlockchainResponse(
                batchId,
                valid,
                valid ? "Data is valid" : "Data has been modified"
        );
    }
}
