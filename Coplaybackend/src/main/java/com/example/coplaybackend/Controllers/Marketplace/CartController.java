package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.CartItemRequest;
import com.example.coplaybackend.Entities.Marketplace.Cart;
import com.example.coplaybackend.Services.Marketplace.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/marketplace/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<Cart> get() {
        return ResponseEntity.ok(cartService.get());
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> add(@RequestBody CartItemRequest req) {
        return ResponseEntity.ok(cartService.addItem(req));
    }

    @PatchMapping("/items/{targetId}")
    public ResponseEntity<Cart> update(@PathVariable String targetId, @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateQuantity(targetId, quantity));
    }

    @DeleteMapping("/items/{targetId}")
    public ResponseEntity<Cart> remove(@PathVariable String targetId) {
        return ResponseEntity.ok(cartService.removeItem(targetId));
    }

    @DeleteMapping
    public ResponseEntity<Cart> clear() {
        return ResponseEntity.ok(cartService.clear());
    }
}
