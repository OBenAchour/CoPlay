package com.example.coplaybackend.Services.Events;

import com.example.coplaybackend.Entities.Auth.SportLevel;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Events.Exercise;
import com.example.coplaybackend.Entities.Events.TrainingProgram;
import com.example.coplaybackend.Repositories.Events.TrainingProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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

    /**
     * FONCTION MÉTIER — Recommandation de programmes par niveau.
     *
     * Recommande au joueur les programmes d'entraînement adaptés à SON niveau
     * sportif (défini dans son profil : BEGINNER / INTERMEDIATE / ADVANCED / PROFESSIONAL).
     *
     * Règle :
     *  - Si le joueur a un niveau renseigné → programmes de ce niveau exact.
     *  - Sinon (profil/niveau absent) → on renvoie tous les programmes (pas de filtre possible).
     */
    public List<TrainingProgram> getRecommendedProgramsForUser(User user) {
        SportLevel level = (user.getProfile() != null) ? user.getProfile().getLevel() : null;

        if (level == null) {
            return getAllPrograms();
        }

        // Le niveau du joueur est un enum anglais (BEGINNER…), mais les programmes
        // peuvent stocker le niveau en français (Débutant…). On matche donc de façon
        // tolérante : insensible à la casse et aux accents, FR comme EN.
        Set<String> accepted = acceptedLabels(level);

        return getAllPrograms().stream()
                .filter(p -> p.getLevel() != null && accepted.contains(normalize(p.getLevel())))
                .collect(Collectors.toList());
    }

    /** Libellés acceptés (normalisés) pour un niveau, en français et en anglais. */
    private Set<String> acceptedLabels(SportLevel level) {
        switch (level) {
            case BEGINNER:     return Set.of("beginner", "debutant");
            case INTERMEDIATE: return Set.of("intermediate", "intermediaire");
            case ADVANCED:     return Set.of("advanced", "avance");
            case PROFESSIONAL: return Set.of("professional", "professionnel", "expert");
            default:           return Set.of(normalize(level.name()));
        }
    }

    /** Minuscule + suppression des accents (Débutant → debutant). */
    private String normalize(String s) {
        if (s == null) return "";
        String stripped = Normalizer.normalize(s.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return stripped.toLowerCase();
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