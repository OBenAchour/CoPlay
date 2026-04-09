package com.example.coplaybackend.Services.Messaging;

import com.example.coplaybackend.DTOs.Messaging.SearchResult;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Messaging.Conversation;
import com.example.coplaybackend.Entities.Messaging.Message;
import com.example.coplaybackend.Entities.Messaging.Participant;
import com.example.coplaybackend.Repositories.Messaging.ConversationRepository;
import com.example.coplaybackend.Repositories.Messaging.MessageRepository;
import com.example.coplaybackend.Repositories.Messaging.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ParticipantRepository participantRepository;

    private static final int CONTEXT_LENGTH = 50;

    public List<SearchResult> searchMessages(String userId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<Conversation> userConversations = getUserConversations(userId);
        List<String> conversationIds = userConversations.stream()
                .map(Conversation::getConversationId)
                .collect(Collectors.toList());

        if (conversationIds.isEmpty()) {
            return new ArrayList<>();
        }

        String searchQuery = query.toLowerCase().trim();
        Pattern pattern = Pattern.compile(Pattern.quote(searchQuery), Pattern.CASE_INSENSITIVE);

        List<SearchResult> results = new ArrayList<>();

        for (String convId : conversationIds) {
            List<Message> messages = messageRepository
                    .findByConversation_ConversationIdAndIsDeletedFalseOrderBySentAtDesc(convId);

            for (Message message : messages) {
                if (message.getContent() != null && pattern.matcher(message.getContent()).find()) {
                    Conversation conversation = message.getConversation();
                    String matchedText = extractContext(message.getContent(), searchQuery, CONTEXT_LENGTH);

                    SearchResult result = SearchResult.builder()
                            .messageId(message.getMessageId())
                            .conversationId(convId)
                            .conversationName(conversation.getName())
                            .sender(message.getSender())
                            .content(message.getContent())
                            .sentAt(message.getSentAt())
                            .matchedText(matchedText)
                            .matchPosition(message.getContent().toLowerCase().indexOf(searchQuery))
                            .build();

                    results.add(result);
                }
            }
        }

        results.sort((a, b) -> b.getSentAt().compareTo(a.getSentAt()));

        return results;
    }

    public List<SearchResult> searchInConversation(String userId, String conversationId, String query) {
        boolean isParticipant = participantRepository
                .existsByConversation_ConversationIdAndUser_UserIdAndIsActiveTrue(conversationId, userId);

        if (!isParticipant) {
            throw new RuntimeException("Access denied: User is not a participant in this conversation");
        }

        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        String searchQuery = query.toLowerCase().trim();
        Pattern pattern = Pattern.compile(Pattern.quote(searchQuery), Pattern.CASE_INSENSITIVE);

        List<Message> messages = messageRepository.findByConversation_ConversationIdAndIsDeletedFalseOrderBySentAtDesc(conversationId);

        Conversation conversation = conversationRepository.findById(conversationId).orElse(null);

        List<SearchResult> results = new ArrayList<>();

        for (Message message : messages) {
            if (message.getContent() != null && pattern.matcher(message.getContent()).find()) {
                String matchedText = extractContext(message.getContent(), searchQuery, CONTEXT_LENGTH);

                SearchResult result = SearchResult.builder()
                        .messageId(message.getMessageId())
                        .conversationId(conversationId)
                        .conversationName(conversation != null ? conversation.getName() : null)
                        .sender(message.getSender())
                        .content(message.getContent())
                        .sentAt(message.getSentAt())
                        .matchedText(matchedText)
                        .matchPosition(message.getContent().toLowerCase().indexOf(searchQuery))
                        .build();

                results.add(result);
            }
        }

        return results;
    }

    private List<Conversation> getUserConversations(String userId) {
        List<Participant> participations = participantRepository
                .findByUser_UserIdAndIsActiveTrue(userId);

        return participations.stream()
                .map(Participant::getConversation)
                .collect(Collectors.toList());
    }

    private String extractContext(String content, String query, int contextLength) {
        int index = content.toLowerCase().indexOf(query.toLowerCase());
        if (index == -1) {
            return content.length() > contextLength ? content.substring(0, contextLength) + "..." : content;
        }

        int start = Math.max(0, index - contextLength);
        int end = Math.min(content.length(), index + query.length() + contextLength);

        String context = content.substring(start, end);

        if (start > 0) {
            context = "..." + context;
        }
        if (end < content.length()) {
            context = context + "...";
        }

        return context;
    }

    public long getTotalResults(String userId, String query) {
        return searchMessages(userId, query).size();
    }
}