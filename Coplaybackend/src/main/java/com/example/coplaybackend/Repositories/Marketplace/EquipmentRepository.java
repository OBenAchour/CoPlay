package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Equipment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EquipmentRepository extends MongoRepository<Equipment, String> {

    List<Equipment> findBySellerId(String sellerId);

    List<Equipment> findByCategory(String category);

    List<Equipment> findByStatus(String status);
}
