package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Equipment;
import com.example.coplaybackend.Services.Marketplace.EquipmentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/equipments")
@RequiredArgsConstructor
@Tag(name = "Equipment-controller", description = "Gestion des équipements vendus sur la marketplace")
public class EquipmentController {

    private final EquipmentService service;

    @PostMapping
    public Equipment create(@RequestParam String sellerId,
                            @RequestParam String name,
                            @RequestParam(required = false) String description,
                            @RequestParam BigDecimal price,
                            @RequestParam String category,
                            @RequestParam(required = false) Integer stock,
                            @RequestBody(required = false) List<String> images) {
        return service.create(sellerId, name, description, price, category, stock, images);
    }

    @PutMapping("/{equipmentId}")
    public Equipment update(@PathVariable String equipmentId, @RequestBody Equipment patch) {
        return service.update(equipmentId, patch);
    }

    @PatchMapping("/{equipmentId}/status")
    public Equipment changeStatus(@PathVariable String equipmentId, @RequestParam String status) {
        return service.changeStatus(equipmentId, status);
    }

    @GetMapping("/{equipmentId}")
    public Equipment get(@PathVariable String equipmentId) {
        return service.getById(equipmentId);
    }

    @GetMapping
    public List<Equipment> list(@RequestParam(required = false) String sellerId,
                                @RequestParam(required = false) String category) {
        if (sellerId != null) return service.listBySeller(sellerId);
        if (category != null) return service.listByCategory(category);
        return service.listAll();
    }
}
