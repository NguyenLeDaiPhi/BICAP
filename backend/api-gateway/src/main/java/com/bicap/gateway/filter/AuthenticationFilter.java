package com.bicap.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Value("${jwt.secret:bicap-secret-key-for-jwt-token-generation-min-256-bits}")
    private String jwtSecret;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().value();

            // Skip authentication for public paths
            if (isPublicPath(path)) {
                return chain.filter(exchange);
            }

            // Get Authorization header
            String authHeader = request.getHeaders().getFirst("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return unauthorizedResponse(exchange, "Thiếu token xác thực");
            }

            String token = authHeader.substring(7);

            try {
                // Validate JWT token
                if (!validateToken(token)) {
                    return unauthorizedResponse(exchange, "Token không hợp lệ hoặc đã hết hạn");
                }

                // Extract user info from token and add to headers
                String userId = extractUserId(token);
                String role = extractRole(token);

                // Add user info to request headers for downstream services
                ServerHttpRequest modifiedRequest = request.mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Role", role)
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception e) {
                return unauthorizedResponse(exchange, "Token không hợp lệ: " + e.getMessage());
            }
        };
    }

    private boolean isPublicPath(String path) {
        List<String> publicPaths = Arrays.asList(
                "/api/auth/",
                "/api/trace/",
                "/swagger-ui",
                "/v3/api-docs",
                "/swagger-resources",
                "/actuator/health"
        );

        return publicPaths.stream().anyMatch(path::startsWith);
    }

    private boolean validateToken(String token) {
        try {
            // Simple JWT validation - check format and expiration
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }

            // Decode payload (middle part)
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            
            // Check if payload contains required fields
            if (!payload.contains("\"exp\"") || !payload.contains("\"userId\"")) {
                return false;
            }

            // Check expiration
            int expIndex = payload.indexOf("\"exp\":");
            if (expIndex != -1) {
                int expStart = expIndex + 6;
                int expEnd = payload.indexOf(",", expStart);
                if (expEnd == -1) expEnd = payload.indexOf("}", expStart);
                long exp = Long.parseLong(payload.substring(expStart, expEnd).trim());
                if (System.currentTimeMillis() / 1000 > exp) {
                    return false;
                }
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String extractUserId(String token) {
        try {
            String payload = new String(java.util.Base64.getUrlDecoder().decode(token.split("\\.")[1]));
            int userIdIndex = payload.indexOf("\"userId\":");
            if (userIdIndex != -1) {
                int start = userIdIndex + 9;
                int end = payload.indexOf(",", start);
                if (end == -1) end = payload.indexOf("}", start);
                return payload.substring(start, end).replace("\"", "").trim();
            }
        } catch (Exception e) {
            // Ignore
        }
        return "";
    }

    private String extractRole(String token) {
        try {
            String payload = new String(java.util.Base64.getUrlDecoder().decode(token.split("\\.")[1]));
            int roleIndex = payload.indexOf("\"role\":");
            if (roleIndex != -1) {
                int start = roleIndex + 8;
                int end = payload.indexOf(",", start);
                if (end == -1) end = payload.indexOf("}", start);
                return payload.substring(start, end).replace("\"", "").trim();
            }
        } catch (Exception e) {
            // Ignore
        }
        return "";
    }

    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        String body = String.format(
                "{\"success\":false,\"code\":\"UNAUTHORIZED\",\"message\":\"%s\",\"timestamp\":\"%s\"}",
                message,
                java.time.Instant.now()
        );
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }

    public static class Config {
        // Configuration properties if needed
    }
}
