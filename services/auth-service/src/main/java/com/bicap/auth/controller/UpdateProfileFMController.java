package com.bicap.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bicap.auth.dto.UserProfileRequest;
import com.bicap.auth.model.User;
import com.bicap.auth.model.UserProfile;
import com.bicap.auth.repository.UserProfileRepository;
import com.bicap.auth.repository.UserRepository;
import com.bicap.auth.service.AuthenticationUser;
import com.bicap.auth.service.UserDetailsImpl;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/update")
public class UpdateProfileFMController {

    @Autowired
    private AuthenticationUser authUser;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/profile")
    public ResponseEntity<?> updatingProfile(@RequestBody UserProfileRequest dto) {
        try {
            // Log auth for debug
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("POST /profile - Auth: " + (auth != null ? auth.getName() + " roles: " + auth.getAuthorities() : "No auth"));

            UserProfile userProfile = authUser.updateUserProfile(dto);
            if (userProfile == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Profile not found"));
            }
            return ResponseEntity.ok(userProfile);
        } catch (Exception e) {
            System.err.println("Error updating profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of(
                    "error", e.getMessage() != null ? e.getMessage() : "Unknown error",
                    "timestamp", Instant.now().toString()
                )
            );
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> fetchProfile() {
        try {
            // Log auth for debug
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("GET /profile - Auth: " + (auth != null ? auth.getName() + " roles: " + auth.getAuthorities() : "No auth"));

            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            
            User user = userRepository.findByUsername(userDetails.getUsername()) 
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            UserProfile userProfile = userProfileRepository.findByUser(user) 
                .orElse(null);
            
            if (userProfile == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Profile not found"));
            }
            
            return ResponseEntity.ok(userProfile);
        } catch (Exception e) {
            System.err.println("Error fetching profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of(
                    "error", e.getMessage() != null ? e.getMessage() : "Unknown error",
                    "timestamp", Instant.now().toString()
                )
            );
        }
    }
}