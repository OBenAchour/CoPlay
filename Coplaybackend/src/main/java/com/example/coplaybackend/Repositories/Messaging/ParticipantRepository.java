package com.example.coplaybackend.Repositories.Messaging;

import com.example.coplaybackend.Entities.Messaging.Participant;
import com.example.coplaybackend.Entities.Messaging.ParticipantRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends MongoRepository<Participant, String> {

    List<Participant> findByConversation_ConversationIdAndIsActiveTrue(String conversationId);

    List<Participant> findByUser_UserIdAndIsActiveTrue(String userId);

    Optional<Participant> findByConversation_ConversationIdAndUser_UserId(String conversationId, String userId);

    boolean existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(String conversationId, String userId);

    List<Participant> findByConversation_ConversationIdAndRole(String conversationId, ParticipantRole role);
}