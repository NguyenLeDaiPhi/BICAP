package com.bicap.auth.config;

import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import com.bicap.auth.service.UserDetailsImpl;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
    
    @Value("${bicap.app.jwtSecret}")
    private String jwtSecret;

    @Value("${bicap.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrinciple = (UserDetailsImpl) authentication.getPrincipal();

        String roles = userPrinciple.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(","));
        
        return Jwts.builder() 
            .subject(userPrinciple.getUsername())
            .claim("email", userPrinciple.getEmail())
            .claim("roles", roles)
            .issuer("retailer-app")
            .issuedAt(new Date())
            .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
            .signWith(key())
            .compact();
    }

    private Key key() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Deprecated
    public String getUserNameFromJwtToken(String token) {
    return Jwts.parser().setSigningKey(key()).build()
               .parseClaimsJws(token).getBody().getSubject();
    }

    @Deprecated
    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
        logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
        logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
        logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
        logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}

