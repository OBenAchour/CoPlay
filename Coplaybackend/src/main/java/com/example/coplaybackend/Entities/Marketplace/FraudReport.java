package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "fraud_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudReport {

    @Id
    private String reportId;

    @Indexed
    private String targetId;

    private String targetType;
    private String reporterId;
    private String reason;

    private Double aiScore;
    private String aiAnalysis;

    @Indexed
    @Builder.Default
    private String status = "OPEN";   // OPEN / REVIEWED / DISMISSED / TARGET_REMOVED

    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
