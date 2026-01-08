package com.bicap.auth.factory;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.bicap.auth.dto.AuthRequest;
import com.bicap.auth.model.ERole;
import com.bicap.auth.model.Role;
import com.bicap.auth.model.User;
import com.bicap.auth.model.UserProfile;
import com.bicap.auth.model.UserStatus;
import com.bicap.auth.repository.RoleRepository;

@Component
public class UserRegistrationFactory {

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private RoleRepository roleRepository;

    public User createUser(AuthRequest authRequest) {
        User user = new User();
        user.setUsername(authRequest.getUsername());
        user.setEmail(authRequest.getEmail());
        user.setPassword(encoder.encode(authRequest.getPassword()));
        user.setStatus(UserStatus.ACTIVE);

        // --- PHẦN QUAN TRỌNG: XỬ LÝ ROLE TỪ REQUEST ---
        Set<Role> roles = new HashSet<>();
        String strRole = authRequest.getRole();

        if (strRole == null || strRole.isEmpty()) {
            // Nếu không gửi role, mặc định là GUEST (hoặc USER tuỳ bạn)
            Role guestRole = roleRepository.findByName(ERole.ROLE_GUEST)
                    .orElseThrow(() -> new RuntimeException("Error: Role GUEST is not found."));
            roles.add(guestRole);
        } else {
            // Nếu có gửi role, tìm đúng role đó trong DB
            try {
                // Chuyển chuỗi "ROLE_FARMMANAGER" thành Enum ERole
                ERole roleEnum = ERole.valueOf(strRole.toUpperCase());
                
                Role userRole = roleRepository.findByName(roleEnum)
                        .orElseThrow(() -> new RuntimeException("Error: Role " + strRole + " is not found in Database."));
                roles.add(userRole);
            } catch (IllegalArgumentException e) {
                // Nếu gửi tên role linh tinh không có trong Enum -> Báo lỗi hoặc về Default
                throw new RuntimeException("Error: Role " + strRole + " is invalid.");
            }
        }

        user.setRole(roles);
        // ------------------------------------------------

        // Tạo profile mặc định
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        user.setUserProfile(profile);

        return user;
    }
}