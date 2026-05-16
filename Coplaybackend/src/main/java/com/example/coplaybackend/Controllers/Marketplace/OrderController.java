package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Order;
import com.example.coplaybackend.Services.Marketplace.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order-controller",
     description = "Commandes marketplace — markPaid déclenche la création d'une CoachingSession pour les services COACHING_SESSION")
public class OrderController {

    private final OrderService service;

    @PostMapping
    public Order create(@RequestParam String buyerId,
                        @RequestParam String targetId,
                        @RequestParam String targetType) {
        return service.create(buyerId, targetId, targetType);
    }

    @PatchMapping("/{orderId}/pay")
    public Order pay(@PathVariable String orderId) {
        return service.markPaid(orderId);
    }

    @PatchMapping("/{orderId}/cancel")
    public Order cancel(@PathVariable String orderId) {
        return service.cancel(orderId);
    }

    @PatchMapping("/{orderId}/complete")
    public Order complete(@PathVariable String orderId) {
        return service.complete(orderId);
    }

    @GetMapping("/{orderId}")
    public Order get(@PathVariable String orderId) {
        return service.getById(orderId);
    }

    @GetMapping("/buyer/{buyerId}")
    public List<Order> byBuyer(@PathVariable String buyerId) {
        return service.listByBuyer(buyerId);
    }
}
