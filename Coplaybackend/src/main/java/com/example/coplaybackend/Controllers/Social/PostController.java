package com.example.coplaybackend.Controllers.Social;

import com.example.coplaybackend.DTOs.Social.CommentDTO;
import com.example.coplaybackend.DTOs.Social.CreateCommentRequest;
import com.example.coplaybackend.DTOs.Social.CreatePostRequest;
import com.example.coplaybackend.DTOs.Social.PostDTO;
import com.example.coplaybackend.DTOs.Social.UpdatePostRequest;
import com.example.coplaybackend.Services.Messaging.LocalStorageProvider;
import com.example.coplaybackend.Services.Social.PostService;
import com.example.coplaybackend.Utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.io.IOException;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Social Posts", description = "CRUD operations for social media posts")
@Slf4j
public class PostController {

    private final PostService postService;
    private final LocalStorageProvider localStorageProvider;

    @PostMapping
    @Operation(summary = "Create a new post")
    public ResponseEntity<PostDTO> createPost(@Valid @RequestBody CreatePostRequest request) {
        String authorId = SecurityUtils.getCurrentUserId();
        log.info("Creating post by user: {}", authorId);
        PostDTO post = postService.createPost(authorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @GetMapping
    @Operation(summary = "Get all posts")
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        log.info("Fetching all posts");
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get post by ID")
    public ResponseEntity<PostDTO> getPostById(@PathVariable String id) {
        log.info("Fetching post: {}", id);
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @GetMapping("/user/{authorId}")
    @Operation(summary = "Get posts by user")
    public ResponseEntity<List<PostDTO>> getPostsByUser(@PathVariable String authorId) {
        log.info("Fetching posts for user: {}", authorId);
        return ResponseEntity.ok(postService.getPostsByUser(authorId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a post")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable String id,
            @Valid @RequestBody UpdatePostRequest request) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Updating post: {} by user: {}", id, requestingUserId);
        return ResponseEntity.ok(postService.updatePost(id, requestingUserId, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a post (soft delete)")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Deleting post: {} by user: {}", id, requestingUserId);
        postService.deletePost(id, requestingUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/photo")
    @Operation(summary = "Upload a photo for a post")
    public ResponseEntity<PostDTO> uploadPhoto(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Uploading photo for post: {} by user: {}", id, requestingUserId);
        PostDTO post = postService.uploadPostPhoto(id, requestingUserId, file);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/photos/{filename}")
    @Operation(summary = "Get post photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable String filename) throws IOException {
        byte[] imageBytes = localStorageProvider.getFile(filename);
        return ResponseEntity.ok()
                .header("Content-Type", "image/*")
                .body(imageBytes);
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Toggle like on a post")
    public ResponseEntity<Boolean> toggleLike(@PathVariable String id) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Toggling like on post: {} by user: {}", id, requestingUserId);
        boolean liked = postService.toggleLike(id, requestingUserId);
        return ResponseEntity.ok(liked);
    }

    @GetMapping("/{id}/liked")
    @Operation(summary = "Check if current user has liked a post")
    public ResponseEntity<Boolean> isPostLiked(@PathVariable String id) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        boolean liked = postService.isPostLikedByUser(id, requestingUserId);
        return ResponseEntity.ok(liked);
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get all comments for a post")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable String id) {
        log.info("Fetching comments for post: {}", id);
        return ResponseEntity.ok(postService.getComments(id));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a comment to a post")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable String id,
            @Valid @RequestBody CreateCommentRequest request) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Adding comment to post: {} by user: {}", id, requestingUserId);
        CommentDTO comment = postService.addComment(id, requestingUserId, request.getContent(), request.getParentCommentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a comment (soft delete)")
    public ResponseEntity<Void> deleteComment(@PathVariable String commentId) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Deleting comment: {} by user: {}", commentId, requestingUserId);
        postService.deleteComment(commentId, requestingUserId);
        return ResponseEntity.noContent().build();
    }
}
