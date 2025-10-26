export interface CustomerData {
  name: string;
  surname: string;
  phone: string;
}

export default interface Cart {
  cartId: number;
  userId?: number | null; // foreign key -> User.userId (nullable for guest carts)
  total: number;
  customer?: CustomerData;
  status: 'pending' | 'printing' | 'binding' | 'ready' | 'delivered' | 'cancelled';
}