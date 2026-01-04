package com.bicap.auth.service;

import com.bicap.auth.config.JwtUtils;
import com.bicap.auth.dto.AuthRequest;
import com.bicap.auth.dto.UserProfileRequest;
import com.bicap.auth.factory.UserRegistrationFactory;
import com.bicap.auth.model.ERole;
import com.bicap.auth.model.Role;
import com.bicap.auth.model.User;
import com.bicap.auth.model.UserProfile;
import com.bicap.auth.repository.UserProfileRepository;
import com.bicap.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class AuthenticationUser implements IAuthenticationUser {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRegistrationFactory userRegistrationFactory;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private UserProfileRepository userProfileRepository;
    
    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public boolean isFarmManager(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Set<Role> roles = user.getRoles();
        return roles.stream()
                .anyMatch(role -> role.getName().equals(ERole.ROLE_FARM_MANAGER));
    }

    @Override
    @Transactional
    public void updateUserProfile(String username, UserProfileRequest profileRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }

        profile.setFullName(profileRequest.getFullName());
        profile.setPhoneNumber(profileRequest.getPhoneNumber());
        profile.setAddress(profileRequest.getAddress());
        userProfileRepository.save(profile);
    }

    @Override
    public User registerNewUser(AuthRequest signUpRequest) { // Sửa trả về User
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = userRegistrationFactory.createUser(signUpRequest);
        User savedUser = userRepository.save(user); // Lưu user
        
        boolean isFarmManager = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(ERole.ROLE_FARM_MANAGER));
        
        if (isFarmManager) {
            UserProfile profile = new UserProfile();
            profile.setUser(savedUser);
            profile.setFullName(signUpRequest.getFullName());
            userProfileRepository.save(profile);
        }
        return savedUser;
    }

    @Override
    public String signIn(AuthRequest authRequest) { // Thêm hàm Login
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtUtils.generateJwtToken(authentication);
    }
}