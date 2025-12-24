package com.bicap.farm_production.config;

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

    // 1. Tạo Exchange
    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchange);
    }

    // 2. Tạo Queue Gửi đi (Request)
    @Bean
    public Queue requestQueue() {
        return new Queue(requestQueue);
    }

    // 3. Tạo Queue Nhận về (Response) - Farm Service sẽ lắng nghe cái này
    @Bean
    public Queue responseQueue() {
        return new Queue(responseQueue);
    }

    // 4. Binding Queue vào Exchange
    @Bean
    public Binding requestBinding() {
        return BindingBuilder.bind(requestQueue()).to(exchange()).with(requestRoutingKey);
    }

    // Converter để tự động chuyển Object <-> JSON
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
