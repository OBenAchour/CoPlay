package com.example.coplaybackend.Repositories.Messaging;

import com.example.coplaybackend.Entities.Messaging.MediaType;
import com.example.coplaybackend.Entities.Messaging.MessageMedia;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageMediaRepository extends MongoRepository<MessageMedia, String> {

    List<MessageMedia> findByMessage_MessageId(String messageId);

    List<MessageMedia> findByMessage_Conversation_ConversationIdAndMediaType(String conversationId, MediaType mediaType);
}