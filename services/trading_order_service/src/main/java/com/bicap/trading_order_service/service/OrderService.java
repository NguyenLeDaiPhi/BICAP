package com.bicap.trading_order_service.service;

import com.bicap.trading_order_service.dto.CreateOrderRequest;
import com.bicap.trading_order_service.dto.OrderItemRequest;
import com.bicap.trading_order_service.dto.OrderResponse;
import com.bicap.trading_order_service.entity.Order;
import com.bicap.trading_order_service.entity.OrderItem;
import com.bicap.trading_order_service.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;


@Service
public class OrderService implements IOrderService {

    private final OrderRepository orderRepository;
    

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {

    Order order = new Order();
    order.setBuyerId(request.getBuyerId());
    order.setStatus("CREATED");

    BigDecimal totalAmount = BigDecimal.ZERO;

    for (OrderItemRequest itemRequest : request.getItems()) {

        BigDecimal itemTotal =
                itemRequest.getUnitPrice()
                           .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

        OrderItem item = new OrderItem();
        item.setProductId(itemRequest.getProductId());
        item.setQuantity(itemRequest.getQuantity());
        item.setUnitPrice(itemRequest.getUnitPrice());

        order.addItem(item);        // liên kết JPA
        totalAmount = totalAmount.add(itemTotal); // 👈 CỰC KỲ QUAN TRỌNG
    }

    order.setTotalAmount(totalAmount);

    Order savedOrder = orderRepository.save(order);

    return new OrderResponse(
            savedOrder.getId(),
            savedOrder.getTotalAmount(),
            savedOrder.getStatus(),
            savedOrder.getCreatedAt()
    );
    }

    @Override
    public OrderResponse completeOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus("COMPLETED");
        Order savedOrder = orderRepository.save(order);

        return new OrderResponse(
            savedOrder.getId(),
            savedOrder.getTotalAmount(),
            savedOrder.getStatus(),
            savedOrder.getCreatedAt()
        );
    }
    // 1️⃣ Farm xem danh sách đơn
    @Override
    public List<OrderResponse> getOrdersByFarm(Long farmId) {
        return orderRepository.findOrdersByFarmId(farmId)
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    // 2️⃣ Chấp nhận đơn
    @Override
    @Transactional
    public OrderResponse confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getStatus().equals("CREATED")) {
            throw new RuntimeException("Only CREATED orders can be confirmed");
        }

        order.setStatus("CONFIRMED");
        return OrderResponse.fromEntity(orderRepository.save(order));
    }

    // 3️⃣ Từ chối đơn
    @Override
    @Transactional
    public OrderResponse rejectOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getStatus().equals("CREATED")) {
            throw new RuntimeException("Only CREATED orders can be rejected");
        }

        order.setStatus("REJECTED");
        return OrderResponse.fromEntity(orderRepository.save(order));
    }
}
