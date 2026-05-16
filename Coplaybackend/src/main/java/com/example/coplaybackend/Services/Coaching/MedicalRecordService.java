package com.example.coplaybackend.Services.Coaching;

import com.example.coplaybackend.Entities.Coaching.MedicalRecord;
import com.example.coplaybackend.Repositories.Coaching.MedicalRecordRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository repo;

    public MedicalRecord upsert(MedicalRecord input) {
        String userId = SecurityUtils.getCurrentUserId();
        MedicalRecord r = repo.findByUserId(userId).orElseGet(() ->
                MedicalRecord.builder()
                        .userId(userId)
                        .createdAt(LocalDateTime.now())
                        .build());
        if (input.getBloodType() != null) r.setBloodType(input.getBloodType());
        if (input.getAllergies() != null) r.setAllergies(input.getAllergies());
        if (input.getChronicConditions() != null) r.setChronicConditions(input.getChronicConditions());
        if (input.getMedications() != null) r.setMedications(input.getMedications());
        if (input.getEmergencyContactName() != null) r.setEmergencyContactName(input.getEmergencyContactName());
        if (input.getEmergencyContactPhone() != null) r.setEmergencyContactPhone(input.getEmergencyContactPhone());
        if (input.getLastCheckup() != null) r.setLastCheckup(input.getLastCheckup());
        if (input.getConsent() != null) r.setConsent(input.getConsent());
        r.setUpdatedAt(LocalDateTime.now());
        return repo.save(r);
    }

    public MedicalRecord getOwn() {
        return repo.findByUserId(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new RuntimeException("Dossier médical inexistant"));
    }

    public MedicalRecord getForUser(String userId) {
        String me = SecurityUtils.getCurrentUserId();
        MedicalRecord r = repo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Dossier médical inexistant"));
        if (!Objects.equals(me, userId)
                && !r.getAuthorizedCoachIds().contains(me)) {
            throw new RuntimeException("Accès refusé au dossier médical");
        }
        return r;
    }

    public MedicalRecord authorizeCoach(String coachUserId) {
        MedicalRecord r = getOwn();
        if (!r.getAuthorizedCoachIds().contains(coachUserId)) {
            r.getAuthorizedCoachIds().add(coachUserId);
            r.setUpdatedAt(LocalDateTime.now());
            repo.save(r);
        }
        return r;
    }

    public MedicalRecord revokeCoach(String coachUserId) {
        MedicalRecord r = getOwn();
        r.getAuthorizedCoachIds().remove(coachUserId);
        r.setUpdatedAt(LocalDateTime.now());
        return repo.save(r);
    }
}
