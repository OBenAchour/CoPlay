package com.example.coplaybackend.Controllers.Events;

import com.example.coplaybackend.Entities.Events.Exercise;
import com.example.coplaybackend.Entities.Events.TrainingProgram;
import com.example.coplaybackend.Services.Events.TrainingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;


    @PostMapping("/add")
    public ResponseEntity<TrainingProgram> createProgram(@RequestBody TrainingProgram program) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainingService.createProgram(program));
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

    @DeleteMapping("/delete/{programId}")
    public ResponseEntity<Void> deleteProgram(@PathVariable String programId) {
        trainingService.deleteProgram(programId);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/exercises/add/{programId}")
    public ResponseEntity<TrainingProgram> addExercise(
            @PathVariable String programId,
            @RequestBody Exercise exercise) {
        return ResponseEntity.ok(trainingService.addExercise(programId, exercise));
    }

    @PutMapping("/exercises/update/{programId}/{exerciseId}")
    public ResponseEntity<TrainingProgram> updateExercise(
            @PathVariable String programId,
            @PathVariable String exerciseId,
            @RequestBody Exercise exercise) {
        return ResponseEntity.ok(trainingService.updateExercise(programId, exerciseId, exercise));
    }

    @DeleteMapping("/exercises/delete/{programId}/{exerciseId}")
    public ResponseEntity<TrainingProgram> removeExercise(
            @PathVariable String programId,
            @PathVariable String exerciseId) {
        return ResponseEntity.ok(trainingService.removeExercise(programId, exerciseId));
    }
}