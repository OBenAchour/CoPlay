package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Favorite;
import com.example.coplaybackend.Services.Marketplace.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<Favorite>> list() {
        return ResponseEntity.ok(favoriteService.list());
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Boolean>> toggle(@RequestParam String targetId,
                                                       @RequestParam String targetType) {
        boolean nowFav = favoriteService.toggle(targetId, targetType);
        return ResponseEntity.ok(Map.of("favorite", nowFav));
    }
}
