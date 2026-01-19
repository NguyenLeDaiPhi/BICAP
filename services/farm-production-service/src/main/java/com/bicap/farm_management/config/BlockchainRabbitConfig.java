package com.bicap.farm_management.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BlockchainRabbitConfig {

    @Value("${bicap.blockchain.exchange}")
    private String exchangeName;

    @Value("${bicap.blockchain.routing_key}")
    private String routingKey;

    // Tên queue cứng để đảm bảo khớp với bên Blockchain Adapter
    private final String queueName = "bicap.blockchain.request.queue";

    @Bean
    public TopicExchange blockchainExchange() {
        return new TopicExchange(exchangeName);
    }

    @Bean
    public Queue blockchainQueue() {
        // durable = true để giữ tin nhắn khi RabbitMQ khởi động lại
        return new Queue(queueName, true);
    }

    @Bean
    public Binding blockchainBinding() {
        return BindingBuilder.bind(blockchainQueue()).to(blockchainExchange()).with(routingKey);
    }
}
