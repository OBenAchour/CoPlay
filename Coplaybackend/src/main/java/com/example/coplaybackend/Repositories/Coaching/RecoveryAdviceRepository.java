package com.example.coplaybackend.Repositories.Coaching;

import com.example.coplaybackend.Entities.Coaching.RecoveryAdvice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecoveryAdviceRepository extends MongoRepository<RecoveryAdvice, String> {
    List<RecoveryAdvice> findByUserIdOrderByDateDesc(String userId);
}
