package com.bicap.shipping_manager_service.controller;

import com.bicap.shipping_manager_service.entity.Shipment;
import com.bicap.shipping_manager_service.entity.ShipmentStatus;
import com.bicap.shipping_manager_service.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Cho phép Frontend gọi
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping("/list")
    public List<Shipment> getAll() {
        return shipmentService.getAllShipments();
    }

    @PostMapping("/create")
    public ResponseEntity<Shipment> create(@RequestParam Long orderId, 
                                           @RequestParam String from, 
                                           @RequestParam String to) {
        return ResponseEntity.ok(shipmentService.createShipment(orderId, from, to));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Shipment> assign(@PathVariable Long id, 
                                           @RequestParam Long driverId, 
                                           @RequestParam Long vehicleId) {
        return ResponseEntity.ok(shipmentService.assignDriverAndVehicle(id, driverId, vehicleId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Shipment> updateStatus(@PathVariable Long id, 
                                                 @RequestParam ShipmentStatus status) {
        return ResponseEntity.ok(shipmentService.updateStatus(id, status));
    }
}