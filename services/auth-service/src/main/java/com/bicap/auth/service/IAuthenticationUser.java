package com.bicap.auth.service;

import com.bicap.auth.dto.AuthRequest;
import com.bicap.auth.dto.UserProfileRequest;
import com.bicap.auth.model.User;

public interface IAuthenticationUser {
    boolean isFarmManager(String username);
    void updateUserProfile(String username, UserProfileRequest profileRequest);
    
    // Sửa trả về User thay vì void để Controller dùng được
    User registerNewUser(AuthRequest signUpRequest); 
    
    // Thêm hàm signIn
    String signIn(AuthRequest authRequest);
}