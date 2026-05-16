package com.example.coplaybackend.Services.Coaching;

import com.example.coplaybackend.Entities.Coaching.ProgressEntry;
import com.example.coplaybackend.Repositories.Coaching.ProgressEntryRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressEntryRepository repo;

    public ProgressEntry record(ProgressEntry e) {
        e.setUserId(SecurityUtils.getCurrentUserId());
        return repo.save(e);
    }

    public List<ProgressEntry> listMine() {
        return repo.findByUserIdOrderByDateAsc(SecurityUtils.getCurrentUserId());
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}
