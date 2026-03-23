package com.example.coplaybackend.Controllers.Events;

import com.example.coplaybackend.Entities.Events.Location;
import com.example.coplaybackend.Repositories.Events.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationRepository locationRepository;

    @PostMapping("/add")
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        Location saved = locationRepository.save(location);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(locationRepository.findAll());
    }

    @GetMapping("/get/{locationId}")
    public ResponseEntity<Location> getLocationById(@PathVariable String locationId) {
        return locationRepository.findById(locationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Location>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(locationRepository.findByNameContainingIgnoreCase(name));
    }
}