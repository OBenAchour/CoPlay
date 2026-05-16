package com.example.coplaybackend.Services.Events;

import com.example.coplaybackend.Entities.Events.Exercise;
import com.example.coplaybackend.Entities.Events.TrainingProgram;
import com.example.coplaybackend.Repositories.Events.TrainingProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * TrainingService — logique métier des programmes d'entraînement.
 *
 * Responsabilités :
 *  1. CRUD complet sur TrainingProgram
 *  2. Gestion des exercices embedded (add / update / remove)
 *
 * Architecture :
 *  Exercise est EMBEDDED dans TrainingProgram.
 *  Pour modifier un exercice, on charge le programme,
 *  on modifie la liste, et on re-sauvegarde le programme entier.
 */
@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingProgramRepository trainingProgramRepository;

    // ═══════════════════════════════════════════════════════════════
    //  PROGRAMMES
    // ═══════════════════════════════════════════════════════════════

    public TrainingProgram createProgram(TrainingProgram program) {
        if (program.getExercises() == null) {
            program.setExercises(new ArrayList<>());
        }
        return trainingProgramRepository.save(program);
    }

    public List<TrainingProgram> getAllPrograms() {
        return trainingProgramRepository.findAll();
    }

    public List<TrainingProgram> getProgramsByTeam(String teamId) {
        return trainingProgramRepository.findByTeamId(teamId);
    }

    public TrainingProgram getProgramById(String programId) {
        return trainingProgramRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Programme introuvable : " + programId));
    }

    public List<TrainingProgram> getProgramsByLevel(String level) {
        return trainingProgramRepository.findByLevel(level);
    }

    public TrainingProgram updateProgram(String programId, TrainingProgram updatedData) {
        TrainingProgram existing = getProgramById(programId);
        existing.setTitle(updatedData.getTitle());
        existing.setLevel(updatedData.getLevel());
        existing.setDuration(updatedData.getDuration());
        if (updatedData.getTeamId() != null) {
            existing.setTeamId(updatedData.getTeamId());
        }
        return trainingProgramRepository.save(existing);
    }

    public void deleteProgram(String programId) {
        if (!trainingProgramRepository.existsById(programId)) {
            throw new RuntimeException("Programme introuvable : " + programId);
        }
        trainingProgramRepository.deleteById(programId);
    }

    // ═══════════════════════════════════════════════════════════════
    //  EXERCICES (embedded)
    // ═══════════════════════════════════════════════════════════════

    public TrainingProgram addExercise(String programId, Exercise exercise) {
        TrainingProgram program = getProgramById(programId);
        exercise.setExerciseId(UUID.randomUUID().toString());
        program.getExercises().add(exercise);
        return trainingProgramRepository.save(program);
    }

    public TrainingProgram removeExercise(String programId, String exerciseId) {
        TrainingProgram program = getProgramById(programId);
        boolean removed = program.getExercises()
                .removeIf(ex -> ex.getExerciseId().equals(exerciseId));
        if (!removed) {
            throw new RuntimeException("Exercice introuvable : " + exerciseId);
        }
        return trainingProgramRepository.save(program);
    }

    public TrainingProgram updateExercise(String programId, String exerciseId, Exercise updatedExercise) {
        TrainingProgram program = getProgramById(programId);
        List<Exercise> exercises = program.getExercises();
        boolean found = false;

        for (int i = 0; i < exercises.size(); i++) {
            if (exercises.get(i).getExerciseId().equals(exerciseId)) {
                updatedExercise.setExerciseId(exerciseId);
                exercises.set(i, updatedExercise);
                found = true;
                break;
            }
        }

        if (!found) {
            throw new RuntimeException("Exercice introuvable : " + exerciseId);
        }

        return trainingProgramRepository.save(program);
    }
}