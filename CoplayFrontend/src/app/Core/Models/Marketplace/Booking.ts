export interface Booking {
  bookingId?: string;
  clientId?: string;
  providerId?: string;
  targetId: string;
  targetType: 'SERVICE' | 'EQUIPMENT_RENT' | 'COACH_SESSION';
  startDate: string;
  endDate: string;
  totalPrice?: number;
  currency?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentIntentId?: string;
  notes?: string;
}
