import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import Cart from '../../models/Cart/cart';
import { OrderService } from '../Orders/order-service';
import OrderItem from '../../models/OrderItem/orderItem';

export interface CartWithItems extends Cart {
  orderItems: OrderItem[];
  fileSummary: string;
}

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
    return this.http.get<Cart[]>(this.url);
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

  // NUEVO: Orquesta la obtención o creación de un carrito activo
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

  getCompletedCartsWithDetails(): Observable<CartWithItems[]> {
  return this.http.get<Cart[]>(this.url).pipe(
    // ✅ Mostrar en "Pedidos" todo lo completado/finalizado EXCEPTO los entregados
    map(allCarts => allCarts.filter(cart =>
      cart.status !== 'delivered' && (
        cart.cartStatus === 'completed' ||
        (['ready','cancelled','printing','binding'] as Cart['status'][]).includes(cart.status)
      )
    )),
    switchMap(completedCarts => {
      if (completedCarts.length === 0) return of([] as CartWithItems[]);
      const cartObservables = completedCarts.map(cart =>
        this.orderService.getOrdersFromCart(cart.id).pipe(
          map(orderItems => {
            const fileNames = orderItems
              .map(item => typeof item.file === 'string' ? item.file.split('/').pop() : 'Archivo desconocido')
              .filter(Boolean) as string[];

            const fileSummary =
              fileNames.length === 0 ? 'Sin archivos.' :
              fileNames.length === 1 ? fileNames[0] : `${fileNames[0]}... (${fileNames.length} archivos)`;

            const status = (cart as any).status ?? (cart as any).cartStatus ?? '';

            const fallbackTotal = orderItems.reduce((acc, it) => acc + (it.amount || 0), 0);
            const total = (cart.total ?? fallbackTotal);

            return { ...cart, orderItems, fileSummary, status, total } as CartWithItems;
          })
        )
      );
      return forkJoin(cartObservables);
    })
  );
}


getDeliveredCartsWithDetails(): Observable<CartWithItems[]> {
  return this.http.get<Cart[]>(this.url).pipe(
    // ✅ Entregados: con que status sea 'delivered' alcanza
    map(allCarts => allCarts.filter(cart => cart.status === 'delivered')),
    switchMap(deliveredCarts => {
      if (deliveredCarts.length === 0) return of([] as CartWithItems[]);
      const cartObservables = deliveredCarts.map(cart =>
        this.orderService.getOrdersFromCart(cart.id).pipe(
          map(orderItems => {
            const fileNames = orderItems
              .map(item => typeof item.file === 'string' ? item.file.split('/').pop() : 'Archivo desconocido')
              .filter(Boolean) as string[];

            const fileSummary =
              fileNames.length === 0 ? 'Sin archivos.' :
              fileNames.length === 1 ? fileNames[0] : `${fileNames[0]}... (${fileNames.length} archivos)`;

            const status = (cart as any).status ?? (cart as any).cartStatus ?? '';

            const fallbackTotal = orderItems.reduce((acc, it) => acc + (it.amount || 0), 0);
            const total = (cart.total ?? fallbackTotal);

            return { ...cart, orderItems, fileSummary, status, total } as CartWithItems;
          })
        )
      );
      return forkJoin(cartObservables);
    })
  );
}


  // ✅ setea status y opcionalmente sella completedAt / deliveredAt
updateCartStatus(
  id: string,
  status: Cart['status'],
  opts?: { stampCompletion?: boolean; stampDelivery?: boolean }
) {
  const now = new Date().toISOString();
  const updates: any = { status };

  if (opts?.stampCompletion) {
    updates.cartStatus = 'completed';
    updates.completedAt = now;
  }
  if (opts?.stampDelivery) {
    updates.deliveredAt = now;
  }

  return this.http.patch<Cart>(`${this.url}/${id}`, updates); // PATCH, no PUT
}



getCartById(id: string) {
  return this.http.get<Cart>(`http://localhost:3000/carts/${id}`);
}

}
