package com.example.coplaybackend.Services.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Messaging.*;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Messaging.ConversationRepository;
import com.example.coplaybackend.Repositories.Messaging.MessageMediaRepository;
import com.example.coplaybackend.Repositories.Messaging.MessageRepository;
import com.example.coplaybackend.Repositories.Messaging.ParticipantRepository;
import com.example.coplaybackend.Services.Audit.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
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
    private final FileStorageService fileStorageService;
    private final AuditService auditService;
    /**
     * Send a text message to a conversation.
     * Verifies that the sender is an active participant before persisting.
     */
    public Message sendMessage(String conversationId, String senderId, String content) {

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

        User sender;
        if (senderId.contains("@")) {
            sender = userRepository.findByEmail(senderId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + senderId));
        } else {
            sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + senderId));
        }

        boolean isParticipant = participantRepository
                .existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(conversationId, sender.getUserId());
        if (!isParticipant) {
            throw new RuntimeException("User " + senderId + " is not an active participant of this conversation");
        }

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
        auditService.logMessageSent(senderId, message.getMessageId(), conversationId);
        return message;

    }

    /** Retrieve all non-deleted messages for a conversation, ordered by sentAt ASC. */
    public List<Message> getMessages(String conversationId, String requestingUserId) {
        String resolvedUserId = requestingUserId;

        if (requestingUserId.contains("@")) {
            User user = userRepository.findByEmail(requestingUserId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + requestingUserId));
            resolvedUserId = user.getUserId();
        }

        boolean isParticipant = participantRepository
                .existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(conversationId, resolvedUserId);

        if (!isParticipant) {
            throw new RuntimeException("Access denied: User is not a participant in this conversation");
        }

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
        auditService.logMessageDeleted(requestingUserId, messageId);
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

    /** Update message status (DELIVERED, READ) */
    public Message updateMessageStatus(String messageId, MessageStatus newStatus, String requestingUserId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));

        // Verify requesting user is participant of the conversation
        boolean isParticipant = participantRepository
                .existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(
                        message.getConversation().getConversationId(), requestingUserId);

        if (!isParticipant) {
            throw new RuntimeException("Access denied: User is not a participant in this conversation");
        }

        // Only allow transitioning to DELIVERED or READ
        if (newStatus != MessageStatus.DELIVERED && newStatus != MessageStatus.READ) {
            throw new RuntimeException("Invalid status transition: only DELIVERED and READ are allowed");
        }

        // Ensure status progression (can't go backwards)
        if (message.getStatus() == MessageStatus.READ && newStatus == MessageStatus.DELIVERED) {
            throw new RuntimeException("Cannot downgrade message status from READ to DELIVERED");
        }

        message.setStatus(newStatus);
        return messageRepository.save(message);
    }

    /** Mark multiple messages as READ */
    public void markMessagesAsRead(String conversationId, List<String> messageIds, String requestingUserId) {
        // Verify requesting user is participant
        boolean isParticipant = participantRepository
                .existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(conversationId, requestingUserId);

        if (!isParticipant) {
            throw new RuntimeException("Access denied: User is not a participant in this conversation");
        }

        messageIds.forEach(messageId -> {
            Message message = messageRepository.findById(messageId)
                    .filter(m -> m.getConversation().getConversationId().equals(conversationId))
                    .orElseThrow(() -> new RuntimeException("Message not found or doesn't belong to this conversation"));

            if (message.getStatus() != MessageStatus.READ) {
                message.setStatus(MessageStatus.READ);
                messageRepository.save(message);
            }
        });
    }

    /** Get unread message count for a user in a conversation */
    public long getUnreadCount(String conversationId, String requestingUserId) {
        // Verify requesting user is participant
        boolean isParticipant = participantRepository
                .existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(conversationId, requestingUserId);

        if (!isParticipant) {
            throw new RuntimeException("Access denied: User is not a participant in this conversation");
        }

        List<Message> messages = messageRepository
                .findByConversation_ConversationIdAndIsDeletedFalseOrderBySentAtAsc(conversationId);

        return messages.stream()
                .filter(m -> m.getStatus() != MessageStatus.READ)
                .filter(m -> !m.getSender().getUserId().equals(requestingUserId))
                .count();
    }

    /**
     * Upload media file for a message
     */
    public MessageMedia uploadMediaForMessage(String messageId, MultipartFile file, String requestingUserId) throws IOException {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));

        // Verify requesting user is the sender
        if (!message.getSender().getUserId().equals(requestingUserId)) {
            throw new RuntimeException("Access denied: Only the message sender can add media");
        }

        // Verify requesting user is participant
        boolean isParticipant = participantRepository
                .existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(
                        message.getConversation().getConversationId(), requestingUserId);

        if (!isParticipant) {
            throw new RuntimeException("Access denied: User is not a participant in this conversation");
        }

        // Store file
        String storedFileName = fileStorageService.storeFile(file);
        long fileSize = file.getSize();

        // Determine media type from MIME type
        MediaType mediaType = getMediaTypeFromMimeType(file.getContentType());

        // Create MessageMedia entity
        MessageMedia media = MessageMedia.builder()
                .message(message)
                .mediaType(mediaType)
                .url("/api/files/download/" + storedFileName)
                .fileName(storedFileName)
                .fileName(file.getOriginalFilename())
                .sizeBytes(fileSize)
                .build();

        return messageMediaRepository.save(media);
    }

    /**
     * Determine MediaType from MIME type
     */
    private MediaType getMediaTypeFromMimeType(String mimeType) {
        if (mimeType == null) {
            return MediaType.OTHER;
        }

        if (mimeType.startsWith("image/")) {
            return MediaType.IMAGE;
        } else if (mimeType.startsWith("video/")) {
            return MediaType.VIDEO;
        } else if (mimeType.startsWith("audio/")) {
            return MediaType.AUDIO;
        } else if (mimeType.equals("application/pdf")) {
            return MediaType.PDF;
        } else if (mimeType.contains("word") || mimeType.contains("document")) {
            return MediaType.DOCUMENT;
        }
        return MediaType.OTHER;
    }


}