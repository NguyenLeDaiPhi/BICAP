package com.bicap.trading_order_service.security;

import org.springframework.security.config.Customizer;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s ->
                s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // Retailer
                .requestMatchers(HttpMethod.POST, "/api/orders")
                    .hasRole("RETAILER")

                // Farm Manager
                .requestMatchers(
                    "/api/orders/*/confirm",
                    "/api/orders/*/reject"
                ).hasRole("FARM_MANAGER")

                // Admin
                .requestMatchers("/api/orders/*/complete")
                    .hasRole("ADMIN")

                .anyRequest().authenticated()
            )

            .httpBasic(Customizer.withDefaults())
            .formLogin(form -> form.disable());

        return http.build();
    }
}
