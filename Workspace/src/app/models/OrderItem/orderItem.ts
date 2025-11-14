export default interface OrderItem {
  id: string;
  cartId: string;
  isColor: boolean;
  isDoubleSided: boolean;
  binding?: 'ringed' | 'stapled' | 'unringed';
  pages: number;
  comments?: string;
  file: File | string | null; //Cuando usemos una base de datos cambiarlo a File
  copies: number;
  amount: number;
  imageWidth?: number;
  imageHeight?: number;
}