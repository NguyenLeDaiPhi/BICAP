package com.bicap.trading_order_service.service;

import com.bicap.trading_order_service.config.RabbitMQConfig;
import com.bicap.trading_order_service.dto.CreateOrderRequest;
import com.bicap.trading_order_service.dto.OrderItemRequest;
import com.bicap.trading_order_service.dto.OrderResponse;
import com.bicap.trading_order_service.entity.MarketplaceProduct;
import com.bicap.trading_order_service.entity.Order;
import com.bicap.trading_order_service.entity.OrderItem;
import com.bicap.trading_order_service.event.OrderCompletedEvent;
import com.bicap.trading_order_service.exception.repository.MarketplaceProductRepository;
import com.bicap.trading_order_service.exception.repository.OrderRepository;

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
    public OrderResponse createOrder(
            CreateOrderRequest request,
            String buyerEmail
    ) {

        Order order = new Order();
        order.setBuyerEmail(buyerEmail);
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus("CREATED");

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {

            MarketplaceProduct product = productRepository
                    .findById(itemReq.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found: " + itemReq.getProductId()
                            )
                    );

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setProductId(product.getId());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(BigDecimal.valueOf(product.getPrice()));

            BigDecimal itemTotal =
                    item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            totalAmount = totalAmount.add(itemTotal);

            order.addItem(item);
        }

        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        return OrderResponse.fromEntity(savedOrder);
    }

    /**
     * 2️⃣ Shipping hoàn tất đơn
     */
    @Override
    @Transactional
    public OrderResponse completeOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found")
                );

        order.setStatus("COMPLETED");
        order = orderRepository.save(order);

        try {
            OrderCompletedEvent event = new OrderCompletedEvent(
                    order.getId(),
                    order.getBuyerEmail(),
                    order.getTotalAmount()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ORDER_EXCHANGE,
                    RabbitMQConfig.ORDER_COMPLETED_KEY,
                    event
            );
        } catch (Exception e) {
            System.err.println(
                    "⚠️ RabbitMQ publish failed: " + e.getMessage()
            );
        }

        return OrderResponse.fromEntity(order);
    }

    /**
     * 3️⃣ Farm xem đơn
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
                .orElseThrow(() ->
                        new RuntimeException("Order not found")
                );

        if (!"CREATED".equals(order.getStatus())) {
            throw new RuntimeException(
                    "Only CREATED orders can be confirmed"
            );
        }

        order.setStatus("CONFIRMED");
        return OrderResponse.fromEntity(
                orderRepository.save(order)
        );
    }

    /**
     * 5️⃣ Farm từ chối đơn
     */
    @Override
    @Transactional
    public OrderResponse rejectOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found")
                );

        if (!"CREATED".equals(order.getStatus())) {
            throw new RuntimeException(
                    "Only CREATED orders can be rejected"
            );
        }

        order.setStatus("REJECTED");
        return OrderResponse.fromEntity(
                orderRepository.save(order)
        );
    }

    /**
     * 6️⃣ Retailer xem đơn của tôi
     */
    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByBuyerEmail(String buyerEmail) {

        return orderRepository
                .findOrdersByBuyerEmail(buyerEmail)
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetailByIdAndBuyerEmail(
            Long orderId,
            String buyerEmail
    ) {
        Order order = orderRepository
                .findByIdAndBuyerEmail(orderId, buyerEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found or access denied"
                        )
                );

        return OrderResponse.fromEntity(order);
    }
}
