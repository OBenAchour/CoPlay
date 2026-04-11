import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../../../../Core/Services/Marketplace/listing.service';
import { Listing, ListingStatus, ListingType } from '../../../../Core/Models/Marketplace/Listing';
import { NotificationService } from '../../../../Core/Services/Notification/notification.service';

@Component({
  selector: 'app-listing-detail',
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.css']
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  loading = true;
  error: string | null = null;
  rating = 0;
  submittingRating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingService: ListingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadListing(id);
    } else {
      this.error = 'Identifiant d\'annonce non trouvé';
      this.loading = false;
    }
  }

  loadListing(id: string): void {
    this.loading = true;
    this.error = null;

    this.listingService.getListingById(id).subscribe({
      next: (data) => {
        this.listing = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de l\'annonce';
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

  getCommissionAmount(): number {
    return this.listing ? this.listing.price * this.listing.commissionRate : 0;
  }

  canReserve(): boolean {
    return this.listing?.status === ListingStatus.ACTIVE;
  }

  reserveListing(): void {
    if (!this.listing) return;

    this.listingService.reserveListing(this.listing.listingId).subscribe({
      next: (updated) => {
        this.listing = updated;
        this.notificationService.success('🎉 Annonce réservée avec succès !');
      },
      error: (err) => {
        // Analyse de l'erreur pour donner un message plus précis
        if (err.status === 403) {
          this.notificationService.error('⛔ Vous ne pouvez pas réserver votre propre annonce');
        } else if (err.error && err.error.message) {
          this.notificationService.error(`❌ Erreur : ${err.error.message}`);
        } else {
          this.notificationService.error('❌ Erreur lors de la réservation');
        }
        console.error(err);
      }
    });
  }

  rateListing(): void {
    if (!this.listing || this.rating < 1 || this.rating > 5) {
      this.notificationService.warning('⚠️ Veuillez sélectionner une note entre 1 et 5');
      return;
    }

    this.submittingRating = true;
    this.listingService.rateListing(this.listing.listingId, this.rating).subscribe({
      next: () => {
        this.submittingRating = false;
        this.rating = 0;
        this.notificationService.success('⭐ Merci pour votre note !');
        this.loadListing(this.listing!.listingId);
      },
      error: (err) => {
        this.submittingRating = false;
        if (err.error && err.error.message) {
          this.notificationService.error(`❌ Erreur : ${err.error.message}`);
        } else {
          this.notificationService.error('❌ Erreur lors de la notation');
        }
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/marketplace']);
  }

  goToMyListings(): void {
    this.router.navigate(['/marketplace/my-listings']);
  }
}
