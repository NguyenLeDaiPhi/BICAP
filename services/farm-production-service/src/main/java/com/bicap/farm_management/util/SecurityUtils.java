package com.bicap.farm_management.util;

import com.bicap.farm_management.entity.Farm;
import com.bicap.farm_management.repository.FarmRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Utility class để lấy thông tin user hiện tại từ JWT token
 * Sử dụng trong các Service để filter data theo user đang đăng nhập
 */
@Component
public class SecurityUtils {

    @Autowired
    private FarmRepository farmRepository;

    /**
     * Lấy userId từ request attribute (đã được JwtAuthenticationFilter set vào)
     * @return userId hoặc null nếu không tìm thấy
     */
    public Long getCurrentUserId() {
        HttpServletRequest request = getCurrentRequest();
        if (request != null) {
            Object userId = request.getAttribute("userId");
            if (userId instanceof Long) {
                return (Long) userId;
            }
        }
        return null;
    }

    /**
     * Lấy username từ SecurityContext
     * @return username hoặc null
     */
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            return authentication.getName();
        }
        return null;
    }

    /**
     * Kiểm tra user hiện tại có role cụ thể không
     * @param roleName tên role (ví dụ: "ADMIN", "FARMMANAGER")
     * @return true nếu có role
     */
    public boolean hasRole(String roleName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            String roleWithPrefix = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
            return authorities.stream()
                    .anyMatch(auth -> auth.getAuthority().equals(roleWithPrefix));
        }
        return false;
    }

    /**
     * Kiểm tra user hiện tại có phải là ADMIN không
     */
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Kiểm tra user hiện tại có phải là FARM_MANAGER không
     */
    public boolean isFarmManager() {
        return hasRole("FARMMANAGER");
    }

    /**
     * Lấy farm của user hiện tại dựa trên ownerId
     * @return Farm entity hoặc null nếu không tìm thấy
     */
    public Farm getCurrentUserFarm() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return null;
        }
        return farmRepository.findByOwnerId(userId).orElse(null);
    }

    /**
     * Lấy farm của user hiện tại, ném exception nếu không tìm thấy
     * @return Farm entity
     * @throws RuntimeException nếu không tìm thấy farm hoặc user chưa đăng ký farm
     */
    public Farm getCurrentUserFarmOrThrow() {
        Farm farm = getCurrentUserFarm();
        if (farm == null) {
            Long userId = getCurrentUserId();
            if (userId == null) {
                throw new RuntimeException("Không thể xác định user hiện tại. Vui lòng đăng nhập lại.");
            }
            throw new RuntimeException("Farm chưa được tạo cho user này. Vui lòng tạo farm trước khi thực hiện thao tác này. UserId: " + userId);
        }
        return farm;
    }

    /**
     * Kiểm tra user hiện tại đã có farm chưa
     * @return true nếu đã có farm
     */
    public boolean hasFarm() {
        return getCurrentUserFarm() != null;
    }

    /**
     * Lấy farmId của user hiện tại
     * @return farmId hoặc null
     */
    public Long getCurrentFarmId() {
        Farm farm = getCurrentUserFarm();
        return farm != null ? farm.getId() : null;
    }

    /**
     * Lấy HttpServletRequest hiện tại
     */
    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
}
