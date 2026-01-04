package com.bicap.auth.factory;

import com.bicap.auth.dto.AuthRequest;
import com.bicap.auth.model.ERole;
import com.bicap.auth.model.Role;
import com.bicap.auth.model.User;
import com.bicap.auth.model.UserStatus;
import com.bicap.auth.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class UserRegistrationFactory {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    public User createUser(AuthRequest signUpRequest) {
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setStatus(UserStatus.ACTIVE);

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_GUEST)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase().trim()) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "farm_manager":
                    case "farmmanager":
                        // Đã sửa: ROLE_FARM_MANAGER
                        Role farmRole = roleRepository.findByName(ERole.ROLE_FARM_MANAGER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(farmRole);
                        break;
                    case "retailer":
                        Role retailerRole = roleRepository.findByName(ERole.ROLE_RETAILER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(retailerRole);
                        break;
                    case "shipping_manager":
                    case "shippingmanager":
                        // Đã sửa: ROLE_SHIPPING_MANAGER
                        Role shipRole = roleRepository.findByName(ERole.ROLE_SHIPPING_MANAGER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(shipRole);
                        break;
                    case "delivery_driver":
                    case "driver":
                        // Đã sửa: ROLE_DELIVERY_DRIVER
                        Role driverRole = roleRepository.findByName(ERole.ROLE_DELIVERY_DRIVER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(driverRole);
                        break;
                    default:
                        Role guestRole = roleRepository.findByName(ERole.ROLE_GUEST)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(guestRole);
                }
            });
        }

        // Đã sửa: setRoles (số nhiều)
        user.setRoles(roles);
        return user;
    }
}