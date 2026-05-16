export interface TimeSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface MarketplaceService {
  serviceId?: string;
  providerId?: string;
  name: string;
  description?: string;
  price: number;
  pricingModel?: 'HOURLY' | 'FIXED' | 'PER_EVENT';
  category?: 'REFEREE' | 'PHYSIO' | 'PHOTOGRAPHER' | 'COACH' | 'OTHER';
  sport?: string;
  images?: string[];
  certifications?: string[];
  availability?: TimeSlot[];
  radiusKm?: number;
  city?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  status?: 'ACTIVE' | 'PAUSED' | 'INACTIVE';
}
