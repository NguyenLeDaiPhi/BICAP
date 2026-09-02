package com.bicap.iot.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "iot_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IoTData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmId;

    private Long seasonId;

    private String deviceId;

    @Column(precision = 5, scale = 2)
    private BigDecimal temperature;

    @Column(precision = 5, scale = 2)
    private BigDecimal humidity;

    @Column(precision = 4, scale = 2)
    private BigDecimal ph;

    @Column(precision = 10, scale = 2)
    private BigDecimal lightIntensity;

    @Column(precision = 10, scale = 2)
    private BigDecimal soilMoisture;

    private Boolean isAlert = false;

    private String alertMessage;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
