package com.example.coplaybackend.Repositories.Coaching;

import com.example.coplaybackend.Entities.Coaching.MedicalRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {
    Optional<MedicalRecord> findByUserId(String userId);
}
