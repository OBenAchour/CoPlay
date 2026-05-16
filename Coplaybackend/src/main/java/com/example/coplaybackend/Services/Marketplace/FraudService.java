package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.FraudReport;
import com.example.coplaybackend.Repositories.Marketplace.FraudReportRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FraudService {

    private final FraudReportRepository fraudReportRepository;

    public FraudReport report(String targetId, String targetType, String reason) {
        return fraudReportRepository.save(FraudReport.builder()
                .targetId(targetId)
                .targetType(targetType)
                .reporterId(SecurityUtils.getCurrentUserId())
                .reason(reason)
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .build());
    }

    public FraudReport saveAiAnalysis(String targetId, String targetType, double score, String analysis) {
        return fraudReportRepository.save(FraudReport.builder()
                .targetId(targetId)
                .targetType(targetType)
                .reporterId("AI_SYSTEM")
                .reason("Détection automatique IA")
                .aiScore(score)
                .aiAnalysis(analysis)
                .status(score > 0.7 ? "OPEN" : "REVIEWED")
                .createdAt(LocalDateTime.now())
                .build());
    }

    public Page<FraudReport> listOpen(int page, int size) {
        return fraudReportRepository.findByStatus("OPEN", PageRequest.of(page, size));
    }

    public FraudReport updateStatus(String reportId, String status) {
        FraudReport r = fraudReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        r.setStatus(status);
        r.setReviewedAt(LocalDateTime.now());
        return fraudReportRepository.save(r);
    }
}
