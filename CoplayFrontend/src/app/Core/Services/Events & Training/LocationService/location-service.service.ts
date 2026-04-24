import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.post<Location>(`${this.apiUrl
  
  
    }/add`, location);
  }

  /**
   * Crée une location automatiquement depuis une adresse.
   * Google Maps trouve les coordonnées automatiquement.
   * POST /api/locations/geocode?address=...
   */
  createFromAddress(address: string): Observable<Location> {
    return this.http.post<Location>(
      `${this.apiUrl
    
    
      }/geocode?address=${encodeURIComponent(address)}`,
      {}
    );
  }

  /**
   * Retourne toutes les locations.
   * GET /api/locations/all
   */
  getAllLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl
  
  
    }/all`);
  }

  /**
   * Retourne une location par son ID.
   * GET /api/locations/get/{locationId}
   */
  getLocationById(locationId: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl
  
  
    }/get/${locationId}`);
  }

  /**
   * Recherche des locations par nom (autocomplétion).
   * GET /api/locations/search?name=...
   */
  searchByName(name: string): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl
  
  
    }/search?name=${name}`);
  }

  /**
   * Retourne le lien Google Maps pour une location.
   * GET /api/locations/maps/{locationId}
   */
  getGoogleMapsLink(locationId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl
  
  
    }/maps/${locationId}`);
  }
}