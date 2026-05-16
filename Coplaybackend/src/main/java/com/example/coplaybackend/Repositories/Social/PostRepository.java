package com.example.coplaybackend.Repositories.Social;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Social.Post;
import com.example.coplaybackend.Entities.Social.PostType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {

    List<Post> findByIsDeletedFalseOrderByCreatedAtDesc();

    List<Post> findByAuthor_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(String authorId);

    List<Post> findByTypeAndIsDeletedFalseOrderByCreatedAtDesc(PostType type);

    List<Post> findByEventRef_EventIdAndIsDeletedFalseOrderByCreatedAtDesc(String eventId);
}
