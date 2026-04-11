import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListingService } from '../../../../Core/Services/Marketplace/listing.service';
import { Listing, ListingType } from '../../../../Core/Models/Marketplace/Listing';
import { CategoryService } from '../../../../Core/Services/Marketplace/category.service';
import { Category } from '../../../../Core/Models/Marketplace/Category';
import { NotificationService } from '../../../../Core/Services/Notification/notification.service';

@Component({
  selector: 'app-listing-list',
  templateUrl: './listing-list.component.html',
  styleUrls: ['./listing-list.component.css']
})
export class ListingListComponent implements OnInit {
  listings: Listing[] = [];
  categories: Category[] = [];
  loading = true;
  error: string | null = null;
  categoriesLoading = true;

  filters = {
    type: '' as string | ListingType,
    category: '',
    keyword: '',
    minPrice: 0,
    maxPrice: 1000
  };

  typeOptions = [
    { value: '', label: 'Tous' },
    { value: ListingType.SALE, label: 'Vente' },
    { value: ListingType.RENTAL, label: 'Location' },
    { value: ListingType.SERVICE, label: 'Service' }
  ];

  constructor(
    private listingService: ListingService,
    private categoryService: CategoryService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadListings();
  }

  loadCategories(): void {
    this.categoriesLoading = true;
    this.categoryService.getActiveCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.categoriesLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories', err);
        this.categoriesLoading = false;
      }
    });
  }

  loadListings(): void {
    this.loading = true;
    this.error = null;

    const params: any = {};
    if (this.filters.type) params.type = this.filters.type;
    if (this.filters.category) params.category = this.filters.category;
    if (this.filters.keyword) params.keyword = this.filters.keyword;
    if (this.filters.minPrice > 0) params.minPrice = this.filters.minPrice;
    if (this.filters.maxPrice > 0) params.maxPrice = this.filters.maxPrice;

    this.listingService.getListings(params).subscribe({
      next: (data) => {
        this.listings = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des annonces';
        this.loading = false;
        this.notificationService.error('❌ Erreur lors du chargement des annonces');
        console.error(err);
      }
    });
  }

  onSearch(): void {
    this.loadListings();
  }

  onPriceRangeChange(): void {
    this.loadListings();
  }

  resetFilters(): void {
    this.filters = {
      type: '',
      category: '',
      keyword: '',
      minPrice: 0,
      maxPrice: 1000
    };
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

  getCategoryIcon(categoryName: string): string {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.icon : '📦';
  }

  getFilterTypeLabel(): string {
    if (!this.filters.type) return '';
    return this.getTypeLabel(this.filters.type as ListingType);
  }

  getCommissionAmount(listing: Listing): number {
    return listing.price * listing.commissionRate;
  }

  goToDetail(id: string): void {
    this.router.navigate(['/marketplace', id]);
  }
}
