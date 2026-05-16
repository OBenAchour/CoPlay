package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.BookingRequest;
import com.example.coplaybackend.Entities.Marketplace.Booking;
import com.example.coplaybackend.Services.Marketplace.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/marketplace/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> create(@RequestBody BookingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> get(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<Booking>> mine(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(bookingService.listMine(page, size));
    }

    @GetMapping("/provider")
    public ResponseEntity<Page<Booking>> asProvider(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(bookingService.listAsProvider(page, size));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(bookingService.updateStatus(id, status));
    }
}
