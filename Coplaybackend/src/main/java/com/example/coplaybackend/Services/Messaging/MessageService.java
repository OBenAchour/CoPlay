package com.example.coplaybackend.Services.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Messaging.*;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Messaging.ConversationRepository;
import com.example.coplaybackend.Repositories.Messaging.MessageMediaRepository;
import com.example.coplaybackend.Repositories.Messaging.MessageRepository;
import com.example.coplaybackend.Repositories.Messaging.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final MessageMediaRepository messageMediaRepository;
    private final ConversationRepository conversationRepository;
    private final ParticipantRepository participantRepository;
    private final UserRepository userRepository;

    /**
     * Send a text message to a conversation.
     * Verifies that the sender is an active participant before persisting.
     */
    public Message sendMessage(String conversationId, String senderId, String content) {

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

        boolean isParticipant = participantRepository
                .existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(conversationId, senderId);
        if (!isParticipant) {
            throw new RuntimeException("User " + senderId + " is not an active participant of this conversation");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found: " + senderId));

        Message message = Message.builder()
                .sender(sender)
                .conversation(conversation)
                .content(content)
                .status(MessageStatus.SENT)
                .sentAt(LocalDateTime.now())
                .isDeleted(false)
                .build();

        message = messageRepository.save(message);

        // Update conversation's updatedAt timestamp
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return message;
    }

    /** Retrieve all non-deleted messages for a conversation, ordered by sentAt ASC. */
    public List<Message> getMessages(String conversationId) {
        return messageRepository
                .findByConversation_ConversationIdAndIsDeletedFalseOrderBySentAtAsc(conversationId);
    }

    /** Soft-delete a message (only the sender can delete their own message). */
    public Message deleteMessage(String messageId, String requestingUserId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));

        if (!message.getSender().getUserId().equals(requestingUserId)) {
            throw new RuntimeException("You can only delete your own messages");
        }

        message.setIsDeleted(true);
        return messageRepository.save(message);
    }

    /**
     * Mark all unread messages in a conversation as READ for the given user,
     * and update the participant's lastReadAt timestamp.
     */
    public void markConversationAsRead(String conversationId, String userId) {

        List<Message> messages = messageRepository
                .findByConversation_ConversationIdAndIsDeletedFalseOrderBySentAtAsc(conversationId);

        messages.stream()
                .filter(m -> !m.getSender().getUserId().equals(userId))
                .filter(m -> m.getStatus() != MessageStatus.READ)
                .forEach(m -> {
                    m.setStatus(MessageStatus.READ);
                    messageRepository.save(m);
                });

        // Update lastReadAt for the participant
        participantRepository.findByConversation_ConversationIdAndUser_UserId(conversationId, userId)
                .ifPresent(p -> {
                    p.setLastReadAt(LocalDateTime.now());
                    participantRepository.save(p);
                });
    }

    /** Attach a media file reference to an existing message. */
    public MessageMedia addMedia(String messageId, MediaType mediaType,
                                 String url, String fileName, Long sizeBytes) {

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));

        MessageMedia media = MessageMedia.builder()
                .message(message)
                .mediaType(mediaType)
                .url(url)
                .fileName(fileName)
                .sizeBytes(sizeBytes)
                .build();

        return messageMediaRepository.save(media);
    }

    /** Retrieve all media attached to a message. */
    public List<MessageMedia> getMediaForMessage(String messageId) {
        return messageMediaRepository.findByMessage_MessageId(messageId);
    }
}