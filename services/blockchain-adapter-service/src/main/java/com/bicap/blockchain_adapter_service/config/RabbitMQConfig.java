package com.bicap.blockchain_adapter_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${bicap.rabbitmq.queue.request}")
    private String requestQueueName;

    @Value("${bicap.rabbitmq.queue.response}")
    private String responseQueueName;

    @Value("${bicap.rabbitmq.exchange}")
    private String exchangeName;

    @Value("${bicap.rabbitmq.routing-key.response}")
    private String responseRoutingKey;

    // THÊM: Lấy routing key request từ file cấu hình
    @Value("${bicap.rabbitmq.routing-key.request}")
    private String requestRoutingKey;

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchangeName);
    }

    @Bean
    public Queue requestQueue() {
        return new Queue(requestQueueName, true);
    }

    @Bean
    public Queue responseQueue() {
        return new Queue(responseQueueName, true);
    }

    // GIA CỐ: Binding cho Queue nhận yêu cầu (Quan trọng)
    // Giúp Blockchain Service nhận được tin nhắn kể cả khi Farm Service chưa chạy
    @Bean
    public Binding requestBinding() {
        return BindingBuilder.bind(requestQueue()).to(exchange()).with(requestRoutingKey);
    }

    // Binding cho Queue trả lời
    @Bean
    public Binding responseBinding() {
        return BindingBuilder.bind(responseQueue()).to(exchange()).with(responseRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}