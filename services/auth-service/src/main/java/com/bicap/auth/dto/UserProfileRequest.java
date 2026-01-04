package com.bicap.auth.dto;

import lombok.Data;

@Data
public class UserProfileRequest {
    private String fullName;
    private String phoneNumber;
    private String address;

    // Thêm thủ công Getter/Setter để chắc chắn không lỗi "cannot find symbol"
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}