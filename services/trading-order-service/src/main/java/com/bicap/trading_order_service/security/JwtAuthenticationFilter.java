package com.bicap.trading_order_service.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        Claims claims = jwtUtils.parseClaims(token);

        if (claims == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String username = claims.getSubject();
        String email = claims.get("email", String.class);

        // 🔥 QUAN TRỌNG: roles là STRING
        String rolesStr = claims.get("roles", String.class);

        if (rolesStr == null || rolesStr.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Tách role
        List<SimpleGrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority(rolesStr.trim()));

        JwtUser jwtUser = new JwtUser(
                username,
                email,
                List.of(rolesStr.trim())
        );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        jwtUser,
                        null,
                        authorities
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}
