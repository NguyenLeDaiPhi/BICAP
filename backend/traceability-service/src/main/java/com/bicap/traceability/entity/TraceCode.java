package com.bicap.traceability.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trace_codes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TraceCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String traceCode;

    @Column(nullable = false)
    private Long seasonId;

    @Column(nullable = false)
    private Long farmId;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Long exportBatchId;

    private String qrCodeData;

    private String blockchainTxHash;

    @Column(nullable = false)
    private Boolean isVerified = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
