package com.example.coplaybackend.Services.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Messaging.Message;
import com.example.coplaybackend.Entities.Messaging.MessageReaction;
import com.example.coplaybackend.Entities.Messaging.ReactionType;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Messaging.MessageReactionRepository;
import com.example.coplaybackend.Repositories.Messaging.MessageRepository;
import com.example.coplaybackend.Services.Audit.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReactionService {

    private final MessageReactionRepository reactionRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public MessageReaction addOrUpdateReaction(String messageId, String userId, ReactionType reactionType) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<MessageReaction> existingReaction = reactionRepository
                .findByMessage_MessageIdAndUser_UserId(messageId, userId);

        MessageReaction reaction;
        if (existingReaction.isPresent()) {
            reaction = existingReaction.get();
            ReactionType oldType = reaction.getReactionType();
            reaction.setReactionType(reactionType);
            reaction.setUpdatedAt(LocalDateTime.now());
            log.info("Updating reaction from {} to {} for message {} by user {}",
                    oldType, reactionType, messageId, userId);
        } else {
            reaction = MessageReaction.builder()
                    .message(message)
                    .user(user)
                    .reactionType(reactionType)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            log.info("Adding reaction {} to message {} by user {}", reactionType, messageId, userId);
        }

        reaction = reactionRepository.save(reaction);

        auditService.logAction(userId, "REACTION_ADDED", "MESSAGING", "MessageReaction",
                reaction.getReactionId(), null, Map.of("reactionType", reactionType.name()), true, null);

        return reaction;
    }

    public void removeReaction(String messageId, String userId) {
        Optional<MessageReaction> reaction = reactionRepository
                .findByMessage_MessageIdAndUser_UserId(messageId, userId);

        if (reaction.isPresent()) {
            reactionRepository.delete(reaction.get());
            log.info("Removing reaction from message {} by user {}", messageId, userId);

            auditService.logAction(userId, "REACTION_REMOVED", "MESSAGING", "MessageReaction",
                    reaction.get().getReactionId(), null, null, true, null);
        }
    }

    public List<MessageReaction> getReactionsForMessage(String messageId) {
        return reactionRepository.findByMessage_MessageId(messageId);
    }

    public Map<ReactionType, Long> getReactionCountsForMessage(String messageId) {
        List<MessageReaction> reactions = reactionRepository.findByMessage_MessageId(messageId);

        Map<ReactionType, Long> counts = new EnumMap<>(ReactionType.class);
        for (ReactionType type : ReactionType.values()) {
            counts.put(type, 0L);
        }

        reactions.forEach(r -> counts.merge(r.getReactionType(), 1L, Long::sum));

        return counts;
    }

    public Optional<ReactionType> getUserReaction(String messageId, String userId) {
        return reactionRepository
                .findByMessage_MessageIdAndUser_UserId(messageId, userId)
                .map(MessageReaction::getReactionType);
    }

    public long getTotalReactionCount(String messageId) {
        return reactionRepository.countByMessage_MessageId(messageId);
    }
}