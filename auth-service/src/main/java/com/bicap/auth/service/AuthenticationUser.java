package com.bicap.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.bicap.auth.config.JwtUtils;
import com.bicap.auth.dto.AuthRequest;
import com.bicap.auth.factory.UserRegistrationFactory;
import com.bicap.auth.model.User;
import com.bicap.auth.repository.UserRepository;

@Service
public class AuthenticationUser implements IAuthenticationUser {
    @Autowired private UserRepository userRepository;
    @Autowired private UserRegistrationFactory userRegistrationFactory;
    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtils jwtUtils;

    @Override
    public User registerNewUser(AuthRequest authRequest) {
        if (userRepository.findByUsername(authRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username already taken");
        }
        return userRegistrationFactory.createUser(authRequest);
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
}
