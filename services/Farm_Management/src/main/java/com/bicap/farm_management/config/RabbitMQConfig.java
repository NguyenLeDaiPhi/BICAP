package com.bicap.farm_management.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Value("${bicap.rabbitmq.queue.request}")
    private String requestQueue;

    @Value("${bicap.rabbitmq.queue.response}") // 1. Lấy tên queue phản hồi từ file config
    private String responseQueue;

    @Value("${bicap.rabbitmq.exchange}")
    private String exchange;
    
    @Value("${bicap.rabbitmq.routing-key.request}")
    private String routingKey;

    @Bean
    public TopicExchange exchange() { return new TopicExchange(exchange); }

    @Bean
    public Queue requestQueue() { return new Queue(requestQueue); }

    // 2. QUAN TRỌNG: Khai báo Bean này để RabbitMQ tự động tạo queue nếu chưa có
    @Bean
    public Queue responseQueue() { return new Queue(responseQueue); } 

    @Bean
    public Binding binding() { 
        return BindingBuilder.bind(requestQueue()).to(exchange()).with(routingKey); 
    }
    
    @Bean
    public MessageConverter jsonMessageConverter() { return new Jackson2JsonMessageConverter(); }
}