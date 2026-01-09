package com.bicap.farm_management.service;

import com.bicap.farm_management.entity.ExportBatch;
import com.bicap.farm_management.entity.ProductListing;
import com.bicap.farm_management.entity.PurchaseOrder;
import com.bicap.farm_management.repository.ExportBatchRepository;
import com.bicap.farm_management.repository.ProductListingRepository;
import com.bicap.farm_management.repository.PurchaseOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TradingService {
    @Autowired
    private ProductListingRepository listingRepository;
    @Autowired
    private PurchaseOrderRepository orderRepository;
    @Autowired
    private ExportBatchRepository exportBatchRepository;

    // 1. Đăng bán sản phẩm (SỬA: Thêm userId để check quyền)
    public ProductListing listProductOnFloor(Long exportBatchId, ProductListing listing, Long userId) {
        ExportBatch batch = exportBatchRepository.findById(exportBatchId)
                .orElseThrow(() -> new RuntimeException("Lô xuất kho không tồn tại!"));

        // === [LOGIC MỚI] CHECK QUYỀN SỞ HỮU ===
        // ExportBatch -> ProductionBatch -> Farm -> OwnerId
        Long ownerId = batch.getProductionBatch().getFarm().getOwnerId();
        
        if (!ownerId.equals(userId)) {
            throw new RuntimeException("Bạn không có quyền đăng bán lô hàng này (Không thuộc Farm của bạn)!");
        }
        // ======================================

        listing.setExportBatch(batch);
        
        // Nếu người dùng không nhập số lượng bán, mặc định lấy hết số lượng còn trong lô
        if (listing.getAvailableQuantity() == null) {
            listing.setAvailableQuantity(batch.getQuantity());
        }
        
        listing.setListedAt(LocalDateTime.now());
        listing.setStatus("ACTIVE");
        
        return listingRepository.save(listing);
    }

    // 2. Retailer tạo đơn đặt hàng (SỬA: Tự động gán retailerId)
    public PurchaseOrder placeOrder(Long listingId, PurchaseOrder order, Long retailerId) {
        ProductListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Bài đăng không tồn tại!"));

        if (order.getQuantity() > listing.getAvailableQuantity()) {
            throw new RuntimeException("Số lượng đặt mua vượt quá số lượng còn lại!");
        }

        // === [LOGIC MỚI] TỰ ĐỘNG GÁN NGƯỜI MUA ===
        order.setRetailerId(retailerId); 
        // =========================================

        order.setProductListing(listing);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING"); // Đơn hàng mới sẽ ở trạng thái chờ duyệt
        
        // Tính tổng tiền
        if (listing.getPricePerUnit() != null) {
            order.setTotalPrice(order.getQuantity() * listing.getPricePerUnit());
        }

        return orderRepository.save(order);
    }

    // 3. Nông dân duyệt đơn hàng (SỬA: Check quyền chủ hàng)
    public PurchaseOrder approveOrder(Long orderId, Long userId) {
        PurchaseOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));
        
        ProductListing listing = order.getProductListing();

        // === [LOGIC MỚI] CHECK QUYỀN DUYỆT ĐƠN ===
        Long ownerId = listing.getExportBatch().getProductionBatch().getFarm().getOwnerId();
        if (!ownerId.equals(userId)) {
            throw new RuntimeException("Bạn không có quyền duyệt đơn hàng này!");
        }
        // =========================================

        // Trừ số lượng tồn kho
        listing.setAvailableQuantity(listing.getAvailableQuantity() - order.getQuantity());
        if (listing.getAvailableQuantity() <= 0) {
            listing.setStatus("SOLD_OUT");
        }
        listingRepository.save(listing);

        order.setStatus("CONFIRMED");
        return orderRepository.save(order);
    }

    public List<ProductListing> getActiveListings() {
        return listingRepository.findByStatus("ACTIVE");
    }
}