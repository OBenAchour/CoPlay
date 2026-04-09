package com.example.coplaybackend.Repositories.Messaging;

import com.example.coplaybackend.Entities.Messaging.Message;
import com.example.coplaybackend.Entities.Messaging.MessageStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findByConversation_ConversationIdAndIsDeletedFalseOrderBySentAtAsc(String conversationId);

    List<Message> findByConversation_ConversationIdAndIsDeletedFalseOrderBySentAtDesc(String conversationId);

    List<Message> findBySender_UserIdAndIsDeletedFalse(String senderId);

    List<Message> findByConversation_ConversationIdAndStatus(String conversationId, MessageStatus status);

    long countByConversation_ConversationIdAndStatusAndIsDeletedFalse(String conversationId, MessageStatus status);

    Optional<Message> findFirstByConversation_ConversationIdAndIsDeletedFalseOrderBySentAtDesc(String conversationId);
}