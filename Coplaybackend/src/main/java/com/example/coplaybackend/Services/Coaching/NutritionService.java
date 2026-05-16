package com.example.coplaybackend.Services.Coaching;

import com.example.coplaybackend.Entities.Coaching.NutritionPlan;
import com.example.coplaybackend.Repositories.Coaching.NutritionPlanRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NutritionService {

    private final NutritionPlanRepository repo;

    public NutritionPlan create(NutritionPlan p) {
        p.setUserId(SecurityUtils.getCurrentUserId());
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        return repo.save(p);
    }

    public NutritionPlan update(String planId, NutritionPlan input) {
        NutritionPlan p = getById(planId);
        if (input.getObjective() != null) p.setObjective(input.getObjective());
        if (input.getDailyCalories() != null) p.setDailyCalories(input.getDailyCalories());
        if (input.getProteinsG() != null) p.setProteinsG(input.getProteinsG());
        if (input.getCarbsG() != null) p.setCarbsG(input.getCarbsG());
        if (input.getFatsG() != null) p.setFatsG(input.getFatsG());
        if (input.getHydrationGoalMl() != null) p.setHydrationGoalMl(input.getHydrationGoalMl());
        if (input.getMeals() != null) p.setMeals(input.getMeals());
        p.setUpdatedAt(LocalDateTime.now());
        return repo.save(p);
    }

    public NutritionPlan getById(String id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Plan nutrition introuvable"));
    }

    public List<NutritionPlan> listMine() {
        return repo.findByUserId(SecurityUtils.getCurrentUserId());
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}
