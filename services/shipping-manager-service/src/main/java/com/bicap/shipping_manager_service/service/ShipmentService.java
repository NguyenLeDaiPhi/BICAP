package com.bicap.shipping_manager_service.service;

import com.bicap.shipping_manager_service.client.BlockchainServiceClient;
import com.bicap.shipping_manager_service.client.FarmServiceClient;
import com.bicap.shipping_manager_service.config.RabbitMQConfig;
import com.bicap.shipping_manager_service.dto.OrderResponse;
import com.bicap.shipping_manager_service.dto.ShipmentEvent;
import com.bicap.shipping_manager_service.dto.WriteBlockchainRequest;
import com.bicap.shipping_manager_service.entity.*;
import com.bicap.shipping_manager_service.repository.*;
import com.bicap.shipping_manager_service.exception.ResourceNotFoundException; // Import Exception chuẩn
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.context.SecurityContextHolder; // Import để lấy user hiện tại
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private static final Logger logger = LoggerFactory.getLogger(ShipmentService.class);
    
    private final ShipmentRepository shipmentRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final FarmServiceClient farmClient;
    private final BlockchainServiceClient blockchainClient;
    private final RabbitTemplate rabbitTemplate;
    private final Gson gson = new Gson();

    // 1. Lấy tất cả (Cho Admin/Manager)
    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    // 2. Tạo vận đơn
    public Shipment createShipment(Long orderId, String from, String to) {
        try {
            OrderResponse order = farmClient.getOrderDetails(orderId);
            if (order == null) throw new ResourceNotFoundException("Không tìm thấy đơn hàng bên Farm Service");
        } catch (Exception e) {
            logger.error("Error calling Farm Service: {}", e.getMessage());
            // Tùy chọn: Có thể throw lỗi hoặc vẫn cho tạo nhưng cảnh báo
        }

        Shipment shipment = new Shipment();
        shipment.setOrderId(orderId);
        shipment.setFromLocation(from);
        shipment.setToLocation(to);
        shipment.setStatus(ShipmentStatus.CREATED);
        
        return shipmentRepository.save(shipment);
    }

    // 3. Điều phối xe và tài xế
    public Shipment assignDriverAndVehicle(Long shipmentId, Long driverId, Long vehicleId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vận đơn ID: " + shipmentId));
        
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài xế ID: " + driverId));
        
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xe ID: " + vehicleId));

        shipment.setDriver(driver);
        shipment.setVehicle(vehicle);
        shipment.setStatus(ShipmentStatus.ASSIGNED);
        
        return shipmentRepository.save(shipment);
    }

    // 4. Cập nhật trạng thái (Dùng ResourceNotFoundException)
    public Shipment updateStatus(Long shipmentId, ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vận đơn với ID: " + shipmentId));

        shipment.setStatus(status);
        shipment.setUpdatedAt(LocalDateTime.now());
        
        Shipment saved = shipmentRepository.save(shipment);

        // --- RabbitMQ Logic: Gửi sự kiện khi giao hàng thành công ---
        if (status == ShipmentStatus.DELIVERED) {
            try {
                ShipmentEvent event = new ShipmentEvent(
                    saved.getOrderId(), 
                    "DELIVERED", 
                    "Shipment completed for ID: " + saved.getId()
                );
                
                rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE, 
                    RabbitMQConfig.ROUTING_KEY, 
                    event
                );
                logger.info("Đã gửi sự kiện DELIVERED cho Order ID: {}", saved.getOrderId());
            } catch (Exception e) {
                logger.error("Lỗi gửi RabbitMQ: {}", e.getMessage());
            }
        }
        // -----------------------------------------------------------

        // Blockchain Logic
        try {
            WriteBlockchainRequest req = new WriteBlockchainRequest(
                shipmentId, 
                "SHIPMENT_UPDATE: " + status + " | " + gson.toJson(saved)
            );
            blockchainClient.writeToBlockchain(req);
        } catch (Exception e) {
            logger.error("Blockchain write failed: {}", e.getMessage());
        }

        return saved;
    }

    // 5. API MỚI: Lấy đơn hàng của TÔI (Cho Mobile App Driver)
    public List<Shipment> getMyShipments() {
        // Lấy username từ Token
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Tìm Driver ID
        Driver driver = driverRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản '" + currentUsername + "' chưa được đăng ký làm tài xế!"));
                
        // Trả về danh sách đơn được gán cho tài xế này
        return shipmentRepository.findByDriverId(driver.getId());
    }
}