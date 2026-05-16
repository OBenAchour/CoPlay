package com.example.coplaybackend.Repositories.Coaching;

import com.example.coplaybackend.Entities.Coaching.HydrationLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HydrationLogRepository extends MongoRepository<HydrationLog, String> {
    Optional<HydrationLog> findByUserIdAndDate(String userId, LocalDate date);
    List<HydrationLog> findByUserIdAndDateBetween(String userId, LocalDate from, LocalDate to);
}
