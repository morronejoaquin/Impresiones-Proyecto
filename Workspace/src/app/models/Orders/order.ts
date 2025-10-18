export default interface Order {
    orderId: number;
    ringed: boolean;
    printed: boolean;
    delivered: boolean;
    color: boolean;
    pages: number;
    comments: string;
    archiveUrl: string;
    copies: number;
    userId: number;
    paymentId: number;
    amount: number;
}