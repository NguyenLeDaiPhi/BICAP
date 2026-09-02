package com.bicap.iot.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IoTThresholdExceededEvent {
    private Long farmId;
    private Long seasonId;
    private BigDecimal temperature;
    private BigDecimal humidity;
    private BigDecimal ph;
    private List<String> alerts;
    private String timestamp;
}
