package com.bicap.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();
        String path = request.getPath().value();
        String method = request.getMethod().name();
        String requestId = request.getHeaders().getFirst("X-Request-Id");

        long startTime = System.currentTimeMillis();

        logger.info("[{}] {} {} - Started", requestId, method, path);

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = response.getStatusCode() != null ? response.getStatusCode().value() : 0;
            
            logger.info("[{}] {} {} - Completed with status {} in {}ms", 
                    requestId, method, path, statusCode, duration);
        })).onErrorResume(error -> {
            long duration = System.currentTimeMillis() - startTime;
            logger.error("[{}] {} {} - Error: {} after {}ms", 
                    requestId, method, path, error.getMessage(), duration);
            return Mono.error(error);
        });
    }

    @Override
    public int getOrder() {
        return -100; // Run early in the filter chain
    }
}
