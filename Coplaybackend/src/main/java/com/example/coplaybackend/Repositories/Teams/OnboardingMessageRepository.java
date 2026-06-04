package com.example.coplaybackend.Repositories.Teams;

import com.example.coplaybackend.Entities.Teams.OnboardingMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OnboardingMessageRepository extends MongoRepository<OnboardingMessage, String> {
    Optional<OnboardingMessage> findByTeamIdAndUserId(String teamId, String userId);
}