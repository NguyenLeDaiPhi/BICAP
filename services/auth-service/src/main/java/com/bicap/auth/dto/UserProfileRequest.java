package com.bicap.auth.dto;

import java.util.List;
import lombok.Data;

@Data   
public class UserProfileRequest {
    private List<String> businessLicense;
    private String address;
    private String avatar;
}
