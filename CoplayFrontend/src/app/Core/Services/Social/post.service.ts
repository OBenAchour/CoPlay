import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../../Models/Social/Post';
import { PostType } from '../../Models/Social/PostType';
import { Comment, CreateCommentRequest } from '../../Models/Social/Comment';

export interface CreatePostRequest {
  type: PostType;
  content: string;
  photoUrl?: string;
  eventRefId?: string;
}

export interface UpdatePostRequest {
  type: PostType;
  content: string;
  photoUrl?: string;
  eventRefId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8080/api/posts';

  constructor(private http: HttpClient) {}

  createPost(request: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, request);
  }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  getPostsByUser(authorId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/user/${authorId}`);
  }

  updatePost(id: string, request: UpdatePostRequest): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, request);
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadPostPhoto(postId: string, file: File): Observable<Post> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Post>(`${this.apiUrl}/${postId}/photo`, formData);
  }

  toggleLike(postId: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/${postId}/like`, {});
  }

  isPostLiked(postId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${postId}/liked`);
  }

  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}/comments`);
  }

  addComment(postId: string, request: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${postId}/comments`, request);
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }
}
