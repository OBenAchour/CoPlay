package com.example.coplaybackend.Services.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Messaging.*;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Messaging.ConversationRepository;
import com.example.coplaybackend.Repositories.Messaging.MessageRepository;
import com.example.coplaybackend.Repositories.Messaging.ParticipantRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    /**
     * Create a new conversation (DIRECT, GROUP or TEAM).
     * For DIRECT conversations between two users, we check that one doesn't already exist.
     */
    public Conversation createConversation(ConversationType type, String name, List<String> participantIds) {

        if (type == ConversationType.DIRECT && participantIds.size() == 2) {
            // Reuse existing direct conversation if present
            String userA = participantIds.get(0);
            String userB = participantIds.get(1);

            List<Participant> userAConvs = participantRepository.findByUser_UserIdAndIsActiveTrue(userA);
            for (Participant p : userAConvs) {
                boolean shared = participantRepository.existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(
                        p.getConversation().getConversationId(), userB);
                if (shared && p.getConversation().getType() == ConversationType.DIRECT) {
                    return p.getConversation();
                }
            }
        }

        Conversation conversation = Conversation.builder()
                .type(type)
                .name(name)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isArchived(false)
                .build();

        conversation = conversationRepository.save(conversation);

        // Add each participant
        for (String userId : participantIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            ParticipantRole role = participantIds.indexOf(userId) == 0
                    ? ParticipantRole.ADMIN
                    : ParticipantRole.MEMBER;

            Participant participant = Participant.builder()
                    .conversation(conversation)
                    .user(user)
                    .role(role)
                    .joinedAt(LocalDateTime.now())
                    .isActive(true)
                    .build();

            participantRepository.save(participant);
        }

        return conversation;
    }

    /** Return all active conversations for a given user. */
    public List<Conversation> getConversationsForUser(String userId) {
        return participantRepository.findByUser_UserIdAndIsActiveTrue(userId)
                .stream()
                .map(Participant::getConversation)
                .filter(c -> !c.getIsArchived())
                .collect(Collectors.toList());
    }

    /** Archive a conversation (soft-delete). */
    public Conversation archiveConversation(String conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
        conversation.setIsArchived(true);
        conversation.setUpdatedAt(LocalDateTime.now());
        return conversationRepository.save(conversation);
    }

    /** Get a single conversation by ID. */
    public Conversation getConversation(String conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
    }

    /** Count unread messages for a participant in a conversation. */
    public long countUnread(String conversationId, String userId) {
        Participant participant = participantRepository
                .findByConversation_ConversationIdAndUser_UserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        return messageRepository.findByConversation_ConversationIdAndIsDeletedFalseOrderBySentAtAsc(conversationId)
                .stream()
                .filter(m -> m.getStatus() != MessageStatus.READ)
                .filter(m -> !m.getSender().getUserId().equals(userId))
                .filter(m -> participant.getLastReadAt() == null
                        || m.getSentAt().isAfter(participant.getLastReadAt()))
                .count();
    }
}