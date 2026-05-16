package com.example.coplaybackend.Entities.Coaching;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "recovery_advices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecoveryAdvice {

    @Id
    private String adviceId;

    @Indexed
    private String userId;

    private LocalDateTime date;
    private String recommendation;
    private Integer restDaysSuggested;
    private Double riskScore;          // 0..1
    private String acwrLabel;          // LOW / OK / HIGH
}
