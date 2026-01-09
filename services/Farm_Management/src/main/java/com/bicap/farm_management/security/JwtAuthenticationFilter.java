package com.bicap.farm_management.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${bicap.app.jwtSecret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. Lấy token từ Header
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                // 2. Giải mã Token để lấy thông tin (Username & Roles)
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(getSigningKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                username = claims.getSubject(); // Lấy username
                Long userId = claims.get("userId", Long.class);
            
            if (userId != null) {
                // Lưu userId vào request attribute để Controller dùng
                request.setAttribute("userId", userId);
            }

                // 3. Nếu username tồn tại và chưa được xác thực trong Context
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    
                    // 4. Lấy Role từ Token (Quan trọng cho @PreAuthorize / hasAuthority)
                    // Bên Auth Service phải lưu role với key là "roles"
                    String rolesString = claims.get("roles", String.class);
                    
                    List<SimpleGrantedAuthority> authorities;
                    if (rolesString != null && !rolesString.isEmpty()) {
                        // Tách chuỗi "ROLE_ADMIN,ROLE_FARMER" thành danh sách quyền
                        authorities = Arrays.stream(rolesString.split(","))
                                .map(SimpleGrantedAuthority::new)
                                .collect(Collectors.toList());
                    } else {
                        authorities = Collections.emptyList();
                    }

                    // 5. Tạo đối tượng Authentication của Spring Security
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities // Nạp quyền vào đây
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // 6. Set vào SecurityContext để Spring biết user này đã đăng nhập
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                // Token lỗi, hết hạn, hoặc chữ ký sai -> Không set Authentication -> User vẫn là Anonymous
                logger.error("Cannot set user authentication: {}", e);
            }
        }

        filterChain.doFilter(request, response);
    }

    // Hàm lấy Key để verify chữ ký
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}