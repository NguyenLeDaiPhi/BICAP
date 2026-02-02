package com.bicap.shipping_manager_service.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                Claims claims = jwtUtils.getClaimsFromJwtToken(jwt);

                String username = claims.getSubject();
                
                // Trích xuất Roles từ Claim "roles" (được Auth Service gửi sang)
                // Lưu ý: Auth Service gửi roles như String (comma-separated), ví dụ: "ROLE_SHIPPING_MANAGER,ROLE_USER"
                String rolesString = claims.get("roles", String.class);
                List<String> roles = null;
                
                if (rolesString != null && !rolesString.isEmpty()) {
                    // Parse comma-separated string thành List
                    roles = java.util.Arrays.asList(rolesString.split(","));
                }
                
                logger.info("JWT Auth - Username: " + username + " | Roles extracted: " + roles);

                List<SimpleGrantedAuthority> authorities = (roles != null && !roles.isEmpty()) 
                    ? roles.stream()
                        .map(String::trim) // Remove whitespace
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList())
                    : Collections.emptyList();

                logger.info("JWT Auth - Authorities: " + authorities + " | Request URI: " + request.getRequestURI());

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username, null, authorities);
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                logger.warn("JWT token missing or invalid for request: " + request.getRequestURI());
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication for URI: " + request.getRequestURI() + " | Error: " + e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                String name = cookie.getName();
                if ("admin_token".equals(name) ||
                        "retailer_token".equals(name) ||
                        "farm_token".equals(name) ||
                        "shipping_manager_token".equals(name) ||
                        "shipping_driver_token".equals(name) ||
                        "auth_token".equals(name)) { // legacy fallback
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
