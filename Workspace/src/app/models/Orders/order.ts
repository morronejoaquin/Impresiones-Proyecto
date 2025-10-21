export default interface Order {
    id: number;
    status: 'pending' | 'printing' | 'binding' | 'ready' | 'delivered' | 'cancelled';
    isColor: boolean;
    isDoubleSided: boolean;
    binding?: 'ringed' | 'stapled' | null;
    pages: number;
    comments?: string;
    file: File | null;
    copies: number;
    userId?: number;
    totalPrice: number;
    createdAt: Date;
}