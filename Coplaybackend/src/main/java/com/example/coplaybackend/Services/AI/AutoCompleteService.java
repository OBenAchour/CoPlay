package com.example.coplaybackend.Services.AI;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutoCompleteService {

    private final AIClient aiClient;

    private static final String SYSTEM_PROMPT =
            "Tu es un assistant de completion de messages pour une application de messagerie sportive. " +
                    "Ta tâche est de suggérer la suite naturelle du message de l'utilisateur. " +
                    "Les suggestions doivent être courtes (1-5 mots), naturelles et adaptées au contexte sportif. " +
                    "Réponds UNIQUEMENT avec la suggestion, sans explanation, sans ponctuation finale.";

    public String suggestCompletion(String messagePrefix, String context) {
        String prompt = buildPrompt(messagePrefix, context);
        String suggestion = aiClient.complete(prompt);

        if (suggestion != null) {
            suggestion = cleanSuggestion(suggestion);
        }

        return suggestion;
    }

    public List<String> suggestMultiple(String messagePrefix, String context, int count) {
        try {
            String prompt = buildPromptMultiple(messagePrefix, context, count);
            String suggestions = aiClient.complete(prompt);

            if (suggestions != null && !suggestions.isBlank()) {
                List<String> parsed = parseMultipleSuggestions(suggestions, count);
                if (!parsed.isEmpty()) {
                    return parsed;
                }
            }
        } catch (Exception e) {
            log.warn("AI API failed, using fallback: {}", e.getMessage());
        }

        List<String> fallback = getFallbackSuggestions(messagePrefix);
        log.info("Returning {} fallback suggestions for '{}'", fallback.size(), messagePrefix);
        return fallback;
    }

    private String buildPrompt(String prefix, String context) {
        StringBuilder sb = new StringBuilder();
        sb.append(SYSTEM_PROMPT).append("\n\n");

        if (context != null && !context.isEmpty()) {
            sb.append("Contexte de la conversation:\n").append(context).append("\n\n");
        }

        sb.append("Message actuel: ").append(prefix).append("\n");
        sb.append("Suggestion:");

        return sb.toString();
    }

    private String buildPromptMultiple(String prefix, String context, int count) {
        StringBuilder sb = new StringBuilder();
        sb.append(SYSTEM_PROMPT).append("\n\n");

        if (context != null && !context.isEmpty()) {
            sb.append("Contexte de la conversation:\n").append(context).append("\n\n");
        }

        sb.append("Message actuel: ").append(prefix).append("\n");
        sb.append("Donne ").append(count).append(" suggestions courtes séparées par des |:\n");
        sb.append("Suggestion:");

        return sb.toString();
    }

    private String cleanSuggestion(String suggestion) {
        suggestion = suggestion.trim();

        if (suggestion.startsWith("\"")) {
            suggestion = suggestion.substring(1);
        }
        if (suggestion.endsWith("\"")) {
            suggestion = suggestion.substring(0, suggestion.length() - 1);
        }

        suggestion = suggestion.replaceAll("^[.!?,\\s]+", "");

        if (suggestion.length() > 100) {
            suggestion = suggestion.substring(0, 100);
        }

        return suggestion.trim();
    }

    private List<String> parseMultipleSuggestions(String suggestions, int count) {
        String[] parts = suggestions.split("\\|");
        return java.util.Arrays.stream(parts)
                .map(this::cleanSuggestion)
                .filter(s -> !s.isEmpty())
                .limit(count)
                .toList();
    }

    private List<String> getFallbackSuggestions(String prefix) {
        List<List<String>> fallbacks = List.of(
                List.of(" ça ressemble", " on y va", " bonne idée"),
                List.of(" je suis d'accord", " parfait", " top"),
                List.of(" à bientôt", " bon match", " c'est parti"),
                List.of(" oui, exactement", " bien joué", " super")
        );

        int index = Math.abs(prefix.hashCode()) % fallbacks.size();
        return fallbacks.get(index);
    }
}