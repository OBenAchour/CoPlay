import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

// ✅ Fix pour les icônes Leaflet manquantes
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

export interface MapLocation {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  // Leaflet a besoin de ses styles globaux (.leaflet-*) pour afficher
  // correctement les tuiles et les contrôles → on désactive l'encapsulation
  // pour que le @import de leaflet.css (dans map.component.css) s'applique.
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges {

  // ✅ Mode lecture seule (event-detail) ou sélection (event-form)
  @Input() readonly: boolean = true;
  
  // ✅ Position initiale
  @Input() latitude: number = 36.8065;  // Tunis par défaut
  @Input() longitude: number = 10.1815;
  @Input() zoom: number = 13;
  
  // ✅ Nom du lieu à afficher
  @Input() locationName: string = '';
  
  // ✅ ID unique pour la carte (pour avoir plusieurs cartes sur une page)
  @Input() mapId: string = 'map';

  // ✅ Événement émis quand l'utilisateur clique sur la carte
  @Output() locationSelected = new EventEmitter<MapLocation>();

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si les coordonnées changent, mettre à jour la carte
    if ((changes['latitude'] || changes['longitude']) && this.map) {
      this.updateMapPosition();
    }
  }

  private initMap(): void {
    // Initialiser la carte
    this.map = L.map(this.mapId, {
      center: [this.latitude, this.longitude],
      zoom: this.zoom
    });

    // Ajouter les tuiles OpenStreetMap (gratuit)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    // Ajouter un marqueur si on a des coordonnées valides
    if (this.latitude && this.longitude) {
      this.addMarker(this.latitude, this.longitude, this.locationName);
    }

    // Si mode édition, permettre de cliquer pour sélectionner un lieu
    if (!this.readonly) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.onMapClick(e);
      });
    }

    // Fix pour le rendu de la carte
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  private addMarker(lat: number, lng: number, name?: string): void {
    if (!this.map) return;

    // Supprimer l'ancien marqueur s'il existe
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Créer un nouveau marqueur
    this.marker = L.marker([lat, lng]).addTo(this.map);

    // Ajouter un popup si on a un nom
    if (name) {
      this.marker.bindPopup(`<strong>${name}</strong>`).openPopup();
    }
  }

  private updateMapPosition(): void {
    if (!this.map) return;

    this.map.setView([this.latitude, this.longitude], this.zoom);
    this.addMarker(this.latitude, this.longitude, this.locationName);
  }

  private onMapClick(e: L.LeafletMouseEvent): void {
    const { lat, lng } = e.latlng;

    // Mettre à jour le marqueur
    this.addMarker(lat, lng);

    // Faire un reverse geocoding pour obtenir l'adresse
    this.reverseGeocode(lat, lng);
  }

  private reverseGeocode(lat: number, lng: number): void {
    // Utiliser Nominatim (gratuit) pour le reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

    fetch(url, {
      headers: {
        'Accept-Language': 'fr'
      }
    })
      .then(response => response.json())
      .then(data => {
        const location: MapLocation = {
          lat: lat,
          lng: lng,
          name: data.name || data.display_name?.split(',')[0] || 'Lieu sélectionné',
          address: data.display_name || ''
        };

        // Mettre à jour le popup du marqueur
        if (this.marker) {
          this.marker.bindPopup(`<strong>${location.name}</strong><br>${location.address}`).openPopup();
        }

        // Émettre l'événement
        this.locationSelected.emit(location);
      })
      .catch(error => {
        console.error('Erreur geocoding:', error);
        // Émettre quand même avec les coordonnées
        this.locationSelected.emit({
          lat: lat,
          lng: lng,
          name: 'Lieu sélectionné',
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      });
  }

  // ✅ Méthode publique pour centrer la carte sur une position
  public centerOn(lat: number, lng: number, name?: string): void {
    if (!this.map) return;
    
    this.latitude = lat;
    this.longitude = lng;
    this.locationName = name || '';
    
    this.updateMapPosition();
  }
}