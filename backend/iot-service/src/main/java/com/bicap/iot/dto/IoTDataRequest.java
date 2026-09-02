package com.bicap.iot.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class IoTDataRequest {
    
    @NotNull(message = "ID trang trại không được để trống")
    private Long farmId;

    private Long seasonId;

    private String deviceId;

    @DecimalMin(value = "-50", message = "Nhiệt độ tối thiểu là -50")
    @DecimalMax(value = "100", message = "Nhiệt độ tối đa là 100")
    private BigDecimal temperature;

    @DecimalMin(value = "0", message = "Độ ẩm tối thiểu là 0")
    @DecimalMax(value = "100", message = "Độ ẩm tối đa là 100")
    private BigDecimal humidity;

    @DecimalMin(value = "0", message = "pH tối thiểu là 0")
    @DecimalMax(value = "14", message = "pH tối đa là 14")
    private BigDecimal ph;

    private BigDecimal lightIntensity;

    private BigDecimal soilMoisture;
}
