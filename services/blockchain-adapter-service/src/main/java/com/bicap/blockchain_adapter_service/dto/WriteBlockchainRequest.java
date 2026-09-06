package com.bicap.blockchain_adapter_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request DTO cho việc ghi dữ liệu lên blockchain
 * 
 * @author BICAP Team
 * @since 2026-09-06
 */
public class WriteBlockchainRequest {

    // =============================================
    // FIELDS
    // =============================================

    /** Mã lô sản xuất (bắt buộc) */
    @JsonProperty("batchId")
    private Long batchId;

    /** Dữ liệu gốc cần hash và lưu (bắt buộc) */
    @JsonProperty("rawData")
    private String rawData;

    /** Loại tài nguyên (tùy chọn, mặc định: BATCH) */
    @JsonProperty("resourceType")
    private String resourceType;

    /** Mã lô sản xuất dạng string (tùy chọn) */
    @JsonProperty("batchCode")
    private String batchCode;

    // =============================================
    // CONSTRUCTORS
    // =============================================

    public WriteBlockchainRequest() {
    }

    public WriteBlockchainRequest(Long batchId, String rawData) {
        this.batchId = batchId;
        this.rawData = rawData;
    }

    public WriteBlockchainRequest(Long batchId, String rawData, String resourceType) {
        this.batchId = batchId;
        this.rawData = rawData;
        this.resourceType = resourceType;
    }

    // =============================================
    // GETTERS & SETTERS
    // =============================================

    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public String getRawData() {
        return rawData;
    }

    public void setRawData(String rawData) {
        this.rawData = rawData;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getBatchCode() {
        return batchCode;
    }

    public void setBatchCode(String batchCode) {
        this.batchCode = batchCode;
    }

    // =============================================
    // UTILITY METHODS
    // =============================================

    @Override
    public String toString() {
        return "WriteBlockchainRequest{" +
                "batchId=" + batchId +
                ", resourceType='" + resourceType + '\'' +
                ", batchCode='" + batchCode + '\'' +
                ", rawDataLength=" + (rawData != null ? rawData.length() : 0) +
                '}';
    }
}
