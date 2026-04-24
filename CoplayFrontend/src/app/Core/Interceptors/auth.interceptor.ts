import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Intercepte toutes les requêtes HTTP sortantes pour y injecter automatiquement le jeton d'authentification (JWT)
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    // Vérifie la présence du token et s'assure que la requête est destinée au backend local avant de modifier les en-têtes
    if (token && req.url.includes('localhost:8080')) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      // Envoie la requête clonée contenant le header d'autorisation
      return next.handle(cloned);
    }

    // Poursuit l'envoi de la requête originale si aucune modification n'est nécessaire
    return next.handle(req);
  }
}