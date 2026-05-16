package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.OrderRequest;
import com.example.coplaybackend.Entities.Marketplace.Order;
import com.example.coplaybackend.Services.Marketplace.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/marketplace/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody OrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createFromCart(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> get(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<Order>> mine(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.listMine(page, size));
    }

    @GetMapping("/sales")
    public ResponseEntity<Page<Order>> sales(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.listMySales(page, size));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Order> cancel(@PathVariable String id) {
        return ResponseEntity.ok(orderService.cancel(id));
    }
}
