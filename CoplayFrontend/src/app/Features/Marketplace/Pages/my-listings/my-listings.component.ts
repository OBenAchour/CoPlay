import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListingService } from '../../../../Core/Services/Marketplace/listing.service';
import { Listing, ListingStatus, ListingType } from '../../../../Core/Models/Marketplace/Listing';

@Component({
  selector: 'app-my-listings',
  templateUrl: './my-listings.component.html',
  styleUrls: ['./my-listings.component.css']
})
export class MyListingsComponent implements OnInit {
  listings: Listing[] = [];
  loading = true;
  error: string | null = null;
  closingId: string | null = null;

  constructor(
    private listingService: ListingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyListings();
  }

  loadMyListings(): void {
    this.loading = true;
    this.error = null;

    this.listingService.getMyListings().subscribe({
      next: (data) => {
        this.listings = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de vos annonces';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getTypeLabel(type: ListingType): string {
    switch (type) {
      case ListingType.SALE: return 'Vente';
      case ListingType.RENTAL: return 'Location';
      case ListingType.SERVICE: return 'Service';
      default: return type;
    }
  }

  getTypeClass(type: ListingType): string {
    switch (type) {
      case ListingType.SALE: return 'badge-sale';
      case ListingType.RENTAL: return 'badge-rental';
      case ListingType.SERVICE: return 'badge-service';
      default: return 'badge-default';
    }
  }

  getStatusLabel(status: ListingStatus): string {
    switch (status) {
      case ListingStatus.ACTIVE: return 'Active';
      case ListingStatus.RESERVED: return 'Réservée';
      case ListingStatus.EXPIRED: return 'Expirée';
      case ListingStatus.CLOSED: return 'Clôturée';
      default: return status;
    }
  }

  getStatusClass(status: ListingStatus): string {
    switch (status) {
      case ListingStatus.ACTIVE: return 'status-active';
      case ListingStatus.RESERVED: return 'status-reserved';
      case ListingStatus.EXPIRED: return 'status-expired';
      case ListingStatus.CLOSED: return 'status-closed';
      default: return 'status-default';
    }
  }

  canClose(listing: Listing): boolean {
    return listing.status === ListingStatus.ACTIVE || listing.status === ListingStatus.RESERVED;
  }

  closeListing(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir clôturer cette annonce ?')) {
      return;
    }

    this.closingId = id;
    this.listingService.closeListing(id).subscribe({
      next: () => {
        this.closingId = null;
        alert('Annonce clôturée avec succès !');
        this.loadMyListings();
      },
      error: (err) => {
        this.closingId = null;
        alert('Erreur lors de la clôture : ' + err.message);
        console.error(err);
      }
    });
  }

  goToDetail(id: string): void {
    this.router.navigate(['/marketplace', id]);
  }

  goToCreate(): void {
    this.router.navigate(['/marketplace/create']);
  }

  goToMarketplace(): void {
    this.router.navigate(['/marketplace']);
  }
}
