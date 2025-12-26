package com.example.logistic_service.config;

import com.example.logistic_service.services.OrderEventListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericToStringSerializer;

@Configuration
public class RedisConfig {

    // 1. Cấu hình Redis Template để GỬI tin nhắn
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setValueSerializer(new GenericToStringSerializer<>(Object.class));
        return template;
    }

    // 2. Cấu hình Container để LẮNG NGHE tin nhắn
    @Bean
    public RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory,
                                                        MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        // Lắng nghe kênh "order_created_topic"
        container.addMessageListener(listenerAdapter, new PatternTopic("order_created_topic"));
        return container;
    }

    // 3. Kết nối bộ lắng nghe với class xử lý (OrderEventListener)
    @Bean
    public MessageListenerAdapter listenerAdapter(OrderEventListener receiver) {
        // "receiveMessage" là tên hàm trong class OrderEventListener sẽ xử lý tin nhắn
        return new MessageListenerAdapter(receiver, "receiveMessage");
    }
}