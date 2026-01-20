package com.bicap.shipping_manager_service.service;

import com.bicap.shipping_manager_service.entity.*;
import com.bicap.shipping_manager_service.repository.*;
import com.bicap.shipping_manager_service.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public Shipment createShipment(Long orderId, String from, String to) {
        Shipment shipment = new Shipment();
        shipment.setOrderId(orderId);
        shipment.setFromLocation(from);
        shipment.setToLocation(to);
        shipment.setStatus(ShipmentStatus.PENDING);
        return shipmentRepository.save(shipment);
    }

    @Transactional
    public Shipment assignDriverAndVehicle(Long shipmentId, Long driverId, Long vehicleId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
        
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        shipment.setDriver(driver);
        shipment.setVehicle(vehicle);
        shipment.setStatus(ShipmentStatus.ASSIGNED);
        
        // Cập nhật trạng thái xe thành bận
        vehicle.setStatus("BUSY");
        vehicleRepository.save(vehicle);

        return shipmentRepository.save(shipment);
    }

    public Shipment updateStatus(Long id, ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
        shipment.setStatus(status);
        
        // Nếu giao xong hoặc hủy, trả xe về trạng thái sẵn sàng
        if (status == ShipmentStatus.DELIVERED || status == ShipmentStatus.CANCELLED) {
            if (shipment.getVehicle() != null) {
                Vehicle v = shipment.getVehicle();
                v.setStatus("AVAILABLE");
                vehicleRepository.save(v);
            }
        }
        
        return shipmentRepository.save(shipment);
    }

    public List<Shipment> getMyShipments() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            Long userId = ((UserDetailsImpl) principal).getId();
            // Logic thực tế: Tìm Driver theo userId rồi lấy shipment
            // return shipmentRepository.findByDriverUserId(userId);
        }
        return List.of();
    }
}
