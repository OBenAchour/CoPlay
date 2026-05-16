package com.example.coplaybackend.Services.Coaching;

import com.example.coplaybackend.Entities.Coaching.PerformanceMetric;
import com.example.coplaybackend.Entities.Coaching.RecoveryAdvice;
import com.example.coplaybackend.Repositories.Coaching.PerformanceMetricRepository;
import com.example.coplaybackend.Repositories.Coaching.RecoveryAdviceRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PerformanceAnalysisService {

    private final PerformanceMetricRepository metricRepository;
    private final RecoveryAdviceRepository recoveryRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public PerformanceMetric record(PerformanceMetric m) {
        m.setUserId(SecurityUtils.getCurrentUserId());
        if (m.getSessionLoad() == null && m.getRpe() != null && m.getMinutes() != null) {
            m.setSessionLoad((double) (m.getRpe() * m.getMinutes()));
        }
        if (m.getDate() == null) m.setDate(LocalDate.now());
        PerformanceMetric saved = metricRepository.save(m);
        evaluateRiskAndAdvise(saved.getUserId());
        return saved;
    }

    public List<PerformanceMetric> listMine() {
        return metricRepository.findByUserId(SecurityUtils.getCurrentUserId());
    }

    /**
     * ACWR: Acute (7d) workload divided by Chronic (28d) workload.
     * - <0.8 : LOW (under-training)
     * - 0.8..1.3 : OK
     * - >1.5 : HIGH (injury risk spike)
     */
    public Map<String, Object> computeAcwr(String userId) {
        LocalDate today = LocalDate.now();
        List<PerformanceMetric> last28 = metricRepository.findByUserIdAndDateBetween(
                userId, today.minusDays(28), today);
        if (last28.isEmpty()) return Map.of("acwr", 0.0, "label", "NONE");

        double acute = last28.stream()
                .filter(m -> m.getDate() != null && !m.getDate().isBefore(today.minusDays(7)))
                .mapToDouble(m -> nz(m.getSessionLoad())).sum() / 7.0;

        double chronic = last28.stream()
                .mapToDouble(m -> nz(m.getSessionLoad())).sum() / 28.0;

        double acwr = chronic == 0 ? 0 : acute / chronic;
        String label;
        if (acwr == 0) label = "NONE";
        else if (acwr < 0.8) label = "LOW";
        else if (acwr <= 1.3) label = "OK";
        else if (acwr <= 1.5) label = "ELEVATED";
        else label = "HIGH";

        return Map.of("acwr", round2(acwr), "label", label,
                "acute7d", round2(acute), "chronic28d", round2(chronic));
    }

    private void evaluateRiskAndAdvise(String userId) {
        Map<String, Object> r = computeAcwr(userId);
        String label = (String) r.get("label");
        if ("HIGH".equals(label) || "ELEVATED".equals(label)) {
            int rest = "HIGH".equals(label) ? 2 : 1;
            String reco = "HIGH".equals(label)
                    ? "Charge aigüe trop élevée vs charge chronique. Repos recommandé pendant 2 jours."
                    : "Charge en hausse. Allègez la prochaine séance et surveillez les signaux de fatigue.";
            RecoveryAdvice advice = recoveryRepository.save(RecoveryAdvice.builder()
                    .userId(userId)
                    .date(LocalDateTime.now())
                    .recommendation(reco)
                    .restDaysSuggested(rest)
                    .riskScore("HIGH".equals(label) ? 0.85 : 0.6)
                    .acwrLabel(label)
                    .build());
            messagingTemplate.convertAndSend("/queue/user-" + userId + "/coaching",
                    (Object) Map.of("type", "INJURY_RISK", "label", label, "adviceId", advice.getAdviceId()));
        }
    }

    private static double nz(Double d) { return d == null ? 0.0 : d; }

    private static double round2(double v) { return Math.round(v * 100.0) / 100.0; }
}
