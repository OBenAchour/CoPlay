package com.example.coplaybackend.Entities.Auth;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AuditLog {


    @Id
    private String logId;

    private String actorId;          // ref → User

    private String action;

    private Map<String, Object> metaData;

    private LocalDateTime performedAt;
}
