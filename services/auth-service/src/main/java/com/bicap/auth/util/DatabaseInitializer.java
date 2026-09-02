package com.bicap.auth.util;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.bicap.auth.model.ERole;
import com.bicap.auth.model.Role;
import com.bicap.auth.model.User;
import com.bicap.auth.model.UserStatus;
import com.bicap.auth.repository.RoleRepository;
import com.bicap.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create roles if not exist
        if (roleRepository.count() == 0) {
            for (ERole roleName : ERole.values()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
            }
        }

        // Create default admin user if not exist
        if (userRepository.findByEmail("admin@bicap.com").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@bicap.com");
            admin.setPassword(passwordEncoder.encode("12345"));
            admin.setStatus(UserStatus.ACTIVE);

            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            admin.setRole(roles);

            userRepository.save(admin);
            System.out.println("Default admin user created: admin@bicap.com / 12345");
        }
    }
}
