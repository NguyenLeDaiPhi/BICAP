package com.bicap.trading_order_service.assistant;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assistant")
public class ShoppingAssistantController {
    private final ShoppingAssistantService service;
    public ShoppingAssistantController(ShoppingAssistantService service) { this.service = service; }
    public record Turn(@NotBlank @Pattern(regexp = "user|assistant") String role, @NotBlank @Size(max = 1200) String content) {}
    public record SearchRequest(@NotBlank @Size(max = 1200) String message, @Size(max = 8) List<@NotNull @Valid Turn> history) {}
    @PostMapping("/search")
    public ShoppingAssistantService.SearchResponse search(@Valid @RequestBody SearchRequest request) { return service.search(request); }
}
