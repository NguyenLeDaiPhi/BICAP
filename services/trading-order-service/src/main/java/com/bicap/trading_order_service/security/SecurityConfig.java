package com.bicap.trading_order_service.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;

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
            // ===============================
            // STATELESS JWT
            // ===============================
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ===============================
            // CSRF OFF (REST API không dùng CSRF)
            // ===============================
            .csrf(csrf -> csrf.disable())

            // ===============================
            // PHÂN QUYỀN (AUTHORIZATION)
            // ===============================
            .authorizeHttpRequests(auth -> auth

                // ===== PRE-FLIGHT =====
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/assistant/search").permitAll()

                // ===== SWAGGER =====
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll()

                // ===== PUBLIC APIs =====
                .requestMatchers(HttpMethod.GET, "/api/v1/categories/**")
                    .permitAll()
                .requestMatchers(HttpMethod.GET, "/api/fetch-marketplace-products")
                    .permitAll()
                .requestMatchers(new RegexRequestMatcher("^/api/fetch-marketplace-products/[0-9]+$", "GET"))
                    .permitAll()
                .requestMatchers(HttpMethod.POST, "/api/fetch-marketplace-products")
                    .hasRole("FARMMANAGER")

                // 🔓 Allow error page
                .requestMatchers("/error", "/error/**")
                    .permitAll()

                // 🔓 Internal Admin API - cho phép admin-service gọi internal
                .requestMatchers("/api/admin/**")
                    .permitAll()

                // ===== ADMIN =====
                .requestMatchers("/api/v1/admin/**")
                    .hasRole("ADMIN")

                // ===== TEST JWT =====
                .requestMatchers("/api/orders/me")
                    .authenticated()

                // ===== PAYMENT =====
                .requestMatchers("/api/payments/**")
                    .hasRole("RETAILER")

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

                // ===== DEFAULT - còn lại chỉ cần đăng nhập =====
                .anyRequest()
                    .authenticated()
            )

            // ===============================
            // JWT FILTER
            // ===============================
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
