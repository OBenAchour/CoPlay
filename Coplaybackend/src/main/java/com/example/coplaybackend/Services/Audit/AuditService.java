package com.example.coplaybackend.Services.Audit;

import com.example.coplaybackend.Entities.Auth.AuditLog;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Repositories.Auth.AuditLogRepository;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void logAction(String actorId, String action, String module,
                          String resourceType, String resourceId,
                          Map<String, Object> oldValue, Map<String, Object> newValue,
                          boolean success, String errorMessage) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .actorId(actorId)
                    .action(action)
                    .module(module)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .performedAt(LocalDateTime.now())
                    .success(success)
                    .errorMessage(errorMessage)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log created: {} - {} - {}", actorId, action, resourceType);
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage(), e);
        }
    }

    public void logMessageSent(String senderId, String messageId, String conversationId) {
        Map<String, Object> newValue = new HashMap<>();
        newValue.put("messageId", messageId);
        newValue.put("conversationId", conversationId);

        logAction(senderId, "MESSAGE_SENT", "MESSAGING", "Message", messageId, null, newValue, true, null);
    }

    public void logMessageDeleted(String userId, String messageId) {
        Map<String, Object> oldValue = new HashMap<>();
        oldValue.put("messageId", messageId);
        oldValue.put("deleted", false);

        Map<String, Object> newValue = new HashMap<>();
        newValue.put("messageId", messageId);
        newValue.put("deleted", true);

        logAction(userId, "MESSAGE_DELETED", "MESSAGING", "Message", messageId, oldValue, newValue, true, null);
    }

    public void logConversationCreated(String creatorId, String conversationId, String conversationName) {
        Map<String, Object> newValue = new HashMap<>();
        newValue.put("conversationId", conversationId);
        newValue.put("name", conversationName);

        logAction(creatorId, "CONVERSATION_CREATED", "MESSAGING", "Conversation", conversationId, null, newValue, true, null);
    }

    public void logParticipantAdded(String adminId, String participantId, String conversationId) {
        Map<String, Object> newValue = new HashMap<>();
        newValue.put("participantId", participantId);
        newValue.put("conversationId", conversationId);

        logAction(adminId, "PARTICIPANT_ADDED", "MESSAGING", "Participant", participantId, null, newValue, true, null);
    }

    public void logParticipantRemoved(String adminId, String participantId, String conversationId) {
        Map<String, Object> oldValue = new HashMap<>();
        oldValue.put("participantId", participantId);
        oldValue.put("conversationId", conversationId);
        oldValue.put("removed", false);

        Map<String, Object> newValue = new HashMap<>();
        newValue.put("participantId", participantId);
        newValue.put("conversationId", conversationId);
        newValue.put("removed", true);

        logAction(adminId, "PARTICIPANT_REMOVED", "MESSAGING", "Participant", participantId, oldValue, newValue, true, null);
    }

    public void logLogin(String userId, boolean success, String errorMessage) {
        logAction(userId, "LOGIN", "AUTH", "User", userId, null, null, success, errorMessage);
    }

    public void logLogout(String userId) {
        logAction(userId, "LOGOUT", "AUTH", "User", userId, null, null, true, null);
    }

    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByPerformedAtDesc(pageable);
    }

    public Page<AuditLog> getLogsByUser(String actorId, Pageable pageable) {
        return auditLogRepository.findByActorIdOrderByPerformedAtDesc(actorId, pageable);
    }

    public Page<AuditLog> getLogsByModule(String module, Pageable pageable) {
        return auditLogRepository.findByModuleOrderByPerformedAtDesc(module, pageable);
    }

    public Page<AuditLog> getLogsByResource(String resourceType, String resourceId, Pageable pageable) {
        return auditLogRepository.findByResourceTypeAndResourceIdOrderByPerformedAtDesc(resourceType, resourceId, pageable);
    }

    public Page<AuditLog> getLogsByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return auditLogRepository.findByPerformedAtBetweenOrderByPerformedAtDesc(start, end, pageable);
    }

    public Page<AuditLog> getLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByActionOrderByPerformedAtDesc(action, pageable);
    }

    public long getTotalLogCount() {
        return auditLogRepository.count();
    }

    public long getLogCountByModule(String module) {
        return auditLogRepository.countByModule(module);
    }

    public List<Map<String, Object>> getModuleStatistics() {
        List<AuditLog> logs = auditLogRepository.findAll();
        Map<String, Long> stats = logs.stream()
                .collect(java.util.stream.Collectors.groupingBy(AuditLog::getModule, java.util.stream.Collectors.counting()));

        return stats.entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("module", e.getKey());
                    map.put("count", e.getValue());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Map<String, Object>> getActionStatistics() {
        List<AuditLog> logs = auditLogRepository.findAll();
        Map<String, Long> stats = logs.stream()
                .collect(java.util.stream.Collectors.groupingBy(AuditLog::getAction, java.util.stream.Collectors.counting()));

        return stats.entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("action", e.getKey());
                    map.put("count", e.getValue());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public List<AuditLog> getFailedActions(LocalDateTime since) {
        return auditLogRepository.findBySuccessFalseAndPerformedAtAfter(since);
    }

    public void deleteOldLogs(LocalDateTime before) {
        List<AuditLog> oldLogs = auditLogRepository.findByPerformedAtBefore(before);
        auditLogRepository.deleteAll(oldLogs);
        log.info("Deleted {} old audit logs before {}", oldLogs.size(), before);
    }
}