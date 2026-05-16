export interface CartItem {
  targetId: string;
  targetType: 'EQUIPMENT' | 'SERVICE';
  quantity: number;
  unitPrice: number;
  name: string;
  imageUrl?: string;
}
export interface Cart {
  cartId?: string;
  userId?: string;
  items: CartItem[];
  updatedAt?: string;
}
