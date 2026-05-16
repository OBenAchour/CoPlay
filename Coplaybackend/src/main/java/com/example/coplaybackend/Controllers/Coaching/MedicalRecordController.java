package com.example.coplaybackend.Controllers.Coaching;

import com.example.coplaybackend.Entities.Coaching.MedicalRecord;
import com.example.coplaybackend.Services.Coaching.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coaching/medical-record")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService service;

    @PostMapping
    public ResponseEntity<MedicalRecord> upsert(@RequestBody MedicalRecord input) {
        return ResponseEntity.ok(service.upsert(input));
    }

    @GetMapping("/me")
    public ResponseEntity<MedicalRecord> mine() { return ResponseEntity.ok(service.getOwn()); }

    @GetMapping("/user/{userId}")
    public ResponseEntity<MedicalRecord> byUser(@PathVariable String userId) {
        return ResponseEntity.ok(service.getForUser(userId));
    }

    @PostMapping("/authorize/{coachUserId}")
    public ResponseEntity<MedicalRecord> authorize(@PathVariable String coachUserId) {
        return ResponseEntity.ok(service.authorizeCoach(coachUserId));
    }

    @DeleteMapping("/authorize/{coachUserId}")
    public ResponseEntity<MedicalRecord> revoke(@PathVariable String coachUserId) {
        return ResponseEntity.ok(service.revokeCoach(coachUserId));
    }
}
