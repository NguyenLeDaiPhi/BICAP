package com.example.logistic_service.services;

import com.example.logistic_service.entity.Driver;
import com.example.logistic_service.entity.Shipment;
import com.example.logistic_service.repository.DriverRepository;
import com.example.logistic_service.repository.ShipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.RedisTemplate; // 1. Import Redis
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import java.time.LocalDate;
import java.util.List;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.example.logistic_service.repository")
@Service
public class LogisticsService {

    @Autowired private ShipmentRepository shipmentRepository;
    @Autowired private DriverRepository driverRepository;

    // 2. [QUAN TRỌNG] Phải khai báo biến này mới dùng được Redis
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // --- A. QUẢN LÝ TÀI XẾ & ĐỘI XE ---
    public Driver addDriver(Driver driver) {
        return driverRepository.save(driver);
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    // --- B. QUẢN LÝ CHUYẾN HÀNG (SHIPMENTS) ---
    public Shipment createShipment(Long orderId, Long farmId, Long retailerId, String pickupAddr, String deliveryAddr) {
        Shipment shipment = new Shipment();
        shipment.setOrderId(orderId);
        shipment.setFarmId(farmId);
        shipment.setRetailerId(retailerId);
        shipment.setPickupAddress(pickupAddr);
        shipment.setDeliveryAddress(deliveryAddr);
        shipment.setStatus("PENDING");

        return shipmentRepository.save(shipment);
    }

    public Shipment assignDriver(Long shipmentId, Long driverId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến hàng!"));

        if (!driverRepository.existsById(driverId)) {
            throw new RuntimeException("Tài xế không tồn tại!");
        }

        shipment.setDriverId(driverId);
        shipment.setStatus("ASSIGNED");
        return shipmentRepository.save(shipment);
    }

    // 3. Hàm này đã được sửa lại logic Return
    public Shipment updateShipmentStatus(Long shipmentId, String newStatus) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến hàng!"));

        shipment.setStatus(newStatus);

        switch (newStatus) {
            case "PICKED_UP":
                shipment.setExpectedDelivery(LocalDate.now().plusDays(1));
                sendNotification("RETAILER", shipment.getRetailerId(), "Đơn hàng #" + shipment.getOrderId() + " đã được tài xế lấy.");
                break;

            case "DELIVERED":
                shipment.setActualDelivery(LocalDate.now());
                sendNotification("FARM", shipment.getFarmId(), "Đơn hàng #" + shipment.getOrderId() + " đã giao thành công.");
                sendNotification("RETAILER", shipment.getRetailerId(), "Đơn hàng #" + shipment.getOrderId() + " đã tới nơi.");
                break;

            case "DELAYED":
                sendNotification("RETAILER", shipment.getRetailerId(), "Đơn hàng #" + shipment.getOrderId() + " gặp sự cố.");
                break;
        }

        // [SỬA ĐỔI] Lưu vào DB trước và GÁN VÀO BIẾN savedShipment
        Shipment savedShipment = shipmentRepository.save(shipment);

        // --- [REDIS LOGIC] Bây giờ mới chạy ---
        try {
            String jsonMessage = String.format(
                    "{\"orderId\": %d, \"status\": \"%s\", \"message\": \"Cập nhật từ Logistics\"}",
                    shipment.getOrderId(),
                    newStatus
            );

            // Gửi tin nhắn qua Redis
            redisTemplate.convertAndSend("shipment_update_topic", jsonMessage);
            System.out.println(">>> [REDIS SENT] Đã báo cáo trạng thái đơn #" + shipment.getOrderId());

        } catch (Exception e) {
            System.err.println("Lỗi gửi Redis: " + e.getMessage());
            // Không throw lỗi để tránh rollback transaction DB nếu Redis chết
        }

        // [SỬA ĐỔI] Cuối cùng mới trả về kết quả
        return savedShipment;
    }

    private void sendNotification(String recipientType, Long recipientId, String message) {
        System.out.println(">>> [NOTIFICATION] Gửi tới " + recipientType + " (ID: " + recipientId + "): " + message);
    }
}