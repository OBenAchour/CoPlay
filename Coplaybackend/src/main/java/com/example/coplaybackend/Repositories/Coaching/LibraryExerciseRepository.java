package com.example.coplaybackend.Repositories.Coaching;

import com.example.coplaybackend.Entities.Coaching.LibraryExercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibraryExerciseRepository extends MongoRepository<LibraryExercise, String> {

    Page<LibraryExercise> findByApprovedTrue(Pageable pageable);

    List<LibraryExercise> findByMuscleGroupsContaining(String muscleGroup);

    @Query("{ '$text': { '$search': ?0 } }")
    Page<LibraryExercise> search(String text, Pageable pageable);
}
