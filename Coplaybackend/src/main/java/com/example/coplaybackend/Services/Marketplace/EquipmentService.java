package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Equipment;

import java.math.BigDecimal;
import java.util.List;

public interface EquipmentService {

    Equipment create(String sellerId,
                     String name,
                     String description,
                     BigDecimal price,
                     String category,
                     Integer stock,
                     List<String> images);

    Equipment update(String equipmentId, Equipment patch);

    Equipment changeStatus(String equipmentId, String status);

    Equipment getById(String equipmentId);

    List<Equipment> listAll();

    List<Equipment> listBySeller(String sellerId);

    List<Equipment> listByCategory(String category);
}
