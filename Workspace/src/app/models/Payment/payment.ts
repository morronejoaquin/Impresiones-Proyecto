export default interface Payment {
  id: string;
  cartId: string;
  paymentMethod: 'cash' | 'transfer' | 'credit_card';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  finalPrice: number;
  depositAmount: number;
  orderDate: Date;
}