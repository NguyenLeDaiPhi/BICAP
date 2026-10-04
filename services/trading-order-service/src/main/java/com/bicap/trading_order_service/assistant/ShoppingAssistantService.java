package com.bicap.trading_order_service.assistant;

import com.bicap.trading_order_service.dto.ProductResponse;
import com.bicap.trading_order_service.service.IMarketplaceProductService;
import org.springframework.stereotype.Service;
import java.text.Normalizer;
import java.util.*;

@Service
public class ShoppingAssistantService {
    public record Filters(List<String> keywords, List<String> excludedKeywords, Double minUnitPrice, Double maxUnitPrice, Double maxTotalPrice, Double quantity, String unit, String sort, List<String> unsupportedRequirements, boolean shoppingRelated) {
        Filters normalized() {
            return new Filters(clean(keywords), clean(excludedKeywords), minUnitPrice, maxUnitPrice, maxTotalPrice, quantity, unit, sort, clean(unsupportedRequirements), shoppingRelated);
        }
        private static List<String> clean(List<String> terms) {
            if (terms == null) throw new IllegalArgumentException("Missing filter array");
            return terms.stream().filter(Objects::nonNull).map(String::trim).filter(term -> !term.isEmpty()).distinct().toList();
        }
        void validate() {
            for (var values : List.of(keywords, excludedKeywords, unsupportedRequirements)) {
                if (values.size() > 8 || values.stream().anyMatch(v -> v == null || v.isBlank() || v.length() > 80)) throw new IllegalArgumentException("Invalid terms");
            }
            for (Double value : Arrays.asList(minUnitPrice, maxUnitPrice, maxTotalPrice, quantity)) if (value != null && (!Double.isFinite(value) || value < 0 || value > 1e12)) throw new IllegalArgumentException("Invalid numeric filters");
            if (quantity != null && quantity <= 0) throw new IllegalArgumentException("Invalid quantity");
            if (!List.of("relevance", "price_asc", "price_desc", "newest").contains(sort)) throw new IllegalArgumentException("Invalid sort");
            if (unit != null && !List.of("kg", "g", "tấn", "chai", "thùng").contains(unit)) throw new IllegalArgumentException("Invalid unit");
        }
    }
    public record SearchResponse(String reply, List<ProductResponse> products, Filters filters, int totalMatches) {}
    private final ShoppingAiClient ai;
    private final IMarketplaceProductService catalog;
    public ShoppingAssistantService(ShoppingAiClient ai, IMarketplaceProductService catalog) { this.ai = ai; this.catalog = catalog; }
    public SearchResponse search(ShoppingAssistantController.SearchRequest request) {
        var filters = ai.interpret(request);
        if (!filters.shoppingRelated()) return new SearchResponse("Tôi hỗ trợ tìm nông sản đang bán. Bạn cần loại sản phẩm nào, số lượng bao nhiêu và ngân sách khoảng bao nhiêu?", List.of(), filters, 0);
        if (!filters.unsupportedRequirements().isEmpty()) return new SearchResponse("Danh mục hiện chưa có dữ liệu xác thực cho yêu cầu: " + String.join(", ", filters.unsupportedRequirements()) + ". Tôi chưa thể khẳng định sản phẩm đáp ứng các tiêu chí này. Bạn có muốn tìm theo loại sản phẩm, giá và số lượng trước không?", List.of(), filters, 0);
        if (filters.maxTotalPrice() != null && filters.quantity() == null) return new SearchResponse("Bạn muốn mua số lượng bao nhiêu và theo đơn vị nào? Tôi cần số lượng để kiểm tra tổng ngân sách.", List.of(), filters, 0);
        if (filters.quantity() != null && filters.unit() == null) return new SearchResponse("Bạn muốn mua theo đơn vị nào (kg, g, tấn, chai hay thùng)?", List.of(), filters, 0);
        var matches = catalog.getApprovedProducts().stream().filter(p -> matches(p, filters)).sorted(comparator(filters)).toList();
        String reply = matches.isEmpty() ? "Chưa có sản phẩm đã duyệt còn hàng đáp ứng yêu cầu này. Bạn có thể đổi loại sản phẩm, số lượng hoặc ngân sách." : "Tìm được " + matches.size() + " sản phẩm đã duyệt còn hàng phù hợp với yêu cầu của bạn. Giá và số lượng dưới đây được lấy từ danh mục hiện tại.";
        return new SearchResponse(reply, matches.stream().limit(6).toList(), filters, matches.size());
    }
    private boolean matches(ProductResponse product, Filters filters) {
        if (!"APPROVED".equals(product.getStatus()) || product.getQuantity() == null || product.getQuantity() <= 0 || product.getPrice() == null || !Double.isFinite(product.getPrice()) || product.getPrice() < 0) return false;
        String text = normalize(product.getName() + " " + product.getCategory() + " " + product.getDescription());
        if (!filters.keywords().stream().allMatch(word -> contains(text, word)) || filters.excludedKeywords().stream().anyMatch(word -> contains(text, word))) return false;
        double factor = conversion(product.getUnit(), filters.unit());
        if (factor < 0) return false;
        double unitPrice = product.getPrice() * factor;
        if (filters.minUnitPrice() != null && unitPrice < filters.minUnitPrice() || filters.maxUnitPrice() != null && unitPrice > filters.maxUnitPrice()) return false;
        if (filters.quantity() != null && filters.quantity() * factor > product.getQuantity()) return false;
        return filters.maxTotalPrice() == null || filters.quantity() * unitPrice <= filters.maxTotalPrice();
    }
    static double conversion(String productUnit, String requestedUnit) {
        if (requestedUnit == null) return 1;
        String from = normalize(productUnit), to = normalize(requestedUnit);
        if (from.equals(to)) return 1;
        var grams = Map.of("g", 1.0, "kg", 1000.0, "tan", 1000000.0);
        return grams.containsKey(from) && grams.containsKey(to) ? grams.get(to) / grams.get(from) : -1;
    }
    private Comparator<ProductResponse> comparator(Filters filters) {
        Comparator<ProductResponse> byPrice = Comparator.comparingDouble(p -> p.getPrice() * conversion(p.getUnit(), filters.unit()));
        if ("price_asc".equals(filters.sort())) return byPrice.thenComparing(ProductResponse::getId);
        if ("price_desc".equals(filters.sort())) return byPrice.reversed().thenComparing(ProductResponse::getId);
        return Comparator.comparing(ProductResponse::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())).thenComparing(ProductResponse::getId);
    }
    static String normalize(String value) { return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).replace('đ', 'd').trim(); }
    private boolean contains(String text, String word) {
        String term = normalize(word);
        var aliases = switch (term) {
            case "gao", "lua", "rice" -> List.of("gao", "lua", "rice");
            case "rau", "vegetable", "vegetables" -> List.of("rau", "vegetable");
            case "trai cay", "hoa qua", "fruit", "fruits" -> List.of("trai cay", "hoa qua", "fruit");
            default -> List.of(term);
        };
        return aliases.stream().anyMatch(text::contains);
    }
}
