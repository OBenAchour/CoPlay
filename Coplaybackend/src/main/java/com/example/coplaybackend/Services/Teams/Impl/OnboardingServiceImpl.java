package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.OnboardingMessage;
import com.example.coplaybackend.Entities.Teams.OnboardingMessage.MessageEntry;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Entities.Teams.TeamMember;
import com.example.coplaybackend.Repositories.Teams.OnboardingMessageRepository;
import com.example.coplaybackend.Repositories.Teams.TeamMemberRepository;
import com.example.coplaybackend.Repositories.Teams.TeamRepository;
import com.example.coplaybackend.Services.Teams.OnboardingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OnboardingServiceImpl implements OnboardingService {

    private final OnboardingMessageRepository onboardingRepo;
    private final TeamMemberRepository memberRepo;
    private final TeamRepository teamRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Override
    public Map<String, Object> chat(String teamId, String userId, String userMessage) {

        Team team = teamRepo.findById(teamId).orElseThrow(
                () -> new RuntimeException("Équipe non trouvée")
        );
        TeamMember member = memberRepo.findByTeamIdAndUserIdAndActiveTrue(teamId, userId)
                .orElse(TeamMember.builder()
                        .teamId(teamId)
                        .userId(userId)
                        .roleEquipe(RoleEquipe.PLAYER)
                        .build());

        // Récupérer ou créer la session
        OnboardingMessage session = onboardingRepo
                .findByTeamIdAndUserId(teamId, userId)
                .orElse(OnboardingMessage.builder()
                        .teamId(teamId)
                        .userId(userId)
                        .messages(new ArrayList<>())
                        .createdAt(LocalDateTime.now())
                        .build());

        // Ajouter le message utilisateur
        session.getMessages().add(MessageEntry.builder()
                .role("user")
                .content(userMessage)
                .timestamp(LocalDateTime.now())
                .build());

        // Construire l'historique pour l'API Groq
        List<Map<String, String>> apiMessages = new ArrayList<>();
        for (MessageEntry entry : session.getMessages()) {
            apiMessages.add(Map.of("role", entry.getRole(), "content", entry.getContent()));
        }

        // Système prompt contextualisé
        String systemPrompt = buildSystemPrompt(team, member);

        // Appel Groq
        String assistantReply = callGroq(systemPrompt, apiMessages);

        // Sauvegarder la réponse
        session.getMessages().add(MessageEntry.builder()
                .role("assistant")
                .content(assistantReply)
                .timestamp(LocalDateTime.now())
                .build());
        session.setUpdatedAt(LocalDateTime.now());
        onboardingRepo.save(session);

        return Map.of(
                "reply", assistantReply,
                "role", member.getRoleEquipe().name(),
                "teamName", team.getName()
        );
    }

    @Override
    public List<MessageEntry> getHistory(String teamId, String userId) {
        return onboardingRepo.findByTeamIdAndUserId(teamId, userId)
                .map(OnboardingMessage::getMessages)
                .orElse(List.of());
    }

    @Override
    public void clearHistory(String teamId, String userId) {
        onboardingRepo.findByTeamIdAndUserId(teamId, userId)
                .ifPresent(s -> {
                    s.setMessages(new ArrayList<>());
                    onboardingRepo.save(s);
                });
    }

    private String buildSystemPrompt(Team team, TeamMember member) {
        String roleLabel = switch (member.getRoleEquipe()) {
            case PLAYER -> "joueur";
            case COACH -> "coach";
            case STAFF -> "membre du staff";
            default -> "membre";
        };
        return String.format("""
            Tu es l'assistant d'onboarding de l'équipe "%s" (sport : %s, ville : %s).
            Tu accueilles un nouveau %s qui vient de rejoindre l'équipe.
            Ton rôle :
            - Présenter l'équipe, ses règles et ses valeurs
            - Répondre aux questions sur l'organisation, les entraînements, les rôles
            - Guider le nouveau membre étape par étape
            - Rester encourageant, professionnel et concis
            Réponds uniquement en français. Si tu ne sais pas quelque chose, dis-le clairement.
            """,
                team.getName(),
                team.getSport(),
                team.getCity() != null ? team.getCity() : "non précisée",
                roleLabel
        );
    }

    @SuppressWarnings("unchecked")
    private String callGroq(String systemPrompt, List<Map<String, String>> messages) {
        try {
            // Ajoute le system message en premier
            List<Map<String, String>> fullMessages = new ArrayList<>();
            fullMessages.add(Map.of("role", "user", "content", systemPrompt));
            fullMessages.addAll(messages);

            Map<String, Object> bodyMap = new HashMap<>();
            bodyMap.put("model", "llama-3.3-70b-versatile");
            bodyMap.put("max_tokens", 1000);
            bodyMap.put("messages", fullMessages);

            String jsonBody = objectMapper.writeValueAsString(bodyMap);

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://api.groq.com/openai/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request,
                    java.net.http.HttpResponse.BodyHandlers.ofString());

            System.out.println("=== GROQ STATUS: " + response.statusCode());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Groq API error: " + response.body());
            }

            Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");

        } catch (Exception e) {
            System.err.println("=== GROQ ERROR: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la communication avec l'IA: " + e.getMessage());
        }
    }
}