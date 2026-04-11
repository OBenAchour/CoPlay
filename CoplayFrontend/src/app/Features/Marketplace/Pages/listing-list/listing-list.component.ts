import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListingService } from '../../../../Core/Services/Marketplace/listing.service';
import { Listing, ListingType } from '../../../../Core/Models/Marketplace/Listing';

@Component({
  selector: 'app-listing-list',
  templateUrl: './listing-list.component.html',
  styleUrls: ['./listing-list.component.css']
})
export class ListingListComponent implements OnInit {
  listings: Listing[] = [];
  loading = true;
  error: string | null = null;

  filters = {
    type: '' as string | ListingType,
    keyword: ''
  };

  typeOptions = [
    { value: '', label: 'Tous' },
    { value: ListingType.SALE, label: 'Vente' },
    { value: ListingType.RENTAL, label: 'Location' },
    { value: ListingType.SERVICE, label: 'Service' }
  ];

  constructor(
    private listingService: ListingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.loading = true;
    this.error = null;

    const params: any = {};
    if (this.filters.type) params.type = this.filters.type;
    if (this.filters.keyword) params.keyword = this.filters.keyword;

    this.listingService.getListings(params).subscribe({
      next: (data) => {
        this.listings = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des annonces';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSearch(): void {
    this.loadListings();
  }

  getTypeLabel(type: ListingType): string {
    const option = this.typeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }

  getTypeClass(type: ListingType): string {
    switch (type) {
      case ListingType.SALE: return 'badge-sale';
      case ListingType.RENTAL: return 'badge-rental';
      case ListingType.SERVICE: return 'badge-service';
      default: return 'badge-default';
    }
  }

  getCommissionAmount(listing: Listing): number {
    return listing.price * listing.commissionRate;
  }

  goToDetail(id: string): void {
    this.router.navigate(['/marketplace', id]);
  }
}
