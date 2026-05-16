package com.example.coplaybackend.Controllers.Coaching;

import com.example.coplaybackend.Entities.Coaching.HydrationLog;
import com.example.coplaybackend.Services.Coaching.HydrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/coaching/hydration")
@RequiredArgsConstructor
public class HydrationController {

    private final HydrationService service;

    @PostMapping("/log")
    public ResponseEntity<HydrationLog> log(@RequestParam int ml, @RequestParam(required = false) Integer goalMl) {
        return ResponseEntity.ok(service.log(ml, goalMl));
    }

    @GetMapping("/range")
    public ResponseEntity<List<HydrationLog>> range(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(service.listRange(from, to));
    }
}
