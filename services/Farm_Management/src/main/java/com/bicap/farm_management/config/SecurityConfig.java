package com.bicap.farm_management.config;

import com.bicap.farm_management.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    // Nếu bạn có AuthenticationProvider bean thì inject vào, nếu không thì bỏ dòng này
    // private final AuthenticationProvider authenticationProvider; 

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // 1. Cho phép Swagger truy cập tự do (để bạn còn test)
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                // 2. CHỈ CHO PHÉP ADMIN VÀ FARM_MANAGER TRUY CẬP CÁC API NGHIỆP VỤ
                // Lưu ý: Spring Security tự động thêm tiền tố ROLE_ nếu dùng hasRole, 
                // nhưng vì trong DB bạn đã lưu sẵn chữ "ROLE_" (ví dụ ROLE_ADMIN), 
                // nên ta dùng hasAnyAuthority để so sánh chính xác chuỗi đó.
                .requestMatchers("/api/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_FARMMANAGER")
                
                // 3. Các request khác phải xác thực
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // .authenticationProvider(authenticationProvider) // Bỏ comment nếu có bean này
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}