package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Equipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends MongoRepository<Equipment, String> {

    Page<Equipment> findByDeletedFalse(Pageable pageable);

    List<Equipment> findBySellerIdAndDeletedFalse(String sellerId);

    Page<Equipment> findBySportAndDeletedFalse(String sport, Pageable pageable);

    Page<Equipment> findByCategoryAndDeletedFalse(String category, Pageable pageable);

    @Query("{ 'deleted': false, '$text': { '$search': ?0 } }")
    Page<Equipment> searchText(String text, Pageable pageable);

    @Query("{ 'deleted': false, 'price': { $gte: ?0, $lte: ?1 } }")
    Page<Equipment> findByPriceRange(Double min, Double max, Pageable pageable);
}
