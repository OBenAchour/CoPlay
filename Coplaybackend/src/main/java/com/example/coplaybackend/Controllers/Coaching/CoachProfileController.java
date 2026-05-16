package com.example.coplaybackend.Controllers.Coaching;

import com.example.coplaybackend.DTOs.Coaching.CoachProfileRequest;
import com.example.coplaybackend.Entities.Coaching.CoachProfile;
import com.example.coplaybackend.Services.Coaching.CoachProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coaching/coach-profiles")
@RequiredArgsConstructor
public class CoachProfileController {

    private final CoachProfileService service;

    @PostMapping
    public ResponseEntity<CoachProfile> upsert(@RequestBody CoachProfileRequest req) {
        return ResponseEntity.ok(service.upsert(req));
    }

    @GetMapping("/me")
    public ResponseEntity<CoachProfile> mine() { return ResponseEntity.ok(service.getMine()); }

    @GetMapping("/{id}")
    public ResponseEntity<CoachProfile> getById(@PathVariable String id) { return ResponseEntity.ok(service.getById(id)); }

    @GetMapping("/user/{userId}")
    public ResponseEntity<CoachProfile> byUser(@PathVariable String userId) { return ResponseEntity.ok(service.getByUserId(userId)); }

    @GetMapping
    public ResponseEntity<Page<CoachProfile>> list(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size,
                                                    @RequestParam(defaultValue = "false") boolean verifiedOnly) {
        return ResponseEntity.ok(verifiedOnly ? service.listVerified(page, size) : service.listAll(page, size));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<CoachProfile> verify(@PathVariable String id, @RequestParam boolean value) {
        return ResponseEntity.ok(service.verify(id, value));
    }

    @PatchMapping("/{id}/certifications/{idx}/verify")
    public ResponseEntity<CoachProfile> verifyCert(@PathVariable String id, @PathVariable int idx,
                                                   @RequestParam boolean value) {
        return ResponseEntity.ok(service.verifyCertification(id, idx, value));
    }
}
