export interface Equipment {
  equipmentId?: string;
  sellerId?: string;
  name: string;
  description?: string;
  price: number;
  rentalPricePerDay?: number;
  category?: string;
  sport?: string;
  brand?: string;
  condition?: 'NEW' | 'USED' | 'REFURBISHED';
  listingType?: 'SALE' | 'RENT' | 'BOTH';
  images?: string[];
  videos?: string[];
  tags?: string[];
  city?: string;
  latitude?: number;
  longitude?: number;
  quantity?: number;
  views?: number;
  status?: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'INACTIVE';
  rating?: number;
  reviewCount?: number;
  aiEstimatedPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}
