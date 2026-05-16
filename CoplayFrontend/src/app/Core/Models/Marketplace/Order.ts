export interface OrderItem {
  targetId: string;
  targetType: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  sellerId?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  orderId?: string;
  buyerId?: string;
  items: OrderItem[];
  totalAmount: number;
  currency?: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod?: string;
  paymentIntentId?: string;
  shippingAddress?: ShippingAddress;
  createdAt?: string;
}
