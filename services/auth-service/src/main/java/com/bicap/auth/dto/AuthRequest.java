package com.bicap.auth.dto;

import java.util.Set;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    // Sửa thành Set<String> để nhận mảng JSON ["admin", "user"]
    private Set<String> role;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
    
    private String fullName;
}