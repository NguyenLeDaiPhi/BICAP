package com.bicap.trading_order_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtils {

    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${bicap.app.jwtSecret}")
    private String jwtSecret;

    private Key getKey() {
        return Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(jwtSecret)
        );
    }

    // ================= CORE =================

    /**
     * ✅ Parse JWT claims an toàn – KHÔNG throw exception
     */
    public Claims parseClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * ✅ Validate token (signature + expiration BẮT BUỘC)
     */
    public boolean validateToken(String token) {
        Claims claims = parseClaims(token);
        if (claims == null) return false;

        Date expiration = claims.getExpiration();

        // ❌ Không chấp nhận token không có exp
        if (expiration == null) {
            log.warn("JWT token missing expiration");
            return false;
        }

        return expiration.after(new Date());
    }

    // ================= GETTERS =================

    public String getUsername(String token) {
        Claims claims = parseClaims(token);
        return claims != null ? claims.getSubject() : null;
    }

    public String getEmail(String token) {
        Claims claims = parseClaims(token);
        return claims != null ? claims.get("email", String.class) : null;
    }

    /**
     * ✅ Lấy role từ JWT
     * - Không trim ROLE_
     * - Không cho role rỗng
     */
    public List<String> getRoles(String token) {
        Claims claims = parseClaims(token);
        if (claims == null) return List.of();

        Object rolesObj = claims.get("roles");

        if (rolesObj instanceof String roleStr) {
            roleStr = roleStr.trim();
            if (!roleStr.isEmpty()) {
                return List.of(roleStr);
            }
        }

        return List.of();
    }
}
