export interface Equipment {
  equipmentId?: string;
  sellerId:     string;
  name:         string;
  price:        number;
  category?:    string;
  status?:      'AVAILABLE' | 'SOLD' | 'RESERVED';
}