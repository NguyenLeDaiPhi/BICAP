package com.example.admin_service.service;

import com.example.admin_service.entity.RoleRequest;
import com.example.admin_service.entity.User; // Giả định bạn đã có User Entity
import com.example.admin_service.enums.RequestStatus;
import com.example.admin_service.repository.RoleRequestRepository;
import com.example.admin_service.repository.UserRepository; // Repository có sẵn của bạn
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoleApprovalService {

    @Autowired
    private RoleRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. User gửi yêu cầu
    public RoleRequest submitRequest(Long userId, String roleName, String docs) {
        RoleRequest request = new RoleRequest();
        request.setUserId(userId);
        request.setRequestedRoleName(roleName);
        request.setDocumentUrls(docs);
        request.setStatus(RequestStatus.PENDING);
        return requestRepository.save(request);
    }

    // 2. Admin lấy danh sách chờ duyệt
    public List<RoleRequest> getPendingRequests() {
        return requestRepository.findByStatus(RequestStatus.PENDING);
    }

    // 3. Admin DUYỆT yêu cầu
    @Transactional
    public void approveRequest(Long requestId) {
        RoleRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request has already been processed");
        }

        // Bước A: Cập nhật trạng thái đơn
        request.setStatus(RequestStatus.APPROVED);
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);

        // Bước B: Nâng cấp Role cho User thật
        // (Logic này tùy thuộc vào cách bạn lưu Role trong User Entity)
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Ví dụ: set role mới (hoặc add vào bảng user_roles tùy DB của bạn)
        // user.setRole(request.getRequestedRoleName()); 
        // userRepository.save(user); 

        System.out.println("LOG: Đã nâng cấp user " + user.getId() + " lên role " + request.getRequestedRoleName());
    }

    // 4. Admin TỪ CHỐI yêu cầu
    public void rejectRequest(Long requestId, String reason) {
        RoleRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(RequestStatus.REJECTED);
        request.setAdminNote(reason);
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);
    }
}