import Order from "../Orders/order";

// Un item en el carrito es una orden antes de ser confirmada
export interface CartItem extends Omit<Order, 'id' | 'status' | 'createdAt'> {
    // Aca se pueden poner propiedades que solo existen en el carrito, si las hubiera
}

export interface CustomerData {
    name: string;
    surname: string;
    phone: string;
}

export default interface Cart {
    items: CartItem[];
    total: number;
    customer?: CustomerData; // Datos del cliente que se van llenando
}