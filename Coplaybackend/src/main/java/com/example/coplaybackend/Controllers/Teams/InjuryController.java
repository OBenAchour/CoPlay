package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.Injury;
import com.example.coplaybackend.Entities.Teams.InjurySeverity;
import com.example.coplaybackend.Services.Teams.InjuryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/injuries")
@RequiredArgsConstructor
@Tag(name = "Injury-controller", description = "Gestion des blessures d'un athlète et impact sur sa disponibilité")
public class InjuryController {

    private final InjuryService service;

    @PostMapping
    public Injury report(
            @RequestParam String athleteId,
            @RequestParam(required = false) String reportedByCoachId,
            @RequestParam String bodyPart,
            @RequestParam InjurySeverity severity,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate expectedRecovery,
            @RequestParam(required = false) String notes) {

        return service.reportInjury(athleteId, reportedByCoachId, bodyPart,
                severity, startDate, expectedRecovery, notes);
    }

    @PatchMapping("/{injuryId}/heal")
    public Injury heal(@PathVariable String injuryId) {
        return service.markHealed(injuryId);
    }

    @GetMapping("/athlete/{athleteId}")
    public List<Injury> all(@PathVariable String athleteId) {
        return service.getAllForAthlete(athleteId);
    }

    @GetMapping("/athlete/{athleteId}/active")
    public List<Injury> active(@PathVariable String athleteId) {
        return service.getActiveInjuries(athleteId);
    }

    @GetMapping("/athlete/{athleteId}/available")
    public boolean isAvailable(@PathVariable String athleteId) {
        return service.isAthleteAvailable(athleteId);
    }
}
