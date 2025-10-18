export default interface Payment {
    paymentId: number;
    orderId: number;
    paymentMethod: string;
    paymentStatus: boolean;
    totalAmount: number;
    sign: number;
    orderDate: Date;
}