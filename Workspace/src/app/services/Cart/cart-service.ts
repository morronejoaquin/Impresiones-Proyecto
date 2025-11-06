import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, switchMap } from 'rxjs';
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
    return this.http.get<Cart[]>(`${this.url}?userId=${userId}`);
  }
  

  postCart(cart: Cart) {
    return this.http.post<any>(this.url, cart);
    //Se lo envia al administrador o empleado
  }
  
  deleteCart(cartId: string){
    return this.http.delete<any>(`${this.url}/${cartId}`);
  }

  // 💡 Nuevo: Orquesta la eliminación de todos los ítems de un carrito
  clearOrdersInCart(cartId: string): Observable<any> {
    // 1. Obtener todas las órdenes de ese carrito
    return this.orderService.getOrdersFromCart(cartId).pipe(
        // 2. Usar switchMap para cambiar de las órdenes a una lista de Observables de eliminación
        switchMap(orders => {
            if (orders.length === 0) {
                return new Observable(observer => observer.complete()); // Retorna un observable vacío si no hay órdenes
            }
            const deleteObservables = orders.map(order => this.orderService.deleteOrderFromCart(order.id));
            // 3. forkJoin espera a que TODOS los Observables (eliminaciones) se completen
            return forkJoin(deleteObservables);
        })
    );
  }
}
