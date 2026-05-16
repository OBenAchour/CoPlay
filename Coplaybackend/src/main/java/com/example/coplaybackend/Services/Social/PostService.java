package com.example.coplaybackend.Services.Social;

import com.example.coplaybackend.DTOs.Social.CommentDTO;
import com.example.coplaybackend.DTOs.Social.CreatePostRequest;
import com.example.coplaybackend.DTOs.Social.PostDTO;
import com.example.coplaybackend.DTOs.Social.UpdatePostRequest;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Events.Event;
import com.example.coplaybackend.Entities.Social.Comment;
import com.example.coplaybackend.Entities.Social.Like;
import com.example.coplaybackend.Entities.Social.Post;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Events.EventRepository;
import com.example.coplaybackend.Repositories.Social.CommentRepository;
import com.example.coplaybackend.Repositories.Social.LikeRepository;
import com.example.coplaybackend.Repositories.Social.PostRepository;
import com.example.coplaybackend.Services.Messaging.LocalStorageProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final LocalStorageProvider localStorageProvider;

    public PostDTO createPost(String authorId, CreatePostRequest request) {
        User author = resolveUser(authorId);

        Post post = Post.builder()
                .author(author)
                .type(request.getType())
                .content(request.getContent())
                .photoUrl(request.getPhotoUrl() != null && !request.getPhotoUrl().isBlank() ? request.getPhotoUrl() : null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isDeleted(false)
                .build();

        if (request.getEventRefId() != null) {
            Event event = eventRepository.findById(request.getEventRefId())
                    .orElseThrow(() -> new RuntimeException("Event not found: " + request.getEventRefId()));
            post.setEventRef(event);
        }

        Post saved = postRepository.save(post);
        return toDTO(saved);
    }

    public List<PostDTO> getAllPosts() {
        return postRepository.findByIsDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PostDTO getPostById(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));

        if (Boolean.TRUE.equals(post.getIsDeleted())) {
            throw new RuntimeException("Post has been deleted");
        }

        return toDTO(post);
    }

    public List<PostDTO> getPostsByUser(String authorId) {
        return postRepository.findByAuthor_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(authorId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PostDTO updatePost(String postId, String requestingUserId, UpdatePostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));

        String resolvedUserId = resolveUser(requestingUserId).getUserId();
        if (!post.getAuthor().getUserId().equals(resolvedUserId)) {
            throw new RuntimeException("You can only edit your own posts");
        }

        post.setType(request.getType());
        post.setContent(request.getContent());
        post.setPhotoUrl(request.getPhotoUrl() != null && !request.getPhotoUrl().isBlank() ? request.getPhotoUrl() : null);
        post.setUpdatedAt(LocalDateTime.now());

        if (request.getEventRefId() != null) {
            Event event = eventRepository.findById(request.getEventRefId())
                    .orElseThrow(() -> new RuntimeException("Event not found: " + request.getEventRefId()));
            post.setEventRef(event);
        } else {
            post.setEventRef(null);
        }

        Post saved = postRepository.save(post);
        return toDTO(saved);
    }

    public void deletePost(String postId, String requestingUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));

        String resolvedUserId = resolveUser(requestingUserId).getUserId();
        if (!post.getAuthor().getUserId().equals(resolvedUserId)) {
            throw new RuntimeException("You can only delete your own posts");
        }

        post.setIsDeleted(true);
        post.setUpdatedAt(LocalDateTime.now());
        postRepository.save(post);
    }

    public PostDTO uploadPostPhoto(String postId, String requestingUserId, MultipartFile file) throws IOException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));

        String resolvedUserId = resolveUser(requestingUserId).getUserId();
        if (!post.getAuthor().getUserId().equals(resolvedUserId)) {
            throw new RuntimeException("You can only add photos to your own posts");
        }

        String storedFileRef = localStorageProvider.storeFile(file);
        String photoUrl = "http://localhost:8080/api/posts/photos/" + storedFileRef.split("\\|")[0];
        post.setPhotoUrl(photoUrl);
        post.setUpdatedAt(LocalDateTime.now());

        Post saved = postRepository.save(post);
        return toDTO(saved);
    }

    public boolean toggleLike(String postId, String requestingUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));

        User user = resolveUser(requestingUserId);
        String resolvedUserId = user.getUserId();

        Optional<Like> existingLike = likeRepository.findByUserId_UserIdAndPost_PostId(resolvedUserId, postId);

        if (existingLike.isPresent()) {
            likeRepository.deleteByUserId_UserIdAndPost_PostId(resolvedUserId, postId);
            return false;
        } else {
            Like like = Like.builder()
                    .userId(user)
                    .targetType(com.example.coplaybackend.Entities.Social.LikeTargetType.POST)
                    .post(post)
                    .createdAt(LocalDateTime.now())
                    .build();
            likeRepository.save(like);
            return true;
        }
    }

    public boolean isPostLikedByUser(String postId, String requestingUserId) {
        try {
            User user = resolveUser(requestingUserId);
            return likeRepository.findByUserId_UserIdAndPost_PostId(user.getUserId(), postId).isPresent();
        } catch (Exception e) {
            return false;
        }
    }

    public List<CommentDTO> getComments(String postId) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found: " + postId);
        }

        return commentRepository.findByPost_PostIdAndIsDeletedFalseOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::toCommentDTO)
                .collect(Collectors.toList());
    }

    public CommentDTO addComment(String postId, String requestingUserId, String content, String parentCommentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));

        User author = resolveUser(requestingUserId);

        Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .content(content)
                .createdAt(LocalDateTime.now())
                .isDeleted(false)
                .build();

        if (parentCommentId != null && !parentCommentId.isBlank()) {
            Comment parent = commentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found: " + parentCommentId));
            comment.setParentComment(parent);
        }

        Comment saved = commentRepository.save(comment);
        return toCommentDTO(saved);
    }

    public void deleteComment(String commentId, String requestingUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));

        String resolvedUserId = resolveUser(requestingUserId).getUserId();
        if (!comment.getAuthor().getUserId().equals(resolvedUserId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        comment.setIsDeleted(true);
        commentRepository.save(comment);
    }

    private User resolveUser(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
        }
        return userRepository.findById(identifier)
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
    }

    private PostDTO toDTO(Post post) {
        long likeCount = likeRepository.countByPost_PostId(post.getPostId());
        long commentCount = commentRepository.countByPost_PostIdAndIsDeletedFalse(post.getPostId());

        return PostDTO.builder()
                .postId(post.getPostId())
                .author(post.getAuthor())
                .type(post.getType())
                .content(post.getContent())
                .photoUrl(post.getPhotoUrl())
                .eventRef(post.getEventRef())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .likeCount(likeCount)
                .commentCount(commentCount)
                .build();
    }

    private CommentDTO toCommentDTO(Comment comment) {
        return CommentDTO.builder()
                .commentId(comment.getCommentId())
                .author(comment.getAuthor())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .isDeleted(Boolean.TRUE.equals(comment.getIsDeleted()))
                .build();
    }
}
