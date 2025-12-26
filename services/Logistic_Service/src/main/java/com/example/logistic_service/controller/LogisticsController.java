package com.example.logistic_service.controller;

import com.example.logistic_service.entity.Driver;
import com.example.logistic_service.entity.Shipment;
import com.example.logistic_service.services.LogisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logistics")
public class LogisticsController {

    @Autowired
    private LogisticsService logisticsService;

    // --- QUẢN LÝ TÀI XẾ ---

    @PostMapping("/drivers")
    public ResponseEntity<Driver> createDriver(@RequestBody Driver driver) {
        return ResponseEntity.ok(logisticsService.addDriver(driver));
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<Driver>> getAllDrivers() {
        return ResponseEntity.ok(logisticsService.getAllDrivers());
    }

    // --- QUẢN LÝ CHUYẾN HÀNG ---

    // 1. Tạo chuyến hàng mới (Dành cho Admin hoặc System gọi tự động)
    // Dữ liệu nhận vào thường là DTO, nhưng ở đây mình để Param cho đơn giản
    @PostMapping("/shipments")
    public ResponseEntity<Shipment> createShipment(
            @RequestParam Long orderId,
            @RequestParam Long farmId,
            @RequestParam Long retailerId,
            @RequestParam String pickupAddress,
            @RequestParam String deliveryAddress) {

        return ResponseEntity.ok(logisticsService.createShipment(orderId, farmId, retailerId, pickupAddress, deliveryAddress));
    }

    // 2. Điều phối xe (Gán tài xế cho đơn hàng)
    @PutMapping("/shipments/{shipmentId}/assign/{driverId}")
    public ResponseEntity<Shipment> assignDriver(@PathVariable Long shipmentId, @PathVariable Long driverId) {
        return ResponseEntity.ok(logisticsService.assignDriver(shipmentId, driverId));
    }

    // 3. Tài xế cập nhật trạng thái (Sẽ tự động bắn thông báo)
    // status: PICKED_UP, DELIVERED, DELAYED
    @PutMapping("/shipments/{shipmentId}/status")
    public ResponseEntity<Shipment> updateStatus(@PathVariable Long shipmentId, @RequestParam String status) {
        return ResponseEntity.ok(logisticsService.updateShipmentStatus(shipmentId, status));
    }
}