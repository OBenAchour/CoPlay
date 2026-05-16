package com.example.coplaybackend.Services.Coaching;

import com.example.coplaybackend.DTOs.Coaching.InjuryRequest;
import com.example.coplaybackend.Entities.Coaching.Injury;
import com.example.coplaybackend.Repositories.Coaching.InjuryRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class InjuryService {

    private final InjuryRepository injuryRepository;

    public Injury create(InjuryRequest req) {
        Injury i = Injury.builder()
                .userId(SecurityUtils.getCurrentUserId())
                .bodyPart(req.getBodyPart())
                .type(req.getType())
                .severity(req.getSeverity())
                .dateOccurred(req.getDateOccurred())
                .expectedRecovery(req.getExpectedRecovery())
                .status(req.getStatus() != null ? req.getStatus() : "ACTIVE")
                .notes(req.getNotes())
                .recoveryPlan(req.getRecoveryPlan())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return injuryRepository.save(i);
    }

    public Injury update(String injuryId, InjuryRequest req) {
        Injury i = getById(injuryId);
        ensureOwner(i.getUserId());
        if (req.getBodyPart() != null) i.setBodyPart(req.getBodyPart());
        if (req.getType() != null) i.setType(req.getType());
        if (req.getSeverity() != null) i.setSeverity(req.getSeverity());
        if (req.getDateOccurred() != null) i.setDateOccurred(req.getDateOccurred());
        if (req.getExpectedRecovery() != null) i.setExpectedRecovery(req.getExpectedRecovery());
        if (req.getStatus() != null) i.setStatus(req.getStatus());
        if (req.getNotes() != null) i.setNotes(req.getNotes());
        if (req.getRecoveryPlan() != null) i.setRecoveryPlan(req.getRecoveryPlan());
        i.setUpdatedAt(LocalDateTime.now());
        return injuryRepository.save(i);
    }

    public Injury getById(String id) {
        return injuryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blessure introuvable"));
    }

    public List<Injury> listMine() {
        return injuryRepository.findByUserId(SecurityUtils.getCurrentUserId());
    }

    public List<Injury> listActiveFor(String userId) {
        return injuryRepository.findByUserIdAndStatus(userId, "ACTIVE");
    }

    public void delete(String injuryId) {
        Injury i = getById(injuryId);
        ensureOwner(i.getUserId());
        injuryRepository.deleteById(injuryId);
    }

    private void ensureOwner(String userId) {
        if (!Objects.equals(userId, SecurityUtils.getCurrentUserId())) {
            throw new RuntimeException("Action interdite");
        }
    }
}
