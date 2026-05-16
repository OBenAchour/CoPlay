package com.example.coplaybackend.Repositories.Coaching;

import com.example.coplaybackend.Entities.Coaching.CoachProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoachProfileRepository extends MongoRepository<CoachProfile, String> {
    Optional<CoachProfile> findByUserId(String userId);
    Page<CoachProfile> findByVerifiedTrue(Pageable pageable);
    Page<CoachProfile> findBySpecialtiesContaining(String specialty, Pageable pageable);
}
