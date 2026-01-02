package com.bicap.trading_order_service.service;

import com.bicap.trading_order_service.config.RabbitMQConfig;
import com.bicap.trading_order_service.dto.CreateOrderRequest;
import com.bicap.trading_order_service.dto.OrderItemRequest;
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
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService implements IOrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MarketplaceProductRepository productRepository;
    private final RabbitTemplate rabbitTemplate;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        MarketplaceProductRepository productRepository,
                        RabbitTemplate rabbitTemplate) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Retailer tạo đơn hàng
     */
    @Override
    @Transactional
    public Order createOrder(CreateOrderRequest request) {

        Order order = new Order();
        order.setBuyerId(request.getBuyerId());
        order.setStatus("CREATED");
        order.setTotalAmount(BigDecimal.ZERO);

        // Lưu order trước để có order_id
        order = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {

            MarketplaceProduct product = productRepository
                    .findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(product.getId());
            item.setQuantity(itemReq.getQuantity());

            // Snapshot giá tại thời điểm mua
            item.setUnitPrice(product.getPrice());

            total = total.add(
                    product.getPrice()
                           .multiply(BigDecimal.valueOf(itemReq.getQuantity()))
            );

            items.add(item);
        }

        orderItemRepository.saveAll(items);

        order.setTotalAmount(total);
        return orderRepository.save(order);
    }

    /**
     * Retailer hoàn tất đơn hàng
     * → Update trạng thái
     * → Publish event cho Blockchain Adapter
     */
   @Override
@Transactional
public Order completeOrder(Long orderId) {

    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    order.setStatus("COMPLETED");
    order = orderRepository.save(order);

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
        System.out.println("RabbitMQ publish skipped: " + e.getMessage());
    }

    return order;
}
}
