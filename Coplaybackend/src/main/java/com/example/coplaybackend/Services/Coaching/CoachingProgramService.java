package com.example.coplaybackend.Services.Coaching;

import com.example.coplaybackend.Entities.Coaching.CoachingProgram;
import com.example.coplaybackend.Repositories.Coaching.CoachingProgramRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CoachingProgramService {

    private final CoachingProgramRepository repo;

    public CoachingProgram create(CoachingProgram p) {
        p.setCoachId(SecurityUtils.getCurrentUserId());
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        if (p.getStatus() == null) p.setStatus("DRAFT");
        return repo.save(p);
    }

    public CoachingProgram update(String id, CoachingProgram input) {
        CoachingProgram p = getById(id);
        ensureCoach(p.getCoachId());
        if (input.getTitle() != null) p.setTitle(input.getTitle());
        if (input.getDescription() != null) p.setDescription(input.getDescription());
        if (input.getObjective() != null) p.setObjective(input.getObjective());
        if (input.getLevel() != null) p.setLevel(input.getLevel());
        if (input.getDurationWeeks() != null) p.setDurationWeeks(input.getDurationWeeks());
        if (input.getWeeklyPlan() != null) p.setWeeklyPlan(input.getWeeklyPlan());
        if (input.getStatus() != null) p.setStatus(input.getStatus());
        p.setUpdatedAt(LocalDateTime.now());
        return repo.save(p);
    }

    public CoachingProgram assign(String id, String clientId, String clientType) {
        CoachingProgram p = getById(id);
        ensureCoach(p.getCoachId());
        p.setClientId(clientId);
        p.setClientType(clientType != null ? clientType : "USER");
        p.setStatus("ACTIVE");
        p.setUpdatedAt(LocalDateTime.now());
        return repo.save(p);
    }

    public CoachingProgram completeDay(String programId, int weekIdx, int dayIdx) {
        CoachingProgram p = getById(programId);
        if (weekIdx < 0 || weekIdx >= p.getWeeklyPlan().size()) throw new RuntimeException("Semaine invalide");
        CoachingProgram.WeekPlan week = p.getWeeklyPlan().get(weekIdx);
        if (dayIdx < 0 || dayIdx >= week.getDays().size()) throw new RuntimeException("Jour invalide");
        week.getDays().get(dayIdx).setCompleted(true);
        p.setUpdatedAt(LocalDateTime.now());
        return repo.save(p);
    }

    public CoachingProgram getById(String id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Programme introuvable"));
    }

    public List<CoachingProgram> listByCoach(String coachId) {
        return repo.findByCoachId(coachId);
    }

    public List<CoachingProgram> listMineAsClient() {
        return repo.findByClientId(SecurityUtils.getCurrentUserId());
    }

    public void delete(String id) {
        CoachingProgram p = getById(id);
        ensureCoach(p.getCoachId());
        repo.deleteById(id);
    }

    private void ensureCoach(String coachId) {
        if (!Objects.equals(coachId, SecurityUtils.getCurrentUserId())) {
            throw new RuntimeException("Action interdite");
        }
    }
}
