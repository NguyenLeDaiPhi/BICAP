package com.bicap.trading_order_service.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // JWT → STATELESS
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // REST API không dùng CSRF
            .csrf(csrf -> csrf.disable())

            // PHÂN QUYỀN
            .authorizeHttpRequests(auth -> auth

                // test jwt
                .requestMatchers("/api/orders/me")
                    .authenticated()

                // 🛒 Retailer tạo đơn
                .requestMatchers(HttpMethod.POST, "/api/orders")
                    .hasRole("RETAILER")

                // 🌾 Farm manager
                .requestMatchers("/api/orders/by-farm/**")
                    .hasRole("FARMMANAGER")
                .requestMatchers("/api/orders/*/confirm")
                    .hasRole("FARMMANAGER")
                .requestMatchers("/api/orders/*/reject")
                    .hasRole("FARMMANAGER")

                // 🚚 Shipping manager
                .requestMatchers("/api/orders/*/complete")
                    .hasRole("SHIPPINGMANAGER")

                // còn lại chỉ cần đăng nhập
                .anyRequest()
                    .authenticated()
            )

            // JWT FILTER
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
