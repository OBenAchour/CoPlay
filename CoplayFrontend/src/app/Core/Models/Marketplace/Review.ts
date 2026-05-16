export interface Review {
  reviewId?: string;
  authorId?: string;
  targetId: string;
  targetType: 'EQUIPMENT' | 'SERVICE' | 'COACH';
  rating: number;
  comment?: string;
  images?: string[];
  helpfulVotes?: number;
  verifiedPurchase?: boolean;
  createdAt?: string;
}
