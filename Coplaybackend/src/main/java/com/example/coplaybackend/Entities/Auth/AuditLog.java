package com.example.coplaybackend.Entities.Auth;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@CompoundIndex(name = "module_action_idx", def = "{'module': 1, 'action': 1}")
@CompoundIndex(name = "actor_performed_idx", def = "{'actorId': 1, 'performedAt': -1}")
public class AuditLog {

    @Id
    private String logId;

    @Indexed
    private String actorId;

    @Indexed
    private String action;

    @Indexed
    private String module;

    private String resourceType;

    @Indexed
    private String resourceId;

    private String ipAddress;

    private String userAgent;

    private Map<String, Object> oldValue;

    private Map<String, Object> newValue;

    @Indexed
    private LocalDateTime performedAt;

    private boolean success;

    private String errorMessage;
}