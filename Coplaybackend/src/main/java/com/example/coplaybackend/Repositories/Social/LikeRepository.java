package com.example.coplaybackend.Repositories.Social;

import com.example.coplaybackend.Entities.Social.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends MongoRepository<Like, String> {

    long countByPost_PostId(String postId);

    long countByComment_CommentId(String commentId);

    List<Like> findByPost_PostId(String postId);

    List<Like> findByComment_CommentId(String commentId);

    Optional<Like> findByUserId_UserIdAndPost_PostId(String userId, String postId);

    Optional<Like> findByUserId_UserIdAndComment_CommentId(String userId, String commentId);

    void deleteByUserId_UserIdAndPost_PostId(String userId, String postId);

    void deleteByUserId_UserIdAndComment_CommentId(String userId, String commentId);
}
