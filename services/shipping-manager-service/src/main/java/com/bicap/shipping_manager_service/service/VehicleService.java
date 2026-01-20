package com.bicap.shipping_manager_service.service;

import com.bicap.shipping_manager_service.entity.Vehicle;
import com.bicap.shipping_manager_service.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {
    private final VehicleRepository vehicleRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        if (vehicle.getStatus() == null) vehicle.setStatus("AVAILABLE");
        return vehicleRepository.save(vehicle);
    }
}
