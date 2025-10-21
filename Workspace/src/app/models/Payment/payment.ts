export default interface Payment {
    paymentId: number;
    orderId: number;
    paymentMethod: 'cash' | 'transfer' | 'credit_card';
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    totalAmount: number;
    depositAmount: number;
    orderDate: Date;
}