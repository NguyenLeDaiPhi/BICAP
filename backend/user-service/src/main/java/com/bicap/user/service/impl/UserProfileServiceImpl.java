package com.bicap.user.service.impl;

import com.bicap.user.dto.UpdateProfileRequest;
import com.bicap.user.dto.UserProfileResponse;
import com.bicap.user.entity.UserProfile;
import com.bicap.user.exception.ResourceNotFoundException;
import com.bicap.user.repository.UserProfileRepository;
import com.bicap.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;

    @Override
    public UserProfileResponse getProfileByUserId(Long userId) {
        log.info("Getting profile for userId: {}", userId);
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Hồ sơ người dùng", "userId", userId));
        return mapToResponse(profile);
    }

    @Override
    @Transactional
    public UserProfileResponse createProfile(Long userId, String fullName) {
        log.info("Creating profile for userId: {}", userId);
        
        if (userProfileRepository.existsByUserId(userId)) {
            log.warn("Profile already exists for userId: {}", userId);
            return getProfileByUserId(userId);
        }

        UserProfile profile = UserProfile.builder()
                .userId(userId)
                .fullName(fullName)
                .isActive(true)
                .build();

        UserProfile saved = userProfileRepository.save(profile);
        log.info("Profile created successfully for userId: {}", userId);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        log.info("Updating profile for userId: {}", userId);
        
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Hồ sơ người dùng", "userId", userId));

        profile.setFullName(request.getFullName());
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            profile.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            profile.setCity(request.getCity());
        }
        if (request.getDistrict() != null) {
            profile.setDistrict(request.getDistrict());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        UserProfile updated = userProfileRepository.save(profile);
        log.info("Profile updated successfully for userId: {}", userId);
        return mapToResponse(updated);
    }

    @Override
    public boolean existsByUserId(Long userId) {
        return userProfileRepository.existsByUserId(userId);
    }

    private UserProfileResponse mapToResponse(UserProfile profile) {
        return UserProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .city(profile.getCity())
                .district(profile.getDistrict())
                .avatar(profile.getAvatar())
                .bio(profile.getBio())
                .isActive(profile.getIsActive())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
