package com.example.coplaybackend.Repositories.Messaging;

import com.example.coplaybackend.Entities.Messaging.MessageReaction;
import com.example.coplaybackend.Entities.Messaging.ReactionType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReactionRepository extends MongoRepository<MessageReaction, String> {

    List<MessageReaction> findByMessage_MessageId(String messageId);

    Optional<MessageReaction> findByMessage_MessageIdAndUser_UserId(String messageId, String userId);

    long countByMessage_MessageId(String messageId);

    long countByMessage_MessageIdAndReactionType(String messageId, ReactionType reactionType);

    void deleteByMessage_MessageIdAndUser_UserId(String messageId, String userId);
}