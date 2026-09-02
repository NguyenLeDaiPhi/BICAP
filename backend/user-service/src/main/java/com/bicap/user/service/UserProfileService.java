package com.bicap.user.service;

import com.bicap.user.dto.UpdateProfileRequest;
import com.bicap.user.dto.UserProfileResponse;

public interface UserProfileService {
    UserProfileResponse getProfileByUserId(Long userId);
    UserProfileResponse createProfile(Long userId, String fullName);
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    boolean existsByUserId(Long userId);
}
