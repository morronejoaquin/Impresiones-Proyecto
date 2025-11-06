export default interface Payment {
  id: string;
  cartId: string; // foreign key -> Cart.cartId (one payment tied to one cart)
  paymentMethod: 'cash' | 'transfer' | 'credit_card';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  finalPrice: number;
  depositAmount: number;
  orderDate: Date;
}