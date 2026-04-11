import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private baseUrl = '/api/images';

  constructor(private http: HttpClient) {}

  // Upload d'une image unique
  uploadImage(file: File): Observable<{ imageUrl: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imageUrl: string; fileName: string }>(`${this.baseUrl}/upload`, formData);
  }

  // Upload d'images multiples
  uploadImages(files: FileList): Observable<{ images: string[] }> {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<{ images: string[] }>(`${this.baseUrl}/upload-multiple`, formData);
  }

  // Suppression d'une image
  deleteImage(imageUrl: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete?url=${encodeURIComponent(imageUrl)}`);
  }

  // Validation du type de fichier
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Type de fichier non supporté. Formats acceptés : JPG, PNG, WebP, GIF'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'L\'image ne doit pas dépasser 5MB'
      };
    }

    return { valid: true };
  }

  // Validation avant upload
  validateBeforeUpload(file: File): boolean {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      return false;
    }
    return true;
  }
}
