package com.example.coplaybackend.Repositories.Coaching;

import com.example.coplaybackend.Entities.Coaching.ProgressEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProgressEntryRepository extends MongoRepository<ProgressEntry, String> {
    List<ProgressEntry> findByUserIdOrderByDateAsc(String userId);
    List<ProgressEntry> findByUserIdAndDateBetween(String userId, LocalDate from, LocalDate to);
}
