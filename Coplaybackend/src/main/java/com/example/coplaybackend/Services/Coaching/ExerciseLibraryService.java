package com.example.coplaybackend.Services.Coaching;

import com.example.coplaybackend.Entities.Coaching.LibraryExercise;
import com.example.coplaybackend.Repositories.Coaching.LibraryExerciseRepository;
import com.example.coplaybackend.Services.Messaging.FileStorageService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExerciseLibraryService {

    private final LibraryExerciseRepository repo;
    private final FileStorageService fileStorageService;

    public LibraryExercise create(LibraryExercise e) {
        e.setCreatedBy(SecurityUtils.getCurrentUserId());
        return repo.save(e);
    }

    public LibraryExercise update(String id, LibraryExercise input) {
        LibraryExercise e = getById(id);
        if (input.getName() != null) e.setName(input.getName());
        if (input.getDescription() != null) e.setDescription(input.getDescription());
        if (input.getMuscleGroups() != null) e.setMuscleGroups(input.getMuscleGroups());
        if (input.getEquipmentNeeded() != null) e.setEquipmentNeeded(input.getEquipmentNeeded());
        if (input.getDifficulty() != null) e.setDifficulty(input.getDifficulty());
        if (input.getInstructions() != null) e.setInstructions(input.getInstructions());
        if (input.getCaloriesPerMin() != null) e.setCaloriesPerMin(input.getCaloriesPerMin());
        return repo.save(e);
    }

    public LibraryExercise getById(String id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Exercice introuvable"));
    }

    public Page<LibraryExercise> list(int page, int size) {
        return repo.findByApprovedTrue(PageRequest.of(page, size));
    }

    public Page<LibraryExercise> search(String q, int page, int size) {
        return repo.search(q, PageRequest.of(page, size));
    }

    public List<LibraryExercise> byMuscle(String muscle) {
        return repo.findByMuscleGroupsContaining(muscle);
    }

    public LibraryExercise uploadVideo(String id, MultipartFile file) throws IOException {
        LibraryExercise e = getById(id);
        e.setVideoUrl(fileStorageService.storeFile(file));
        return repo.save(e);
    }

    public LibraryExercise uploadThumbnail(String id, MultipartFile file) throws IOException {
        LibraryExercise e = getById(id);
        e.setThumbnailUrl(fileStorageService.storeFile(file));
        return repo.save(e);
    }

    public void delete(String id) { repo.deleteById(id); }
}
