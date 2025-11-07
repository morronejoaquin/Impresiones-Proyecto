import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import Cart from '../../models/Cart/cart';
import { OrderService } from '../Orders/order-service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  readonly url='http://localhost:3000/carts'

  Cart:Cart[]=[]
  constructor(private http:HttpClient, private orderService: OrderService) { }


  getCartItems(){
    //Deberia llamar desde la page al otro 
    // servicio de Orders ya que cart no guarda id de orders
    //Este es de uso del admin o del empleado
    return this.http.get<Cart>(this.url);
    //Revisar metodo getOrdersFromCart en order-service.ts
  }

  getCartByUserId(userId: string): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.url}?userId=${userId}&cartStatus=pending`);
  }
  
  updateCart(cartId: string, updates: Partial<Cart>): Observable<Cart> {
    return this.http.put<Cart>(`${this.url}/${cartId}`, updates);
  }

  postCart(cart: Cart) {
    return this.http.post<any>(this.url, cart);
    //Se lo envia al administrador o empleado
  }
  
  deleteCart(cartId: string){
    return this.http.delete<any>(`${this.url}/${cartId}`);
  }

  clearOrdersInCart(cartId: string): Observable<any> {
    return this.orderService.getOrdersFromCart(cartId).pipe(
      switchMap(orders => {
          if (orders.length === 0) {
            return of(null);
          }
          const deleteObservables = orders.map(order => this.orderService.deleteOrderFromCart(order.id));
          return forkJoin(deleteObservables);
      })
    );
  }

  // 💡 NUEVO: Orquesta la obtención o creación de un carrito activo
  getOrCreateActiveCart(userId: string): Observable<Cart> {
    return this.getCartByUserId(userId).pipe(
      map(carts => carts[0]),
      switchMap(activeCart => {
        if (activeCart) {
          return of(activeCart);
        } else {
        const newCart: Partial<Cart> = {
            userId: userId,
            total: 0,
            status: 'pending',
            cartStatus: 'pending'
          };
          return this.postCart(newCart as Cart); // Crear y retornar el nuevo carrito
        }
      })
    );
  }
}
