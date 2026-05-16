package com.example.coplaybackend.Repositories.Coaching;

import com.example.coplaybackend.Entities.Coaching.PerformanceMetric;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PerformanceMetricRepository extends MongoRepository<PerformanceMetric, String> {
    List<PerformanceMetric> findByUserIdAndDateBetween(String userId, LocalDate from, LocalDate to);
    List<PerformanceMetric> findByUserId(String userId);
}
