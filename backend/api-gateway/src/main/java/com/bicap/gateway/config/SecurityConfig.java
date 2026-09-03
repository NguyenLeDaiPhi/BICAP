package com.bicap.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    // Public paths that don't require authentication
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
            "/api/auth/**",
            "/api/trace/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/webjars/**",
            "/actuator/health",
            "/actuator/info"
    );

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(org.springframework.security.config.web.server.ServerHttpSecurity http) {
        return http
                .csrf(csrf -> csrf.disable())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(PUBLIC_PATHS.toArray(new String[0]))
                        .permitAll()
                        .anyExchange()
                        .authenticated()
                )
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint(this::handleAuthenticationError)
                        .accessDeniedHandler(this::handleAccessDeniedError)
                )
                .build();
    }

    private Mono<Void> handleAuthenticationError(ServerWebExchange exchange, org.springframework.security.core.AuthenticationException ex) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        String body = "{\"success\":false,\"code\":\"UNAUTHORIZED\",\"message\":\"Vui lòng đăng nhập để truy cập\",\"timestamp\":\"" + java.time.Instant.now() + "\"}";
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }

    private Mono<Void> handleAccessDeniedError(ServerWebExchange exchange, org.springframework.security.access.AccessDeniedException ex) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FORBIDDEN);
        response.getHeaders().add("Content-Type", "application/json");
        String body = "{\"success\":false,\"code\":\"FORBIDDEN\",\"message\":\"Bạn không có quyền truy cập tài nguyên này\",\"timestamp\":\"" + java.time.Instant.now() + "\"}";
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }
}
