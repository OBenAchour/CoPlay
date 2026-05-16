package com.example.coplaybackend.Controllers.Coaching;

import com.example.coplaybackend.Entities.Coaching.LibraryExercise;
import com.example.coplaybackend.Services.Coaching.ExerciseLibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/coaching/exercises")
@RequiredArgsConstructor
public class ExerciseLibraryController {

    private final ExerciseLibraryService service;

    @PostMapping
    public ResponseEntity<LibraryExercise> create(@RequestBody LibraryExercise e) {
        return ResponseEntity.ok(service.create(e));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibraryExercise> update(@PathVariable String id, @RequestBody LibraryExercise e) {
        return ResponseEntity.ok(service.update(id, e));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LibraryExercise> get(@PathVariable String id) { return ResponseEntity.ok(service.getById(id)); }

    @GetMapping
    public ResponseEntity<Page<LibraryExercise>> list(@RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.list(page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<LibraryExercise>> search(@RequestParam String q,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.search(q, page, size));
    }

    @GetMapping("/by-muscle")
    public ResponseEntity<List<LibraryExercise>> byMuscle(@RequestParam String muscle) {
        return ResponseEntity.ok(service.byMuscle(muscle));
    }

    @PostMapping("/{id}/video")
    public ResponseEntity<LibraryExercise> uploadVideo(@PathVariable String id,
                                                       @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(service.uploadVideo(id, file));
    }

    @PostMapping("/{id}/thumbnail")
    public ResponseEntity<LibraryExercise> uploadThumbnail(@PathVariable String id,
                                                           @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(service.uploadThumbnail(id, file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
