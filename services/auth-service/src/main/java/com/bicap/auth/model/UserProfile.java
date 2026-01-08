package com.bicap.auth.model;

import java.util.Base64;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;

@Data
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Convert(converter = StringListConverter.class)
    @Column(name = "business_license", nullable = true)
    private List<String> businessLicense;

    @Column(name = "address", nullable = true)
    private String address;

    @Column(name = "avatar", columnDefinition =  "LONGBLOB")
    @Lob
    private byte[] avatarBytes;

    @Transient
    private String avatarBase64;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name="user_id", nullable = false, unique = true)
    private User user;

    @JsonProperty("avatarBase64")
    public String getAvatarBase64() {
        if (avatarBytes != null) {
            return Base64.getEncoder().encodeToString(avatarBytes);
        }
        return null;
    }

    public void setAvatarBase64(String base64) {
        if (base64 != null && !base64.isBlank()) {
            this.avatarBytes = Base64.getDecoder().decode(base64);
        } else {
            this.avatarBytes = null;
        }
    }
}