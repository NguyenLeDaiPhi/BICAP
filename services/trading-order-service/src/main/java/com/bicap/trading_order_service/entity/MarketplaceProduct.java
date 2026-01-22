package com.bicap.trading_order_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_products")
@Data  // or keep manual getters/setters if you prefer
public class MarketplaceProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category;
    @Column(length = 1000)
    private String description;
    private Integer quantity;
    private String unit;
    private Double price; 
    private String imageUrl;
    private String batchId;
    private String status;
    private LocalDateTime createdAt;

<<<<<<< HEAD
=======
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "ban_reason", columnDefinition = "TEXT")
    private String banReason;

>>>>>>> admin_service
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_manager_id")
    @JsonBackReference
    private FarmManager farmManager;

    // Derived method if you need farmId often
    @Transient
    public Long getFarmId() {
        return farmManager != null ? farmManager.getFarmId() : null;
    }
}