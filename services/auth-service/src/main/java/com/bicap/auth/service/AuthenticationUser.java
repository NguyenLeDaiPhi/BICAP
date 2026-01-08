package com.bicap.auth.service;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.bicap.auth.config.JwtUtils;
import com.bicap.auth.dto.AuthRequest;
import com.bicap.auth.dto.UserProfileRequest;
import com.bicap.auth.factory.UserRegistrationFactory;
import com.bicap.auth.model.ERole;
import com.bicap.auth.model.User;
import com.bicap.auth.model.UserProfile;
import com.bicap.auth.repository.UserProfileRepository;
import com.bicap.auth.repository.UserRepository;

@Service
public class AuthenticationUser implements IAuthenticationUser {
    @Autowired private UserRepository userRepository;
    @Autowired private UserProfileRepository userProfileRepository;
    @Autowired private UserRegistrationFactory userRegistrationFactory;
    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private ProducerMQ producerMQ;

    @Override
    public User registerNewUser(AuthRequest authRequest) {
        if (userRepository.findByUsername(authRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username already taken");
        }
        User user = userRegistrationFactory.createUser(authRequest);

        boolean isFarmManager = user.getRole().stream()
                                .anyMatch(role -> role.getName() == ERole.ROLE_FARMMANAGER);
        
        if (isFarmManager) {
            Map<String, Object> farmerData = new HashMap<>();
            farmerData.put("id", user.getId());
            farmerData.put("username", user.getUsername());
            farmerData.put("email", user.getEmail());
            farmerData.put("address", user.getUserProfile().getAddress());
            producerMQ.sendFarmUserData("CREATE_FARMER", farmerData);
        }

        return user;
    }

    @Override
    public String signIn(AuthRequest authRequest) {
        try {
            Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));
            return jwtUtils.generateJwtToken(authentication);
        } catch (BadCredentialsException e) {
            return null;
        }
    }

    @Override
    public UserProfile updateUserProfile(UserProfileRequest userProfileRequest) {

        UserProfile userProfile = new UserProfile();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByUsername(userDetailsImpl.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has FARMMANAGER role
        boolean isFarmManager = user.getRole().stream()
            .anyMatch(role -> role.getName() == ERole.ROLE_FARMMANAGER);
        
        if (!isFarmManager) {
            throw new RuntimeException("Only Farm Managers can update their profile information.");
        }

        userProfile = userProfileRepository.findByUser(user)
            .orElse(new UserProfile());
        
        if (userProfileRequest.getBusinessLicense() != null && !userProfileRequest.getBusinessLicense().isEmpty()) {
            userProfile.setBusinessLicense(userProfileRequest.getBusinessLicense());
        }

        if (userProfileRequest.getAddress() != null) {
            userProfile.setAddress(userProfileRequest.getAddress());
        }

        if (userProfileRequest.getAvatar() != null && !userProfileRequest.getAvatar().isBlank()) {
            try {
                String avatarData = userProfileRequest.getAvatar();
                // Check for and strip the data URI prefix if it exists
                if (avatarData.contains(",")) {
                    avatarData = avatarData.split(",")[1];
                }
                byte[] decodedBytes = Base64.getDecoder().decode(avatarData);
                userProfile.setAvatarBytes(decodedBytes);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid Base64 avatar data");
            }
        }

        if (userProfile.getId() == null) {
            userProfile.setUser(user);
        }

        return userProfileRepository.save(userProfile);
    }
}
