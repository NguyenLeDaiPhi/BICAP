package com.example.admin_service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTests {
    private final String adminSecret = Base64.getEncoder().encodeToString(
            "admin-test-secret-at-least-32-bytes-long".getBytes(StandardCharsets.UTF_8));
    private final String defaultSecret = Base64.getEncoder().encodeToString(
            "default-test-secret-at-least-32-bytes-long".getBytes(StandardCharsets.UTF_8));

    private JwtUtils validator() {
        JwtUtils utils = new JwtUtils();
        ReflectionTestUtils.setField(utils, "jwtSecretAdmin", adminSecret);
        ReflectionTestUtils.setField(utils, "jwtSecret", defaultSecret);
        return utils;
    }

    private String token(String secret, Date expiration) {
        return Jwts.builder().setSubject("admin").claim("roles", "ROLE_ADMIN")
                .setExpiration(expiration)
                .signWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret))).compact();
    }

    @Test
    void validatesDefaultKeyAfterDifferentAdminKey() {
        JwtUtils utils = validator();
        String token = token(defaultSecret, new Date(System.currentTimeMillis() + 60_000));
        assertTrue(utils.validateToken(token));
        assertEquals("admin", utils.getUserNameFromJwtToken(token));
        assertEquals("ROLE_ADMIN", utils.getRolesFromJwtToken(token).get(0));
    }

    @Test
    void validatesAdminKey() {
        assertTrue(validator().validateToken(token(adminSecret,
                new Date(System.currentTimeMillis() + 60_000))));
    }

    @Test
    void rejectsExpiredOrMalformedTokens() {
        JwtUtils utils = validator();
        assertFalse(utils.validateToken(token(defaultSecret, new Date(0))));
        assertFalse(utils.validateToken("invalid-token"));
    }
}
