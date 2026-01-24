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
            // ===============================
            // STATELESS JWT
            // ===============================
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ===============================
            // CSRF OFF (REST API)
            // ===============================
            .csrf(csrf -> csrf.disable())

            // ===============================
            // AUTHORIZATION
            // ===============================
            .authorizeHttpRequests(auth -> auth

                // ===== PRE-FLIGHT =====
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ===== SWAGGER =====
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll()

                // ===== PUBLIC APIs =====
                .requestMatchers(HttpMethod.GET, "/api/v1/categories/**")
                    .permitAll()

                // ===== INTERNAL SERVICE CALL =====
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

                // ===== RETAILER =====
                .requestMatchers(HttpMethod.POST, "/api/orders")
                    .hasRole("RETAILER")

                // ===== FARM MANAGER =====
                .requestMatchers("/api/orders/by-farm/**")
                    .hasRole("FARMMANAGER")
                .requestMatchers("/api/orders/*/confirm")
                    .hasRole("FARMMANAGER")
                .requestMatchers("/api/orders/*/reject")
                    .hasRole("FARMMANAGER")

                // ===== SHIPPING MANAGER =====
                .requestMatchers("/api/orders/*/complete")
                    .hasRole("SHIPPINGMANAGER")

                // ===== DEFAULT =====
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
