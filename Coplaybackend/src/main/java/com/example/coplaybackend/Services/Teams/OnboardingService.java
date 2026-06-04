package com.example.coplaybackend.Services.Teams;

import com.example.coplaybackend.Entities.Teams.OnboardingMessage.MessageEntry;
import java.util.List;
import java.util.Map;

public interface OnboardingService {
    Map<String, Object> chat(String teamId, String userId, String userMessage);
    List<MessageEntry> getHistory(String teamId, String userId);
    void clearHistory(String teamId, String userId);
}