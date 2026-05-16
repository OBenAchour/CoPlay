package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import com.example.coplaybackend.Services.Marketplace.MarketplaceProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace-services")
@RequiredArgsConstructor
@Tag(name = "Marketplace-service-controller",
     description = "Prestations vendues (sessions de coaching, physio, nutrition...)")
public class MarketplaceServiceController {

    private final MarketplaceProductService service;

    @PostMapping
    public MarketplaceService create(@RequestParam String providerId,
                                     @RequestParam String name,
                                     @RequestParam(required = false) String description,
                                     @RequestParam BigDecimal price,
                                     @RequestParam String category) {
        return service.create(providerId, name, description, price, category);
    }

    @PatchMapping("/{serviceId}/publish")
    public MarketplaceService publish(@PathVariable String serviceId) {
        return service.publish(serviceId);
    }

    @PatchMapping("/{serviceId}/archive")
    public MarketplaceService archive(@PathVariable String serviceId) {
        return service.archive(serviceId);
    }

    @GetMapping("/{serviceId}")
    public MarketplaceService get(@PathVariable String serviceId) {
        return service.getById(serviceId);
    }

    @GetMapping
    public List<MarketplaceService> list(@RequestParam(required = false) String providerId,
                                         @RequestParam(required = false) String category) {
        if (providerId != null) return service.listByProvider(providerId);
        if (category != null) return service.listByCategory(category);
        return service.listAll();
    }
}
