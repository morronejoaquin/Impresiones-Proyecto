export interface Order {
    orderId: number;
    ringed: boolean;
    printed: boolean;
    delivered: boolean;
    color: string;
    pages: number;
    comments: string;
    archiveUrl: string;
    copies: number;
    paymentMethod: string;
    paymentStatus: boolean;
    totalAmount: number;
    sign:number;
    userId: number;
}
