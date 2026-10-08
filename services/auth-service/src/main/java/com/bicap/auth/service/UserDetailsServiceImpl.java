package com.bicap.auth.service;

import com.bicap.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username == null || username.isBlank()) throw new UsernameNotFoundException("User not found");
        var users = userRepository.findByUsernameOrEmailList(username.trim());
        if (users.size() != 1) throw new UsernameNotFoundException("User identity is missing or ambiguous");
        return UserDetailsImpl.build(users.get(0));
    }

    @Transactional
    public UserDetails loadUserById(Long userId) {
        return UserDetailsImpl.build(userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));
    }
}
