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

    @Value("${bicap.rabbitmq.queue.response}")
    private String responseQueue;

    @Value("${bicap.rabbitmq.exchange}")
    private String exchange;
    
    @Value("${bicap.rabbitmq.routing-key.request}")
    private String requestRoutingKey;

    // THÊM: Lấy routing key response
    @Value("${bicap.rabbitmq.routing-key.response}")
    private String responseRoutingKey;

    @Bean
    public TopicExchange exchange() { return new TopicExchange(exchange); }

    @Bean
    public Queue requestQueue() { return new Queue(requestQueue, true); }

    @Bean
    public Queue responseQueue() { return new Queue(responseQueue, true); } 

    // Binding chiều gửi đi (Request)
    @Bean
    public Binding requestBinding() { 
        return BindingBuilder.bind(requestQueue()).to(exchange()).with(requestRoutingKey); 
    }
    
    // GIA CỐ: Binding chiều nhận về (Response) - QUAN TRỌNG
    // Giúp Farm Service nhận được phản hồi kể cả khi Blockchain Service khởi động lại
    @Bean
    public Binding responseBinding() { 
        return BindingBuilder.bind(responseQueue()).to(exchange()).with(responseRoutingKey); 
    }
    
    @Bean
    public MessageConverter jsonMessageConverter() { return new Jackson2JsonMessageConverter(); }
}