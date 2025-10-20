import Order from "../Orders/order";

export default interface Cart {
    orders: Order[];
    totalAmount: number;
}