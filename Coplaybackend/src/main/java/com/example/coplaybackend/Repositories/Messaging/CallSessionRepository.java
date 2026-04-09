package com.example.coplaybackend.Repositories.Messaging;

import com.example.coplaybackend.Entities.Messaging.CallSession;
import com.example.coplaybackend.Entities.Messaging.CallStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CallSessionRepository extends MongoRepository<CallSession, String> {

    Optional<CallSession> findByConversation_ConversationIdAndStatusIn(
            String conversationId, List<CallStatus> statuses);

    List<CallSession> findByInitiator_UserId(String userId);

    List<CallSession> findByStatus(CallStatus status);
}