package com.bicap.iot.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "iot_thresholds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IoTThreshold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmId;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal temperatureMin;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal temperatureMax;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal humidityMin;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal humidityMax;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal phMin;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal phMax;

    private Boolean isActive = true;
}
