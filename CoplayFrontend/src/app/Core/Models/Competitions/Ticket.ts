export enum TicketStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD      = 'SOLD',
  CANCELLED = 'CANCELLED'
}

export interface Ticket {
  id: string;
  matchId: string;

  // ✅ Infos du match
  matchDate?: string;
  teamA?: string;
  teamB?: string;

  ticketNumber: string;
  category: 'VIP' | 'TRIBUNE' | 'PELOUSE';
  price: number;
  status: TicketStatus;
  seatNumber: string;

  // ✅ Détenteur
  buyerName?: string;
  buyerEmail?: string;

  purchasedAt?: string;
}

export interface CreateTicketsRequest {
  vipCount: number;
  vipPrice: number;
  tribuneCount: number;
  tribunePrice: number;
  pelouseCount: number;
  pelousePrice: number;
}

export interface BuyTicketRequest {
  ticketId: string;
  buyerEmail: string;
}