package com.example.coplaybackend.Services.Coaching;

import com.example.coplaybackend.DTOs.Coaching.CoachProfileRequest;
import com.example.coplaybackend.Entities.Coaching.CoachProfile;
import com.example.coplaybackend.Repositories.Coaching.CoachProfileRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CoachProfileService {

    private final CoachProfileRepository repo;

    public CoachProfile upsert(CoachProfileRequest req) {
        String userId = SecurityUtils.getCurrentUserId();
        CoachProfile profile = repo.findByUserId(userId).orElseGet(() ->
                CoachProfile.builder()
                        .userId(userId)
                        .specialties(new ArrayList<>())
                        .certifications(new ArrayList<>())
                        .availability(new ArrayList<>())
                        .createdAt(LocalDateTime.now())
                        .build());

        if (req.getBio() != null) profile.setBio(req.getBio());
        if (req.getSpecialties() != null) profile.setSpecialties(req.getSpecialties());
        if (req.getCertifications() != null) profile.setCertifications(req.getCertifications());
        if (req.getYearsExperience() != null) profile.setYearsExperience(req.getYearsExperience());
        if (req.getHourlyRate() != null) profile.setHourlyRate(req.getHourlyRate());
        if (req.getAvailability() != null) profile.setAvailability(req.getAvailability());
        if (req.getCity() != null) profile.setCity(req.getCity());
        if (req.getLatitude() != null) profile.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) profile.setLongitude(req.getLongitude());
        profile.setUpdatedAt(LocalDateTime.now());
        return repo.save(profile);
    }

    public CoachProfile getMine() {
        return repo.findByUserId(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new RuntimeException("Profil coach non créé"));
    }

    public CoachProfile getById(String coachProfileId) {
        return repo.findById(coachProfileId)
                .orElseThrow(() -> new RuntimeException("Profil coach introuvable"));
    }

    public CoachProfile getByUserId(String userId) {
        return repo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profil coach introuvable"));
    }

    public Page<CoachProfile> listVerified(int page, int size) {
        return repo.findByVerifiedTrue(PageRequest.of(page, size));
    }

    public Page<CoachProfile> listAll(int page, int size) {
        return repo.findAll(PageRequest.of(page, size));
    }

    public CoachProfile verify(String coachProfileId, boolean verified) {
        CoachProfile p = getById(coachProfileId);
        p.setVerified(verified);
        p.setUpdatedAt(LocalDateTime.now());
        return repo.save(p);
    }

    public CoachProfile verifyCertification(String coachProfileId, int idx, boolean verified) {
        CoachProfile p = getById(coachProfileId);
        if (idx < 0 || idx >= p.getCertifications().size()) throw new RuntimeException("Index invalide");
        p.getCertifications().get(idx).setVerified(verified);
        p.setUpdatedAt(LocalDateTime.now());
        return repo.save(p);
    }
}
