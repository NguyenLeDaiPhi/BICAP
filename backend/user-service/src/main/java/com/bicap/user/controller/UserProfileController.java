package com.bicap.user.controller;

import com.bicap.user.dto.ApiResponse;
import com.bicap.user.dto.UpdateProfileRequest;
import com.bicap.user.dto.UserProfileResponse;
import com.bicap.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Quản lý hồ sơ người dùng")
@SecurityRequirement(name = "bearerAuth")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin hồ sơ của tôi", description = "Trả về thông tin hồ sơ của người dùng đang đăng nhập")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(
            @RequestHeader("X-User-Id") Long userId) {
        UserProfileResponse profile = userProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật hồ sơ của tôi", description = "Cập nhật thông tin hồ sơ người dùng đang đăng nhập")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse profile = userProfileService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ thành công", profile));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin hồ sơ theo ID", description = "Trả về thông tin hồ sơ của người dùng theo ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfileById(
            @PathVariable Long id) {
        UserProfileResponse profile = userProfileService.getProfileByUserId(id);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
