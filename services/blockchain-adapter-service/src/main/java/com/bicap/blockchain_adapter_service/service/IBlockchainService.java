package com.bicap.blockchain_adapter_service.service;

import com.bicap.blockchain_adapter_service.dto.VerifyBlockchainResponse;
import com.bicap.blockchain_adapter_service.entity.BlockchainRecord;

import java.util.Optional;

public interface IBlockchainService {

    /**
     * Ghi hash dữ liệu lên blockchain
     * @param batchId Mã lô sản xuất
     * @param resourceType Loại tài nguyên
     * @param rawData Dữ liệu gốc (sẽ được hash và lưu)
     */
    BlockchainRecord write(Long batchId, String resourceType, String rawData);

    /**
     * Xác minh tính toàn vẹn dữ liệu của một lô
     * So sánh hash đã lưu với dữ liệu gốc trong DB
     * @param batchId Mã lô cần xác minh
     * @return Kết quả xác minh (valid/invalid + message)
     */
    VerifyBlockchainResponse verify(Long batchId);

    /**
     * Xác minh với dữ liệu từ bên ngoài
     * @param batchId Mã lô
     * @param originalData Dữ liệu gốc cần xác minh
     * @return true nếu hash khớp
     */
    boolean verifyWithExternalData(Long batchId, String originalData);

    /**
     * Lấy thông tin blockchain của một batch
     * @param batchId Mã lô
     * @return Optional chứa BlockchainRecord
     */
    Optional<BlockchainRecord> getBlockchainInfo(Long batchId);
}
