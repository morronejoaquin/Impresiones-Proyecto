export default interface Payment {
  paymentId: number;
  cartId: number; // foreign key -> Cart.cartId (one payment tied to one cart)
  paymentMethod: 'cash' | 'transfer' | 'credit_card';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  finalPrice: number;
  depositAmount: number;
  orderDate: Date;
}