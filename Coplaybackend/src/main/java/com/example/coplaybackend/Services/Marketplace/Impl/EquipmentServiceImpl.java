package com.example.coplaybackend.Services.Marketplace.Impl;

import com.example.coplaybackend.Entities.Marketplace.Equipment;
import com.example.coplaybackend.Repositories.Marketplace.EquipmentRepository;
import com.example.coplaybackend.Services.Marketplace.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository repository;

    @Override
    public Equipment create(String sellerId,
                            String name,
                            String description,
                            BigDecimal price,
                            String category,
                            Integer stock,
                            List<String> images) {

        Equipment eq = Equipment.builder()
                .sellerId(sellerId)
                .name(name)
                .description(description)
                .price(price)
                .category(category)
                .stock(stock)
                .images(images)
                .status("AVAILABLE")
                .build();

        return repository.save(eq);
    }

    @Override
    public Equipment update(String equipmentId, Equipment patch) {
        Equipment eq = repository.findById(equipmentId).orElseThrow();
        if (patch.getName() != null) eq.setName(patch.getName());
        if (patch.getDescription() != null) eq.setDescription(patch.getDescription());
        if (patch.getPrice() != null) eq.setPrice(patch.getPrice());
        if (patch.getCategory() != null) eq.setCategory(patch.getCategory());
        if (patch.getStock() != null) eq.setStock(patch.getStock());
        if (patch.getImages() != null) eq.setImages(patch.getImages());
        return repository.save(eq);
    }

    @Override
    public Equipment changeStatus(String equipmentId, String status) {
        Equipment eq = repository.findById(equipmentId).orElseThrow();
        eq.setStatus(status);
        return repository.save(eq);
    }

    @Override
    public Equipment getById(String equipmentId) {
        return repository.findById(equipmentId).orElseThrow();
    }

    @Override
    public List<Equipment> listAll() {
        return repository.findAll();
    }

    @Override
    public List<Equipment> listBySeller(String sellerId) {
        return repository.findBySellerId(sellerId);
    }

    @Override
    public List<Equipment> listByCategory(String category) {
        return repository.findByCategory(category);
    }
}
