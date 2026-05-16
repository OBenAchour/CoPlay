package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Favorite;
import com.example.coplaybackend.Repositories.Marketplace.FavoriteRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;

    public List<Favorite> list() {
        return favoriteRepository.findByUserId(SecurityUtils.getCurrentUserId());
    }

    @Transactional
    public boolean toggle(String targetId, String targetType) {
        String userId = SecurityUtils.getCurrentUserId();
        var existing = favoriteRepository.findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);
        if (existing.isPresent()) {
            favoriteRepository.deleteByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);
            return false;
        }
        favoriteRepository.save(Favorite.builder()
                .userId(userId)
                .targetId(targetId)
                .targetType(targetType)
                .createdAt(LocalDateTime.now())
                .build());
        return true;
    }
}
