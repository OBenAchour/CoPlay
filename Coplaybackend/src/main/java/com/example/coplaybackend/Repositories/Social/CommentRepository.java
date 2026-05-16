package com.example.coplaybackend.Repositories.Social;

import com.example.coplaybackend.Entities.Social.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByPost_PostIdAndIsDeletedFalseOrderByCreatedAtAsc(String postId);

    List<Comment> findByParentComment_CommentIdAndIsDeletedFalseOrderByCreatedAtAsc(String parentCommentId);

    long countByPost_PostIdAndIsDeletedFalse(String postId);
}
