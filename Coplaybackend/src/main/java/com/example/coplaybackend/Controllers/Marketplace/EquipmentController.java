package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.EquipmentRequest;
import com.example.coplaybackend.DTOs.Marketplace.SearchFilter;
import com.example.coplaybackend.Entities.Marketplace.Equipment;
import com.example.coplaybackend.Services.Marketplace.EquipmentService;
import com.example.coplaybackend.Services.Marketplace.MarketplaceSearchService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final MarketplaceSearchService searchService;

    @PostMapping
    public ResponseEntity<Equipment> create(@RequestBody EquipmentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipmentService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipment> update(@PathVariable String id, @RequestBody EquipmentRequest req) {
        return ResponseEntity.ok(equipmentService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        equipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> get(@PathVariable String id) {
        return ResponseEntity.ok(equipmentService.getAndIncrementViews(id));
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(equipmentService.list(page, size));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Equipment>> mine() {
        return ResponseEntity.ok(equipmentService.listBySeller(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Equipment>> bySeller(@PathVariable String sellerId) {
        return ResponseEntity.ok(equipmentService.listBySeller(sellerId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Equipment>> search(SearchFilter filter) {
        return ResponseEntity.ok(searchService.searchEquipments(filter));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<Equipment> uploadImage(@PathVariable String id,
                                                 @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(equipmentService.uploadImage(id, file));
    }

    @DeleteMapping("/{id}/images")
    public ResponseEntity<Equipment> removeImage(@PathVariable String id, @RequestParam String ref) {
        return ResponseEntity.ok(equipmentService.removeImage(id, ref));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Equipment> updateStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(equipmentService.updateStatus(id, status));
    }
}
