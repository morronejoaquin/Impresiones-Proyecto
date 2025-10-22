import OrderItem from "../Orders/order";

export interface CustomerData {
  name: string;
  surname: string;
  phone: string;
}

export default interface Cart {
  cartId: number;
  userId?: number | null; // foreign key -> User.userId (nullable for guest carts)
  items: OrderItem[];
  total: number;
  customer?: CustomerData;
  status: 'pending' | 'printing' | 'binding' | 'ready' | 'delivered' | 'cancelled';
}