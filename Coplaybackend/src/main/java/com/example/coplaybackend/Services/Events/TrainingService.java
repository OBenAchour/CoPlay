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
 * Ce service est responsable de :
 *  1. Créer / modifier / supprimer un programme         (US-049)
 *  2. Ajouter / retirer des exercices dans un programme (US-050)
 *  3. Consulter les programmes disponibles              (US-051)
 *
 * Rappel architectural :
 *  Exercise est EMBEDDED dans TrainingProgram.
 *  Il n'y a pas de ExerciseRepository — tout passe par TrainingProgramRepository.
 *  Pour modifier un exercice, on charge le programme, on modifie la liste,
 *  et on re-sauvegarde le programme entier.
 */
@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingProgramRepository trainingProgramRepository;

    // ═══════════════════════════════════════════════════════════════
    //  1. GESTION DES PROGRAMMES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Crée un nouveau programme d'entraînement pour une équipe.
     *
     * Règle métier : le programme commence toujours avec une liste
     * d'exercices vide — les exercices sont ajoutés séparément via addExercise().
     *
     * US-049 (créer programme)
     */
    public TrainingProgram createProgram(TrainingProgram program) {
        // On s'assure que la liste d'exercices est initialisée (jamais null)
        if (program.getExercises() == null) {
            program.setExercises(new ArrayList<>());
        }
        return trainingProgramRepository.save(program);
    }

    /**
     * Retourne tous les programmes d'une équipe.
     * US-051 (consulter programmes)
     */
    public List<TrainingProgram> getProgramsByTeam(String teamId) {
        return trainingProgramRepository.findByTeamId(teamId);
    }

    /**
     * Retourne un programme par son ID.
     * Utilisé pour afficher le détail d'un programme avec tous ses exercices.
     */
    public TrainingProgram getProgramById(String programId) {
        return trainingProgramRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Programme introuvable : " + programId));
    }

    /**
     * Retourne les programmes filtrés par niveau.
     * Exemple : récupérer uniquement les programmes "BEGINNER".
     * US-051 (consulter programmes)
     */
    public List<TrainingProgram> getProgramsByLevel(String level) {
        return trainingProgramRepository.findByLevel(level);
    }

    /**
     * Supprime un programme et tous ses exercices.
     *
     * Pourquoi les exercices sont supprimés automatiquement ?
     * Parce qu'ils sont embedded — supprimer le document TrainingProgram
     * supprime physiquement tout son contenu, exercices inclus.
     * Pas besoin de deleteByProgramId() comme avec une collection séparée.
     */
    public void deleteProgram(String programId) {
        if (!trainingProgramRepository.existsById(programId)) {
            throw new RuntimeException("Programme introuvable : " + programId);
        }
        trainingProgramRepository.deleteById(programId);
    }

    // ═══════════════════════════════════════════════════════════════
    //  2. GESTION DES EXERCICES (embedded)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Ajoute un exercice à un programme existant.
     *
     * Fonctionnement (embedding) :
     *  1. On charge le programme depuis MongoDB
     *  2. On génère un ID unique pour le nouvel exercice
     *  3. On ajoute l'exercice à la liste en mémoire
     *  4. On re-sauvegarde le programme entier
     *
     * US-050 (ajouter exercices)
     */
    public TrainingProgram addExercise(String programId, Exercise exercise) {
        TrainingProgram program = getProgramById(programId);

        // On génère un ID unique pour l'exercice
        // (pas géré par MongoDB puisque Exercise n'est pas un @Document)
        exercise.setExerciseId(UUID.randomUUID().toString());

        program.getExercises().add(exercise);
        return trainingProgramRepository.save(program);
    }

    /**
     * Supprime un exercice d'un programme.
     *
     * Fonctionnement :
     *  1. On charge le programme
     *  2. On retire l'exercice par son ID de la liste
     *  3. On re-sauvegarde le programme
     *
     * Règle métier : si l'exercice n'existe pas dans le programme,
     * on lève une exception plutôt que d'ignorer silencieusement.
     */
    public TrainingProgram removeExercise(String programId, String exerciseId) {
        TrainingProgram program = getProgramById(programId);

        boolean removed = program.getExercises()
                .removeIf(ex -> ex.getExerciseId().equals(exerciseId));

        if (!removed) {
            throw new RuntimeException("Exercice introuvable : " + exerciseId);
        }

        return trainingProgramRepository.save(program);
    }

    /**
     * Met à jour un exercice existant dans un programme.
     *
     * Fonctionnement :
     *  1. On charge le programme
     *  2. On trouve l'exercice par son ID dans la liste
     *  3. On met à jour ses champs
     *  4. On re-sauvegarde le programme
     */
    public TrainingProgram updateExercise(String programId, String exerciseId, Exercise updatedExercise) {
        TrainingProgram program = getProgramById(programId);

        List<Exercise> exercises = program.getExercises();
        boolean found = false;

        for (int i = 0; i < exercises.size(); i++) {
            if (exercises.get(i).getExerciseId().equals(exerciseId)) {
                // On conserve l'ID original et on met à jour les autres champs
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