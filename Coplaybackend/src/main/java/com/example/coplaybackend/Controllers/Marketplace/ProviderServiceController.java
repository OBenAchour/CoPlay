package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.SearchFilter;
import com.example.coplaybackend.DTOs.Marketplace.ServiceRequest;
import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import com.example.coplaybackend.Services.Marketplace.MarketplaceSearchService;
import com.example.coplaybackend.Services.Marketplace.ProviderServiceService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace/services")
@RequiredArgsConstructor
public class ProviderServiceController {

    private final ProviderServiceService service;
    private final MarketplaceSearchService searchService;

    @PostMapping
    public ResponseEntity<MarketplaceService> create(@RequestBody ServiceRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarketplaceService> update(@PathVariable String id, @RequestBody ServiceRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceService> get(@PathVariable String id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.list(page, size));
    }

    @GetMapping("/me")
    public ResponseEntity<List<MarketplaceService>> mine() {
        return ResponseEntity.ok(service.listByProvider(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<MarketplaceService>> byProvider(@PathVariable String providerId) {
        return ResponseEntity.ok(service.listByProvider(providerId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MarketplaceService>> search(SearchFilter filter) {
        return ResponseEntity.ok(searchService.searchServices(filter));
    }

    @GetMapping("/search/nearby")
    public ResponseEntity<List<MarketplaceService>> nearby(@RequestParam double lat,
                                                          @RequestParam double lng,
                                                          @RequestParam(defaultValue = "10") double radius,
                                                          @RequestParam(required = false) String sport) {
        return ResponseEntity.ok(service.findNearby(lat, lng, radius, sport));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<MarketplaceService> uploadImage(@PathVariable String id,
                                                          @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(service.uploadImage(id, file));
    }
}
