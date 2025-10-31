import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import Cart from '../../models/Cart/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  postOrderToCart(arg0: Cart) {
    throw new Error('Method not implemented.');
  }
  readonly url='http://localhost:3000/carts'

  Cart:Cart[]=[]
  constructor(private http:HttpClient) { }


  getCartItems(){
    //Deberia llamar desde la page al otro 
    // servicio de Orders ya que cart no guarda id de orders
    //Este es de uso del admin o del empleado
    return this.http.get<Cart>(this.url);
    //Revisar metodo getOrdersFromCart en order-service.ts
  }

  getCartByUserId(userId: string): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.url}?userId=${userId}`);
  }
  

  postCart(cart: Cart) {
    return this.http.post<any>(this.url, cart);
    //Se lo envia al administrador o empleado
  }
  putCart(cart: Cart){
//REVISAR ESTO deberia realizarse desde cada 
// order si es de una orden en especifico
//Se deberia editar los datos para realizar 
// los pedidos como user o pago con este service
    return this.http.put<Cart>(`${this.url}/${cart.cartId}`, cart);
  }
  
  deleteCart(cartId: string){
    return this.http.delete<any>(`${this.url}/${cartId}`);
  }
}
