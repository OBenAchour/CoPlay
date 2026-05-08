package com.example.coplaybackend.Controllers.Events;

import com.example.coplaybackend.DTOs.Events.TrainingRequestDTO;
import com.example.coplaybackend.Entities.Events.Exercise;
import com.example.coplaybackend.Entities.Events.TrainingProgram;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Repositories.Teams.TeamRepository;
import com.example.coplaybackend.Services.Events.TrainingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TrainingController — gestion des programmes d'entraînement.
 *
 * Permissions (à activer après intégration Spring Security + module Auth) :
 *  - CRUD Programs : ADMIN ou COACH de l'équipe
 *  - Lecture : tout utilisateur authentifié
 */
@RestController
@RequestMapping("/api/training")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;
    private final TeamRepository teamRepository;

    // ═══════════════════════════════════════════════════════════════
    //  PROGRAMMES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Crée un nouveau programme.
     * POST /api/training/add
     */
    // TODO Auth Integration: décommenter après intégration Spring Security
    // @PreAuthorize("hasRole('ADMIN') or @teamSecurityService.isCoachOfTeam(authentication, #dto.teamId)")
    @PostMapping("/add")
    public ResponseEntity<TrainingProgram> createProgram(@RequestBody TrainingRequestDTO dto) {

        TrainingProgram program = TrainingProgram.builder()
                .title(dto.getTitle())
                .level(dto.getLevel())
                .duration(dto.getDuration())
                .build();

        if (dto.getTeamId() != null && !dto.getTeamId().isEmpty()) {
            Team team = teamRepository.findById(dto.getTeamId())
                    .orElseThrow(() -> new RuntimeException("Équipe introuvable : " + dto.getTeamId()));
            program.setTeamId(team);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(trainingService.createProgram(program));
    }

    @GetMapping("/all")
    public ResponseEntity<List<TrainingProgram>> getAllPrograms() {
        return ResponseEntity.ok(trainingService.getAllPrograms());
    }

    @GetMapping("/get/{programId}")
    public ResponseEntity<TrainingProgram> getProgramById(@PathVariable String programId) {
        return ResponseEntity.ok(trainingService.getProgramById(programId));
    }

    @GetMapping("/get/team/{teamId}")
    public ResponseEntity<List<TrainingProgram>> getProgramsByTeam(@PathVariable String teamId) {
        return ResponseEntity.ok(trainingService.getProgramsByTeam(teamId));
    }

    @GetMapping("/get/level/{level}")
    public ResponseEntity<List<TrainingProgram>> getProgramsByLevel(@PathVariable String level) {
        return ResponseEntity.ok(trainingService.getProgramsByLevel(level));
    }

    /**
     * Modifie un programme.
     * PUT /api/training/update/{programId}
     */
    // TODO Auth Integration: décommenter après intégration Spring Security
    // @PreAuthorize("hasRole('ADMIN') or @teamSecurityService.isCoachOfTeam(authentication, #dto.teamId)")
    @PutMapping("/update/{programId}")
    public ResponseEntity<TrainingProgram> updateProgram(
            @PathVariable String programId,
            @RequestBody TrainingRequestDTO dto) {

        TrainingProgram updatedData = TrainingProgram.builder()
                .title(dto.getTitle())
                .level(dto.getLevel())
                .duration(dto.getDuration())
                .build();

        if (dto.getTeamId() != null && !dto.getTeamId().isEmpty()) {
            Team team = teamRepository.findById(dto.getTeamId())
                    .orElseThrow(() -> new RuntimeException("Équipe introuvable : " + dto.getTeamId()));
            updatedData.setTeamId(team);
        }

        return ResponseEntity.ok(trainingService.updateProgram(programId, updatedData));
    }

    /**
     * Supprime un programme.
     * DELETE /api/training/delete/{programId}
     */
    // TODO Auth Integration: décommenter après intégration Spring Security
    // @PreAuthorize("hasRole('ADMIN') or @teamSecurityService.isCoachOfProgramTeam(authentication, #programId)")
    @DeleteMapping("/delete/{programId}")
    public ResponseEntity<Void> deleteProgram(@PathVariable String programId) {
        trainingService.deleteProgram(programId);
        return ResponseEntity.noContent().build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  EXERCICES
    // ═══════════════════════════════════════════════════════════════

    // TODO Auth Integration: décommenter après intégration Spring Security
    // @PreAuthorize("hasRole('ADMIN') or @teamSecurityService.isCoachOfProgramTeam(authentication, #programId)")
    @PostMapping("/exercises/add/{programId}")
    public ResponseEntity<TrainingProgram> addExercise(
            @PathVariable String programId,
            @RequestBody Exercise exercise) {
        return ResponseEntity.ok(trainingService.addExercise(programId, exercise));
    }

    // TODO Auth Integration: décommenter après intégration Spring Security
    // @PreAuthorize("hasRole('ADMIN') or @teamSecurityService.isCoachOfProgramTeam(authentication, #programId)")
    @PutMapping("/exercises/update/{programId}/{exerciseId}")
    public ResponseEntity<TrainingProgram> updateExercise(
            @PathVariable String programId,
            @PathVariable String exerciseId,
            @RequestBody Exercise exercise) {
        return ResponseEntity.ok(trainingService.updateExercise(programId, exerciseId, exercise));
    }

    // TODO Auth Integration: décommenter après intégration Spring Security
    // @PreAuthorize("hasRole('ADMIN') or @teamSecurityService.isCoachOfProgramTeam(authentication, #programId)")
    @DeleteMapping("/exercises/delete/{programId}/{exerciseId}")
    public ResponseEntity<TrainingProgram> removeExercise(
            @PathVariable String programId,
            @PathVariable String exerciseId) {
        return ResponseEntity.ok(trainingService.removeExercise(programId, exerciseId));
    }
}