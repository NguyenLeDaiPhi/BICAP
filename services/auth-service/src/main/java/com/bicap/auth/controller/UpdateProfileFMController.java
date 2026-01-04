package com.bicap.auth.controller;

import com.bicap.auth.dto.UserProfileRequest;
import com.bicap.auth.service.AuthenticationUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/farm-manager/profile")
public class UpdateProfileFMController {

    @Autowired
    private AuthenticationUser authUser;

    @PostMapping("/update")
    @PreAuthorize("hasRole('FARM_MANAGER')") // Đảm bảo chỉ Farm Manager mới được gọi
    public ResponseEntity<?> updateProfile(@RequestBody UserProfileRequest profileRequest) {
        
        // 1. Lấy user hiện tại từ Token đang đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        // 2. Truyền username + dữ liệu update vào Service
        authUser.updateUserProfile(currentUsername, profileRequest);

        return ResponseEntity.ok("Profile updated successfully");
    }
}