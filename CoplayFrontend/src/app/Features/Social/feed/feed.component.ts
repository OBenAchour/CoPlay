import { Component, OnInit } from '@angular/core';
import { PostService, CreatePostRequest } from '../../../Core/Services/Social/post.service';
import { Post } from '../../../Core/Models/Social/Post';
import { PostType } from '../../../Core/Models/Social/PostType';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment, CreateCommentRequest } from '../../../Core/Models/Social/Comment';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  createPostForm: FormGroup;
  loading = false;
  error: string | null = null;
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;
  postComments: Map<string, Comment[]> = new Map();
  commentForms: Map<string, FormGroup> = new Map();
  expandedComments: Set<string> = new Set();
  likedPosts: Set<string> = new Set();

  constructor(
    private postService: PostService,
    private fb: FormBuilder
  ) {
    this.createPostForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(5000)]],
    });
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.posts.forEach(post => {
          if (post.postId) {
            this.commentForms.set(post.postId, this.fb.group({
              content: ['', [Validators.required, Validators.maxLength(1000)]]
            }));
            this.postService.isPostLiked(post.postId).subscribe({
              next: (liked) => {
                if (liked) this.likedPosts.add(post.postId!);
              }
            });
          }
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load posts';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.createPostForm.invalid) return;

    const type = this.selectedPhoto ? PostType.PHOTO : PostType.TEXT;
    const request: CreatePostRequest = {
      type,
      content: this.createPostForm.value.content
    };
    this.loading = true;

    this.postService.createPost(request).subscribe({
      next: (post) => {
        if (this.selectedPhoto && post.postId) {
          this.postService.uploadPostPhoto(post.postId, this.selectedPhoto).subscribe({
            next: (updatedPost) => {
              this.posts.unshift(updatedPost);
              this.loading = false;
              this.resetForm();
            },
            error: () => {
              this.error = 'Post created but photo upload failed';
              this.loading = false;
            }
          });
        } else {
          this.posts.unshift(post);
          this.loading = false;
          this.resetForm();
        }
      },
      error: () => {
        this.error = 'Failed to create post';
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.createPostForm.reset({ content: '' });
    this.selectedPhoto = null;
    this.photoPreview = null;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.error = 'Only image files are allowed (JPEG, PNG, GIF, etc.)';
        input.value = '';
        return;
      }
      this.error = null;
      this.selectedPhoto = file;
      const reader = new FileReader();
      reader.onload = () => { this.photoPreview = reader.result as string; };
      reader.readAsDataURL(this.selectedPhoto);
    }
  }

  clearPhoto(): void {
    this.selectedPhoto = null;
    this.photoPreview = null;
  }

  onDelete(postId: string): void {
    if (!confirm('Are you sure you want to delete this post?')) return;
    this.postService.deletePost(postId).subscribe({
      next: () => { this.posts = this.posts.filter(p => p.postId !== postId); },
      error: () => { this.error = 'Failed to delete post'; }
    });
  }

  onToggleLike(postId: string): void {
    this.postService.toggleLike(postId).subscribe({
      next: (liked) => {
        const post = this.posts.find(p => p.postId === postId);
        if (post) {
          if (liked) {
            this.likedPosts.add(postId);
            post.likeCount = (post.likeCount || 0) + 1;
          } else {
            this.likedPosts.delete(postId);
            post.likeCount = Math.max(0, (post.likeCount || 1) - 1);
          }
        }
      }
    });
  }

  toggleComments(postId: string): void {
    if (this.expandedComments.has(postId)) {
      this.expandedComments.delete(postId);
    } else {
      this.expandedComments.add(postId);
      this.loadComments(postId);
    }
  }

  loadComments(postId: string): void {
    this.postService.getComments(postId).subscribe({
      next: (comments) => { this.postComments.set(postId, comments); }
    });
  }

  onSubmitComment(postId: string): void {
    const form = this.commentForms.get(postId);
    if (!form || form.invalid) return;

    this.postService.addComment(postId, { content: form.value.content }).subscribe({
      next: (comment) => {
        const comments = this.postComments.get(postId) || [];
        comments.push(comment);
        this.postComments.set(postId, comments);
        const post = this.posts.find(p => p.postId === postId);
        if (post) post.commentCount = (post.commentCount || 0) + 1;
        form.reset();
      },
      error: () => { this.error = 'Failed to add comment'; }
    });
  }

  onDeleteComment(postId: string, commentId: string): void {
    this.postService.deleteComment(commentId).subscribe({
      next: () => {
        const comments = this.postComments.get(postId) || [];
        this.postComments.set(postId, comments.filter(c => c.commentId !== commentId));
        const post = this.posts.find(p => p.postId === postId);
        if (post) post.commentCount = Math.max(0, (post.commentCount || 1) - 1);
      },
      error: () => { this.error = 'Failed to delete comment'; }
    });
  }

  getRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  getCommentForm(postId: string): FormGroup {
    if (!this.commentForms.has(postId)) {
      this.commentForms.set(postId, this.fb.group({
        content: ['', [Validators.required, Validators.maxLength(1000)]]
      }));
    }
    return this.commentForms.get(postId)!;
  }

  getInitials(name: string): string {
    return (name || '?').charAt(0).toUpperCase();
  }

  getAvatarColor(id: string): string {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#a18cd1', '#fbc2eb', '#84fab0'];
    let hash = 0;
    for (let i = 0; i < (id || '').length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
