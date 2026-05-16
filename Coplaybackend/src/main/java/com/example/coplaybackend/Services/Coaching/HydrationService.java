package com.example.coplaybackend.Services.Coaching;

import com.example.coplaybackend.Entities.Coaching.HydrationLog;
import com.example.coplaybackend.Repositories.Coaching.HydrationLogRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HydrationService {

    private final HydrationLogRepository repo;

    public HydrationLog log(int ml, Integer goalMl) {
        String userId = SecurityUtils.getCurrentUserId();
        LocalDate today = LocalDate.now();
        HydrationLog h = repo.findByUserIdAndDate(userId, today).orElseGet(() ->
                HydrationLog.builder().userId(userId).date(today).ml(0).goalMl(goalMl).build());
        h.setMl((h.getMl() == null ? 0 : h.getMl()) + ml);
        if (goalMl != null) h.setGoalMl(goalMl);
        return repo.save(h);
    }

    public List<HydrationLog> listRange(LocalDate from, LocalDate to) {
        return repo.findByUserIdAndDateBetween(SecurityUtils.getCurrentUserId(), from, to);
    }
}
