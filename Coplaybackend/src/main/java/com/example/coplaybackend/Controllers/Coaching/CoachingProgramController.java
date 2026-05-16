package com.example.coplaybackend.Controllers.Coaching;

import com.example.coplaybackend.Entities.Coaching.CoachingProgram;
import com.example.coplaybackend.Services.Coaching.CoachingProgramService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coaching/programs")
@RequiredArgsConstructor
public class CoachingProgramController {

    private final CoachingProgramService service;

    @PostMapping
    public ResponseEntity<CoachingProgram> create(@RequestBody CoachingProgram p) { return ResponseEntity.ok(service.create(p)); }

    @PutMapping("/{id}")
    public ResponseEntity<CoachingProgram> update(@PathVariable String id, @RequestBody CoachingProgram p) {
        return ResponseEntity.ok(service.update(id, p));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<CoachingProgram> assign(@PathVariable String id,
                                                  @RequestParam String clientId,
                                                  @RequestParam(required = false) String clientType) {
        return ResponseEntity.ok(service.assign(id, clientId, clientType));
    }

    @PatchMapping("/{id}/complete-day")
    public ResponseEntity<CoachingProgram> completeDay(@PathVariable String id,
                                                       @RequestParam int week,
                                                       @RequestParam int day) {
        return ResponseEntity.ok(service.completeDay(id, week, day));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoachingProgram> get(@PathVariable String id) { return ResponseEntity.ok(service.getById(id)); }

    @GetMapping("/coach/me")
    public ResponseEntity<List<CoachingProgram>> mineAsCoach() {
        return ResponseEntity.ok(service.listByCoach(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/client/me")
    public ResponseEntity<List<CoachingProgram>> mineAsClient() { return ResponseEntity.ok(service.listMineAsClient()); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
