package com.example.coplaybackend.Controllers.Marketplace;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Controller pour la gestion des images du marketplace
 * Permet l'upload, la suppression et le stockage des images
 */
@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:4200")
public class ImageController {

    @Value("${image.upload.directory:./uploads/images}")
    private String uploadDirectory;

    @Value("${app.base.url:http://localhost:8080}")
    private String baseUrl;

    /**
     * Upload d'une image unique
     * POST /api/images/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<ImageUploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file) {

        try {
            // Validation du type de fichier
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(new ImageUploadResponse(null, null, "Type de fichier invalide"));
            }

            // Validation de la taille (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(new ImageUploadResponse(null, null, "L'image ne doit pas dépasser 5MB"));
            }

            // Créer le répertoire d'upload s'il n'existe pas
            Path uploadPath = Paths.get(uploadDirectory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Générer un nom de fichier unique
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Sauvegarder le fichier
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Construire l'URL publique
            String imageUrl = baseUrl + "/uploads/images/" + uniqueFilename;

            return ResponseEntity.ok(new ImageUploadResponse(imageUrl, uniqueFilename, null));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(new ImageUploadResponse(null, null, "Erreur lors de l'upload de l'image: " + e.getMessage()));
        }
    }

    /**
     * Upload d'images multiples
     * POST /api/images/upload-multiple
     */
    @PostMapping("/upload-multiple")
    public ResponseEntity<MultipleImagesUploadResponse> uploadMultipleImages(
            @RequestParam("files") MultipartFile[] files) {

        try {
            List<String> imageUrls = new ArrayList<>();

            for (MultipartFile file : files) {
                ResponseEntity<ImageUploadResponse> response = uploadImage(file);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    imageUrls.add(response.getBody().getImageUrl());
                }
            }

            return ResponseEntity.ok(new MultipleImagesUploadResponse(imageUrls));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new MultipleImagesUploadResponse(new ArrayList<>()));
        }
    }

    /**
     * Suppression d'une image par URL
     * DELETE /api/images/delete?url={imageUrl}
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteImage(@RequestParam("url") String imageUrl) {
        try {
            // Extraire le nom du fichier de l'URL
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);

            Path filePath = Paths.get(uploadDirectory).resolve(filename);

            // Supprimer le fichier s'il existe
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * DTO pour la réponse d'upload d'image
     */
    private static class ImageUploadResponse {
        private final String imageUrl;
        private final String fileName;
        private final String error;

        public ImageUploadResponse(String imageUrl, String fileName, String error) {
            this.imageUrl = imageUrl;
            this.fileName = fileName;
            this.error = error;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public String getFileName() {
            return fileName;
        }

        public String getError() {
            return error;
        }
    }

    /**
     * DTO pour la réponse d'upload d'images multiples
     */
    private static class MultipleImagesUploadResponse {
        private final List<String> images;

        public MultipleImagesUploadResponse(List<String> images) {
            this.images = images;
        }

        public List<String> getImages() {
            return images;
        }
    }
}
