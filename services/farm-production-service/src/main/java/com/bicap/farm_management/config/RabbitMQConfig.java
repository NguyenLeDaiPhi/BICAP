package com.bicap.farm_management.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${bicap.farm.creation.queue:bicap.farm.creation.queue}")
    private String farmCreationQueue;

    @Value("${bicap.farm.creation.exchange:bicap.farm.exchange}")
    private String farmCreationExchange;

    @Value("${bicap.farm.creation.routing_key:farm.creation.routing_key}")
    private String farmCreationRoutingKey;

    @Bean
    public Queue farmCreationQueue() {
        return new Queue(farmCreationQueue, true);
    }

    @Bean
    public TopicExchange farmCreationExchange() {
        return new TopicExchange(farmCreationExchange);
    }

    @Bean
    public Binding farmCreationBinding() {
        return BindingBuilder.bind(farmCreationQueue()).to(farmCreationExchange()).with(farmCreationRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
