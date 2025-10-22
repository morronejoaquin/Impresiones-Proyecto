export default interface OrderItem {
  id: number;
  cartId: number; // foreign key -> Cart.cartId
  isColor: boolean;
  isDoubleSided: boolean;
  binding?: 'ringed' | 'stapled' | null;
  pages: number;
  comments?: string;
  file: File |string| null; //Cuando usemos una base de datos cambiarlo a File
  copies: number;
  amount: number;
}