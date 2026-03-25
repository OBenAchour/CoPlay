package com.example.coplaybackend.Services.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Messaging.*;
import com.example.coplaybackend.Repositories.Messaging.ConversationRepository;
import com.example.coplaybackend.Repositories.Messaging.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.coplaybackend.Repositories.Events.UserRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    /** Add a user to a conversation. Throws if already an active participant. */
    public Participant addParticipant(String conversationId, String userId, ParticipantRole role) {

        boolean alreadyIn = participantRepository
                .existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(conversationId, userId);
        if (alreadyIn) {
            throw new RuntimeException("User " + userId + " is already in this conversation");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Participant participant = Participant.builder()
                .conversation(conversation)
                .user(user)
                .role(role)
                .joinedAt(LocalDateTime.now())
                .isActive(true)
                .build();

        return participantRepository.save(participant);
    }

    /** Remove a user from a conversation (soft-deactivate). */
    public Participant removeParticipant(String conversationId, String userId) {
        Participant participant = participantRepository
                .findByConversation_ConversationIdAndUser_UserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        participant.setIsActive(false);
        return participantRepository.save(participant);
    }

    /** List all active participants in a conversation. */
    public List<Participant> getParticipants(String conversationId) {
        return participantRepository.findByConversation_ConversationIdAndIsActiveTrue(conversationId);
    }

    /** Promote or demote a participant's role. */
    public Participant updateRole(String conversationId, String userId, ParticipantRole newRole) {
        Participant participant = participantRepository
                .findByConversation_ConversationIdAndUser_UserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        participant.setRole(newRole);
        return participantRepository.save(participant);
    }
}