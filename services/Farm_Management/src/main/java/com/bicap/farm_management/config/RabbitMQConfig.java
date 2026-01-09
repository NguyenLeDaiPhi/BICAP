package com.bicap.farm_management.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${bicap.farm.auth.queue:bicap.farm.auth.queue}")
    private String authQueue;

    @Value("${bicap.auth.exchange:bicap.auth.exchange}")
    private String authExchange;

    @Value("${bicap.auth.routing_key:bicap.auth.routing.key}")
    private String authRoutingKey;

    @Value("${bicap.farm.response.queue:farm_response_queue}")
    private String farmResponseQueue;

    @Bean
    public Queue authQueue() {
        return new Queue(authQueue, true);
    }

    @Bean
    public TopicExchange authExchange() {
        return new TopicExchange(authExchange);
    }

    @Bean
    public Binding authBinding() {
        return BindingBuilder.bind(authQueue()).to(authExchange()).with(authRoutingKey);
    }

    @Bean
    public Queue farmResponseQueue() {
        return new Queue(farmResponseQueue, true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}