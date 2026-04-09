package com.example.coplaybackend.Services.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Messaging.Message;
import com.example.coplaybackend.Entities.Messaging.MessageReaction;
import com.example.coplaybackend.Entities.Messaging.ReactionType;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Messaging.MessageReactionRepository;
import com.example.coplaybackend.Repositories.Messaging.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final MessageReactionRepository reactionRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageReaction addOrUpdateReaction(String messageId, String userEmail, ReactionType reactionType) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<MessageReaction> existingReaction = reactionRepository
                .findByMessage_MessageIdAndUser_UserId(messageId, user.getUserId());

        MessageReaction reaction;
        if (existingReaction.isPresent()) {
            reaction = existingReaction.get();
            reaction.setReactionType(reactionType);
            reaction.setUpdatedAt(LocalDateTime.now());
        } else {
            reaction = MessageReaction.builder()
                    .message(message)
                    .user(user)
                    .reactionType(reactionType)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        }

        return reactionRepository.save(reaction);
    }

    public void removeReaction(String messageId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<MessageReaction> reaction = reactionRepository
                .findByMessage_MessageIdAndUser_UserId(messageId, user.getUserId());

        if (reaction.isPresent()) {
            reactionRepository.delete(reaction.get());
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

    public Optional<ReactionType> getUserReaction(String messageId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElse(null);
        if (user == null) return Optional.empty();

        return reactionRepository
                .findByMessage_MessageIdAndUser_UserId(messageId, user.getUserId())
                .map(MessageReaction::getReactionType);
    }

    public long getTotalReactionCount(String messageId) {
        return reactionRepository.countByMessage_MessageId(messageId);
    }
}