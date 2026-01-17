package com.bicap.blockchain_adapter_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${bicap.rabbitmq.queue.request:bicap.blockchain.request.queue}")
    private String requestQueueName;

    @Value("${bicap.rabbitmq.exchange:bicap.blockchain.exchange}")
    private String exchangeName;

    @Value("${bicap.rabbitmq.routing-key.request:bicap.blockchain.request}")
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
    public Binding requestBinding() {
        return BindingBuilder.bind(requestQueue()).to(exchange()).with(requestRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() { return new Jackson2JsonMessageConverter(); }
}