import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, map } from 'rxjs';
import { EventLocation as Location } from 'src/app/Core/Models/Events & Training/EventLocation';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private apiUrl = 'http://localhost:8080/api/locations';

  constructor(private http: HttpClient) {}

  /**
   * Crée une location manuellement.
   * POST /api/locations/add
   */
  createLocation(location: Location): Observable<Location> {
    return this.http.post<Location>(`${this.apiUrl}/add`, location);
  }

  /**
   * ✅ NOUVEAU : Géocodage avec Nominatim (GRATUIT - OpenStreetMap)
   * Recherche une adresse et retourne les coordonnées
   */
  geocodeAddress(address: string): Observable<Location | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
    
    return from(
      fetch(url, {
        headers: {
          'Accept-Language': 'fr'
        }
      }).then(response => response.json())
    ).pipe(
      map((results: any[]) => {
        if (results && results.length > 0) {
          const result = results[0];
          return {
            name: result.name || result.display_name.split(',')[0],
            address: result.display_name,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
          } as Location;
        }
        return null;
      })
    );
  }

  /**
   * ✅ NOUVEAU : Reverse geocoding avec Nominatim (GRATUIT)
   * Convertit des coordonnées en adresse
   */
  reverseGeocode(lat: number, lng: number): Observable<Location | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    
    return from(
      fetch(url, {
        headers: {
          'Accept-Language': 'fr'
        }
      }).then(response => response.json())
    ).pipe(
      map((result: any) => {
        if (result && result.display_name) {
          return {
            name: result.name || result.display_name.split(',')[0],
            address: result.display_name,
            latitude: lat,
            longitude: lng
          } as Location;
        }
        return null;
      })
    );
  }

  /**
   * ✅ NOUVEAU : Crée et sauvegarde une location depuis une adresse
   * Utilise Nominatim puis sauvegarde dans le backend
   */
  createFromAddress(address: string): Observable<Location> {
    return new Observable(observer => {
      this.geocodeAddress(address).subscribe({
        next: (location) => {
          if (location) {
            // Sauvegarder dans le backend
            this.createLocation(location).subscribe({
              next: (saved) => {
                observer.next(saved);
                observer.complete();
              },
              error: (err) => observer.error(err)
            });
          } else {
            observer.error(new Error('Adresse introuvable'));
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /**
   * Retourne toutes les locations.
   * GET /api/locations/all
   */
  getAllLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/all`);
  }

  /**
   * Retourne une location par son ID.
   * GET /api/locations/get/{locationId}
   */
  getLocationById(locationId: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/get/${locationId}`);
  }

  /**
   * Recherche des locations par nom (autocomplétion).
   * GET /api/locations/search?name=...
   */
  searchByName(name: string): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/search?name=${name}`);
  }

  /**
   * ✅ NOUVEAU : Génère un lien Google Maps depuis les coordonnées
   */
  getGoogleMapsLink(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  /**
   * ✅ NOUVEAU : Génère un lien Google Maps depuis un locationId
   */
  getGoogleMapsLinkById(locationId: string): Observable<string> {
    return this.getLocationById(locationId).pipe(
      map(location => {
        if (location.latitude && location.longitude) {
          return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
        }
        return '';
      })
    );
  }
}