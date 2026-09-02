package com.bicap.traceability.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TraceabilityResponse {
    
    // Product Info
    private ProductInfo product;
    
    // Farm Info
    private FarmInfo farm;
    
    // Season Info
    private SeasonInfo season;
    
    // Farming Process
    private List<ProcessInfo> farmingProcesses;
    
    // IoT Summary
    private IoTSummary iotSummary;
    
    // Shipment Info
    private ShipmentInfo shipment;
    
    // Blockchain Info
    private BlockchainInfo blockchain;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductInfo {
        private Long id;
        private String name;
        private String description;
        private String origin;
        private String certification;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FarmInfo {
        private Long id;
        private String name;
        private String address;
        private String ownerName;
        private String licenseNumber;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeasonInfo {
        private Long id;
        private String seasonName;
        private LocalDateTime startDate;
        private LocalDateTime expectedHarvestDate;
        private LocalDateTime actualHarvestDate;
        private String status;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProcessInfo {
        private Long id;
        private String processType;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String performedBy;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IoTSummary {
        private BigDecimal avgTemperature;
        private BigDecimal avgHumidity;
        private BigDecimal avgPh;
        private String lastUpdated;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShipmentInfo {
        private String shipmentCode;
        private LocalDateTime pickupTime;
        private LocalDateTime deliveryTime;
        private String driverName;
        private String vehiclePlate;
        private String status;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BlockchainInfo {
        private String transactionHash;
        private String status;
        private String verifiedAt;
        private Boolean isValid;
    }
}
