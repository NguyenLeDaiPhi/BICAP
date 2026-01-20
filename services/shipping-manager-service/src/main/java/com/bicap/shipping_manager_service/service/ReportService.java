package com.bicap.shipping_manager_service.service;

import com.bicap.shipping_manager_service.entity.ShipmentStatus;
import com.bicap.shipping_manager_service.repository.ShipmentRepository;
import com.bicap.shipping_manager_service.repository.DriverRepository;
import com.bicap.shipping_manager_service.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ShipmentRepository shipmentRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    public Map<String, Object> getSummaryReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalShipments", shipmentRepository.count());
        report.put("totalDrivers", driverRepository.count());
        report.put("totalVehicles", vehicleRepository.count());
        report.put("pendingShipments", shipmentRepository.findByStatus(ShipmentStatus.PENDING).size());
        return report;
    }
}
