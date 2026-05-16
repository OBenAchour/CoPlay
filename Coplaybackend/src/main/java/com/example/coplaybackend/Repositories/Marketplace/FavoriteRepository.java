package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends MongoRepository<Favorite, String> {

    List<Favorite> findByUserId(String userId);

    Optional<Favorite> findByUserIdAndTargetIdAndTargetType(String userId, String targetId, String targetType);

    void deleteByUserIdAndTargetIdAndTargetType(String userId, String targetId, String targetType);
}
