export enum ListingType { SALE = 'SALE', RENTAL = 'RENTAL', SERVICE = 'SERVICE' }
export enum ListingStatus {
  ACTIVE = 'ACTIVE', RESERVED = 'RESERVED',
  EXPIRED = 'EXPIRED', CLOSED = 'CLOSED'
}
export interface Listing {
  listingId: string;
  sellerId: string;
  title: string;
  description: string;
  type: ListingType;
  price: number;
  commissionRate: number;
  totalWithCommission: number;
  status: ListingStatus;
  category: string;
  images: string[];
  averageRating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}
