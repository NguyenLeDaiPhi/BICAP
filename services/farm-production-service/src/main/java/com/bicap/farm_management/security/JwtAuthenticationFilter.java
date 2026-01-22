package com.bicap.farm_management.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = parseJwt(request);
        if (jwt != null && jwtUtils.validateToken(jwt)) {
            Claims claims = jwtUtils.getClaimsFromToken(jwt);
                
                // 1. Extract User Details
                String username = claims.getSubject();
                Long userId = claims.get("userId", Long.class);
                String rolesStr = claims.get("roles", String.class);

                // 2. Set userId to request attribute for Controllers to use
                request.setAttribute("userId", userId);

                // 3. Convert roles to GrantedAuthority
                // Spring Security's hasRole() automatically adds "ROLE_" prefix
                // So if token has "ROLE_FARMMANAGER", we need to pass it as-is
                // If token has "FARMMANAGER", we need to add "ROLE_" prefix
                System.out.println("🔐 [JWT Filter] Raw roles from token: " + rolesStr);
                List<SimpleGrantedAuthority> authorities = Arrays.stream(rolesStr.split(","))
                        .map(role -> {
                            String trimmedRole = role.trim();
                            // If role doesn't start with ROLE_, add it
                            if (!trimmedRole.startsWith("ROLE_")) {
                                trimmedRole = "ROLE_" + trimmedRole;
                            }
                            System.out.println("🔐 [JWT Filter] Creating authority: " + trimmedRole);
                            return new SimpleGrantedAuthority(trimmedRole);
                        })
                        .collect(Collectors.toList());
                System.out.println("🔐 [JWT Filter] Total authorities: " + authorities.size());
                authorities.forEach(auth -> System.out.println("  - " + auth.getAuthority()));

                // 4. Create Authentication object
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 5. Set Security Context
                SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            String token = headerAuth.substring(7);
            if (token != null && !token.isBlank() && !"undefined".equals(token) && !"null".equals(token)) {
                return token;
            }
        }

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("auth_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}