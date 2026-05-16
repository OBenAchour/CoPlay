package com.example.coplaybackend.Repositories.Coaching;

import com.example.coplaybackend.Entities.Coaching.Injury;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InjuryRepository extends MongoRepository<Injury, String> {
    List<Injury> findByUserId(String userId);
    List<Injury> findByUserIdAndStatus(String userId, String status);
}
