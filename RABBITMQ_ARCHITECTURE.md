# 🐰 RabbitMQ Architecture - BICAP System

## 📋 Tổng Quan

Dự án BICAP sử dụng **RabbitMQ** làm message queue cho **inter-service communication** thay vì HTTP calls trực tiếp. CORS chỉ được sử dụng cho **frontend web applications** (browser-based).

---

## 🏗️ Kiến Trúc

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Frontend Apps  │ ─HTTP─> │  API Gateway     │ ─HTTP─> │  Backend        │
│  (Browser)      │ <─CORS─ │  (Kong)          │         │  Services       │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                                                    │
                                                                    │ RabbitMQ
                                                                    ▼
                                                          ┌──────────────────┐
                                                          │   RabbitMQ       │
                                                          │   Message Queue  │
                                                          └──────────────────┘
```

### Communication Patterns:

1. **Frontend ↔ Backend**: HTTP/REST API với CORS (cho browser)
2. **Backend ↔ Backend**: RabbitMQ Message Queue (async, decoupled)

---

## 🔧 RabbitMQ Configuration

### Exchange và Queues

#### 1. **bicap.internal.exchange** (Topic Exchange)
- Exchange chính cho internal service communication
- Type: Topic Exchange
- Durable: Yes

#### 2. Shipping Manager Service Queues:

| Queue Name | Routing Key | Purpose |
|------------|-------------|---------|
| `shipping.shipment.status.queue` | `shipment.status.routing.key` | Nhận thông báo về trạng thái vận chuyển |
| `shipping.order.request.queue` | `order.request.routing.key` | Gửi yêu cầu lấy orders |
| `shipping.order.response.queue` | `order.response.routing.key` | Nhận responses về orders |

#### 3. Farm Production Service Queues:

| Queue Name | Routing Key | Purpose |
|------------|-------------|---------|
| `bicap.farm.creation.queue` | `farm.creation.routing_key` | Farm creation events |
| `bicap.farm.auth.queue` | `bicap.auth.routing.key` | Auth-related messages |
| `farm_response_queue` | `bicap_routing_key_response` | Blockchain responses |

#### 4. Blockchain Adapter Service Queues:

| Queue Name | Routing Key | Purpose |
|------------|-------------|---------|
| `bicap.blockchain.request.queue` | `bicap.blockchain.request` | Blockchain write requests |
| `farm_response_queue` | `bicap_routing_key_response` | Blockchain write responses |

#### 5. Auth Service Queues:

| Queue Name | Routing Key | Purpose |
|------------|-------------|---------|
| `bicap.auth.response.queue` | `bicap.auth.routing.key` | Auth responses |

---

## 📨 Message Flow Examples

### Example 1: Shipment Status Update

```
Shipping Manager Service
    │
    │ sendShipmentStatusUpdate(orderId, "DELIVERED")
    ▼
RabbitMQ Exchange: bicap.internal.exchange
    │
    │ routing key: shipment.status.routing.key
    ▼
Trading Order Service (Listener)
    │
    │ Update order status
    ▼
Database
```

**Code:**
```java
// Shipping Manager Service
shipmentProducer.sendShipmentStatusUpdate(orderId, "DELIVERED");
```

### Example 2: Order Request (Request-Response Pattern)

```
Shipping Manager Service
    │
    │ requestConfirmedOrders(token, correlationId)
    ▼
RabbitMQ Exchange: bicap.internal.exchange
    │
    │ routing key: order.request.routing.key
    ▼
Trading Order Service (Listener)
    │
    │ Process request
    │ Get confirmed orders
    ▼
RabbitMQ Exchange: bicap.internal.exchange
    │
    │ routing key: order.response.routing.key
    ▼
Shipping Manager Service (Listener)
    │
    │ receiveOrderResponse(message)
    ▼
