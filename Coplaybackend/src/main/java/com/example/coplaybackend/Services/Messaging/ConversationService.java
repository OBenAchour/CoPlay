package com.example.coplaybackend.Services.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Messaging.*;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Messaging.ConversationRepository;
import com.example.coplaybackend.Repositories.Messaging.MessageRepository;
import com.example.coplaybackend.Repositories.Messaging.ParticipantRepository;
import com.example.coplaybackend.DTOs.Messaging.ConversationListItem;
import java.util.ArrayList;
import java.util.Optional;
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
            User user;
            if (userId.contains("@")) {
                user = userRepository.findByEmail(userId)
                        .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            } else {
                user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            }

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
        String resolvedUserId = userId;
        if (userId != null && userId.contains("@")) {
            resolvedUserId = userRepository.findByEmail(userId)
                    .map(User::getId)
                    .orElse(userId);
        }

        return participantRepository.findByUser_UserIdAndIsActiveTrue(resolvedUserId)
                .stream()
                .map(Participant::getConversation)
                .filter(c -> !c.getIsArchived())
                .collect(Collectors.toList());
    }

    /** Archive a conversation (soft-delete). */
    public Conversation archiveConversation(String conversationId, String requestingUserId) {
        // Check if user is admin
        Participant participant = participantRepository
                .findByConversation_ConversationIdAndUser_UserId(conversationId, requestingUserId)
                .orElseThrow(() -> new RuntimeException("Access denied: User is not a participant in this conversation"));

        if (participant.getRole() != ParticipantRole.ADMIN) {
            throw new RuntimeException("Access denied: Only admins can archive conversations");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
        conversation.setIsArchived(true);
        conversation.setUpdatedAt(LocalDateTime.now());
        return conversationRepository.save(conversation);
    }

    /** Get a single conversation by ID. */
    public Conversation getConversation(String conversationId, String requestingUserId) {
        // Check if user is participant
        boolean isParticipant = participantRepository
                .existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(conversationId, requestingUserId);

        if (!isParticipant) {
            throw new RuntimeException("Access denied: User is not a participant in this conversation");
        }

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
                .filter(m -> !m.getSender().getId().equals(userId))
                .filter(m -> participant.getLastReadAt() == null
                        || m.getSentAt().isAfter(participant.getLastReadAt()))
                .count();
    }
    public List<ConversationListItem> getConversationsForUserWithDetails(String userId) {
        // 1. Resolve email to MongoDB ID if needed
        String resolvedUserId = userId;
        if (userId != null && userId.contains("@")) {
            resolvedUserId = userRepository.findByEmail(userId)
                    .map(User::getId)
                    .orElse(userId);
        }

        // 2. Get all active conversations for this user
        List<Participant> participations = participantRepository
                .findByUser_UserIdAndIsActiveTrue(resolvedUserId);

        List<ConversationListItem> result = new ArrayList<>();

        for (Participant participation : participations) {
            Conversation conv = participation.getConversation();

            if (conv.getIsArchived() != null && conv.getIsArchived()) {
                continue;
            }

            // 3. Get last message
            Optional<Message> lastMsgOpt = messageRepository
                    .findFirstByConversation_ConversationIdAndIsDeletedFalseOrderBySentAtDesc(
                            conv.getConversationId());

            String lastMessageContent = null;
            LocalDateTime lastMessageTime = null;
            if (lastMsgOpt.isPresent()) {
                Message lastMsg = lastMsgOpt.get();
                // For sent messages (content), show text
                // For other types, you might show "[Media]", "[Call]", etc.
                lastMessageContent = lastMsg.getContent();
                lastMessageTime = lastMsg.getSentAt();
            }

            // 4. Calculate unread count
            long unreadCount = countUnread(conv.getConversationId(), resolvedUserId);

            // 5. Determine conversation name and other user (for DIRECT)
            String name = conv.getName();
            String otherUserId = null;
            String otherUserAvatar = null;

            if (conv.getType() == ConversationType.DIRECT) {
                // For DIRECT chats, find the other participant
                List<Participant> otherParticipants = participantRepository
                        .findByConversation_ConversationIdAndIsActiveTrue(conv.getConversationId());

                for (Participant p : otherParticipants) {
                    if (!p.getUser().getId().equals(resolvedUserId)) {
                        // This is the other user
                        User otherUser = p.getUser();
                        name = otherUser.getProfile().getDisplayName();
                        otherUserId = otherUser.getId();
                        otherUserAvatar = name != null && !name.isEmpty()
                                ? name.substring(0, 1).toUpperCase()
                                : "?";
                        break;
                    }
                }
            } else {
                // For GROUP/TEAM, use conversation name
                name = conv.getName() != null ? conv.getName() : "Sans nom";
                otherUserAvatar = name.substring(0, 1).toUpperCase();
            }

            // 6. Build and add item
            ConversationListItem item = ConversationListItem.builder()
                    .conversationId(conv.getConversationId())
                    .type(conv.getType())
                    .name(name)
                    .otherUserId(otherUserId)
                    .otherUserAvatar(otherUserAvatar)
                    .lastMessageContent(lastMessageContent)
                    .lastMessageTime(lastMessageTime)
                    .unreadCount(unreadCount)
                    .build();

            result.add(item);
        }

        // 7. Sort by last message time (most recent first), null times at end
        result.sort((a, b) -> {
            if (a.getLastMessageTime() == null && b.getLastMessageTime() == null) return 0;
            if (a.getLastMessageTime() == null) return 1;
            if (b.getLastMessageTime() == null) return -1;
            return b.getLastMessageTime().compareTo(a.getLastMessageTime());
        });

        return result;
    }
}

