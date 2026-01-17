package com.bicap.trading_order_service.service;

import com.bicap.trading_order_service.config.RabbitMQConfig;
import com.bicap.trading_order_service.dto.CreateOrderRequest;
import com.bicap.trading_order_service.dto.OrderItemRequest;
import com.bicap.trading_order_service.dto.OrderResponse;
import com.bicap.trading_order_service.entity.MarketplaceProduct;
import com.bicap.trading_order_service.entity.Order;
import com.bicap.trading_order_service.entity.OrderItem;
import com.bicap.trading_order_service.event.OrderCompletedEvent;
import com.bicap.trading_order_service.repository.MarketplaceProductRepository;
import com.bicap.trading_order_service.repository.OrderItemRepository;
import com.bicap.trading_order_service.repository.OrderRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService implements IOrderService {

    private final OrderRepository orderRepository;
    private final MarketplaceProductRepository productRepository;
    private final RabbitTemplate rabbitTemplate;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            MarketplaceProductRepository productRepository,
            RabbitTemplate rabbitTemplate
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * 1️⃣ Retailer tạo đơn hàng
     */
    @Override
@Transactional
public OrderResponse createOrder(CreateOrderRequest request) {

    Order order = new Order();
    order.setBuyerId(request.getBuyerId());
    order.setStatus("CREATED");

    BigDecimal totalAmount = BigDecimal.ZERO;

    for (OrderItemRequest itemReq : request.getItems()) {

        MarketplaceProduct product = productRepository
                .findById(itemReq.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        OrderItem item = new OrderItem();
        item.setProductId(product.getId());
        item.setQuantity(itemReq.getQuantity());

        BigDecimal price = BigDecimal.valueOf(product.getPrice());
        item.setUnitPrice(price);

        BigDecimal itemTotal =
                price.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
        totalAmount = totalAmount.add(itemTotal);

        // ⭐ QUAN TRỌNG
        order.addItem(item);
    }

    order.setTotalAmount(totalAmount);

    Order savedOrder = orderRepository.save(order);

    return OrderResponse.fromEntity(savedOrder);
    }


    /**
     * 2️⃣ Retailer hoàn tất đơn hàng
     * → Update trạng thái
     * → Publish event RabbitMQ
     */
    @Override
    @Transactional
    public OrderResponse completeOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus("COMPLETED");
        order = orderRepository.save(order);

        // Publish event (không cho fail business)
        try {
            OrderCompletedEvent event = new OrderCompletedEvent(
                    order.getId(),
                    order.getBuyerId(),
                    order.getTotalAmount()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ORDER_EXCHANGE,
                    RabbitMQConfig.ORDER_COMPLETED_KEY,
                    event
            );
        } catch (Exception e) {
            System.err.println("⚠️ RabbitMQ publish failed: " + e.getMessage());
        }

        return OrderResponse.fromEntity(order);
    }

    /**
     * 3️⃣ Farm xem danh sách đơn
     */
    @Override
    public List<OrderResponse> getOrdersByFarm(Long farmId) {
        return orderRepository.findOrdersByFarmId(farmId)
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    /**
     * 4️⃣ Farm xác nhận đơn
     */
    @Override
    @Transactional
    public OrderResponse confirmOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"CREATED".equals(order.getStatus())) {
            throw new RuntimeException("Only CREATED orders can be confirmed");
        }

        order.setStatus("CONFIRMED");
        return OrderResponse.fromEntity(orderRepository.save(order));
    }

    /**
     * 5️⃣ Farm từ chối đơn
     */
    @Override
    @Transactional
    public OrderResponse rejectOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"CREATED".equals(order.getStatus())) {
            throw new RuntimeException("Only CREATED orders can be rejected");
        }

        order.setStatus("REJECTED");
        return OrderResponse.fromEntity(orderRepository.save(order));
    }
}