Process response
```

---

## 🔐 CORS vs RabbitMQ

### CORS (Cross-Origin Resource Sharing)
- **Mục đích**: Cho phép frontend web apps (browser) gọi API
- **Sử dụng cho**: Frontend ↔ Backend communication
- **Config**: `SecurityConfig.java` - chỉ cho phép frontend origins
- **Không dùng cho**: Inter-service communication

### RabbitMQ
- **Mục đích**: Async message queue cho inter-service communication
- **Sử dụng cho**: Backend ↔ Backend communication
- **Lợi ích**:
  - Decoupling: Services không cần biết địa chỉ của nhau
  - Scalability: Dễ scale từng service
  - Reliability: Message persistence, retry mechanism
  - Async: Không block request thread

---

## 📝 Configuration Files

### application.properties

```properties
# RabbitMQ Configuration
spring.rabbitmq.host=${SPRING_RABBITMQ_HOST:localhost}
spring.rabbitmq.port=${SPRING_RABBITMQ_PORT:5672}
spring.rabbitmq.username=${SPRING_RABBITMQ_USERNAME:root}
spring.rabbitmq.password=${SPRING_RABBITMQ_PASSWORD:root}

# Exchange và Queues
bicap.rabbitmq.exchange=bicap.internal.exchange
bicap.rabbitmq.queue.shipment.status=shipping.shipment.status.queue
bicap.rabbitmq.queue.order.request=shipping.order.request.queue
bicap.rabbitmq.queue.order.response=shipping.order.response.queue
bicap.rabbitmq.routing-key.shipment.status=shipment.status.routing.key
bicap.rabbitmq.routing-key.order.request=order.request.routing.key
bicap.rabbitmq.routing-key.order.response=order.response.routing.key
```

### docker-compose.yml

```yaml
bicap-message-queue:
  image: rabbitmq:3-management
  container_name: bicap-message-queue
  environment:
    - RABBITMQ_DEFAULT_USER=root
    - RABBITMQ_DEFAULT_PASS=root
  ports:
    - "5672:5672"    # AMQP port
    - "15672:15672"  # Management UI
  networks:
    - bicap-global-net
```

---

## 🚀 Usage Examples

### 1. Sending Message (Producer)

```java
@Service
@RequiredArgsConstructor
public class ShipmentProducer {
    private final RabbitTemplate rabbitTemplate;
    
    @Value("${bicap.rabbitmq.exchange}")
    private String exchange;
    
    @Value("${bicap.rabbitmq.routing-key.shipment.status}")
    private String routingKey;
    
    public void sendShipmentStatusUpdate(Long orderId, String status) {
        Map<String, Object> message = new HashMap<>();
        message.put("orderId", orderId);
        message.put("status", status);
        message.put("timestamp", System.currentTimeMillis());
        
        rabbitTemplate.convertAndSend(exchange, routingKey, message);
    }
}
```

### 2. Receiving Message (Consumer)

```java
@Component
public class OrderResponseListener {
    @RabbitListener(queues = "${bicap.rabbitmq.queue.order.response}")
    public void receiveOrderResponse(Map<String, Object> message) {
        // Process message
        String correlationId = (String) message.get("correlationId");
        // ...
    }
}
```

---

## ✅ Best Practices

1. **Use RabbitMQ for**:
   - Async notifications (shipment status, order updates)
   - Event-driven communication
   - Decoupled service interactions

2. **Use HTTP/REST for**:
   - Frontend API calls (với CORS)
   - Synchronous operations that need immediate response
   - External API integrations

3. **Message Format**:
   - Use JSON for complex objects
   - Include correlation IDs for request-response pattern
   - Include timestamps for debugging

4. **Error Handling**:
   - Implement dead letter queues for failed messages
   - Add retry logic for transient failures
   - Log all message operations

---

## 🔍 Monitoring

### RabbitMQ Management UI
- URL: http://localhost:15672
- Username: root
- Password: root

### Check Queues:
```bash
# List all queues
rabbitmqctl list_queues

# Check queue messages
rabbitmqctl list_queues name messages
```

---

## 📚 References

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Spring AMQP Documentation](https://spring.io/projects/spring-amqp)
- [Message Queue Patterns](https://www.rabbitmq.com/getstarted.html)

---

## 🎯 Summary

- ✅ **RabbitMQ** = Inter-service communication (async, decoupled)
- ✅ **CORS** = Frontend web apps only (browser security)
- ✅ **HTTP/REST** = Frontend API calls (synchronous)
- ❌ **Không dùng CORS** cho inter-service communication
