package com.bicap.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bicap.auth.dto.AuthRequest;
import com.bicap.auth.model.User;
import com.bicap.auth.service.IAuthenticationUser;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private IAuthenticationUser authenticationUser;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest authRequest) {
        User user = authenticationUser.registerNewUser(authRequest);
        return ResponseEntity.ok(java.util.Map.of("id", user.getId(), "username", user.getUsername(),
                "email", user.getEmail(), "status", user.getStatus(), "roles",
                user.getRole().stream().map(role -> role.getName().name()).toList()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest authRequest) {
        String token = authenticationUser.signIn(authRequest);
        if (token != null) {
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }
}
