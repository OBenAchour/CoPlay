export interface Review {
  reviewId?:   string;
  authorId:    string;
  targetId:    string;
  targetType:  'EQUIPMENT' | 'SERVICE';
  rating:      number;      // 1 à 5
  comment?:    string;
  createdAt?:  string;
}