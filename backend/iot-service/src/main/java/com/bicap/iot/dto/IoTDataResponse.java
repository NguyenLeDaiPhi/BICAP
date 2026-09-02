package com.bicap.iot.dto;

import com.bicap.iot.entity.IoTData;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IoTDataResponse {
    private Long id;
    private Long farmId;
    private Long seasonId;
    private String deviceId;
    private BigDecimal temperature;
    private BigDecimal humidity;
    private BigDecimal ph;
    private BigDecimal lightIntensity;
    private BigDecimal soilMoisture;
    private Boolean isAlert;
    private String alertMessage;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;

    public static IoTDataResponse fromEntity(IoTData data) {
        return IoTDataResponse.builder()
                .id(data.getId())
                .farmId(data.getFarmId())
                .seasonId(data.getSeasonId())
                .deviceId(data.getDeviceId())
                .temperature(data.getTemperature())
                .humidity(data.getHumidity())
                .ph(data.getPh())
                .lightIntensity(data.getLightIntensity())
                .soilMoisture(data.getSoilMoisture())
                .isAlert(data.getIsAlert())
                .alertMessage(data.getAlertMessage())
                .timestamp(data.getTimestamp())
                .createdAt(data.getCreatedAt())
                .build();
    }
}
