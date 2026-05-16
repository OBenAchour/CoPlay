package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.CartItemRequest;
import com.example.coplaybackend.Entities.Marketplace.Cart;
import com.example.coplaybackend.Entities.Marketplace.CartItem;
import com.example.coplaybackend.Entities.Marketplace.Equipment;
import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import com.example.coplaybackend.Repositories.Marketplace.CartRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final EquipmentService equipmentService;
    private final ProviderServiceService providerServiceService;

    public Cart get() {
        return getOrCreate(SecurityUtils.getCurrentUserId());
    }

    public Cart addItem(CartItemRequest req) {
        Cart cart = getOrCreate(SecurityUtils.getCurrentUserId());
        CartItem item = buildItem(req);
        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getTargetId().equals(req.getTargetId()) && i.getTargetType().equals(req.getTargetType()))
                .findFirst();
        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + item.getQuantity());
        } else {
            cart.getItems().add(item);
        }
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart updateQuantity(String targetId, int quantity) {
        Cart cart = getOrCreate(SecurityUtils.getCurrentUserId());
        cart.getItems().stream()
                .filter(i -> i.getTargetId().equals(targetId))
                .findFirst()
                .ifPresent(i -> i.setQuantity(Math.max(1, quantity)));
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart removeItem(String targetId) {
        Cart cart = getOrCreate(SecurityUtils.getCurrentUserId());
        cart.getItems().removeIf(i -> i.getTargetId().equals(targetId));
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart clear() {
        Cart cart = getOrCreate(SecurityUtils.getCurrentUserId());
        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    private Cart getOrCreate(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder()
                        .userId(userId)
                        .items(new ArrayList<>())
                        .updatedAt(LocalDateTime.now())
                        .build()));
    }

    private CartItem buildItem(CartItemRequest req) {
        if ("EQUIPMENT".equals(req.getTargetType())) {
            Equipment e = equipmentService.getById(req.getTargetId());
            return CartItem.builder()
                    .targetId(e.getEquipmentId())
                    .targetType("EQUIPMENT")
                    .quantity(req.getQuantity() != null ? req.getQuantity() : 1)
                    .unitPrice(e.getPrice())
                    .name(e.getName())
                    .imageUrl(e.getImages().isEmpty() ? null : e.getImages().get(0))
                    .build();
        }
        if ("SERVICE".equals(req.getTargetType())) {
            MarketplaceService s = providerServiceService.getById(req.getTargetId());
            return CartItem.builder()
                    .targetId(s.getServiceId())
                    .targetType("SERVICE")
                    .quantity(req.getQuantity() != null ? req.getQuantity() : 1)
                    .unitPrice(s.getPrice())
                    .name(s.getName())
                    .imageUrl(s.getImages().isEmpty() ? null : s.getImages().get(0))
                    .build();
        }
        throw new RuntimeException("Type cible non supporté : " + req.getTargetType());
    }
}
