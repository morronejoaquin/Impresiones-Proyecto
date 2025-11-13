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
      // 1. Filtrar solo los carritos completados
      map(allCarts => allCarts.filter(cart => cart.cartStatus === 'completed')),
      
      // 2. Por cada carrito, obtener sus órdenes y agregar los detalles
      switchMap(completedCarts => {
        if (completedCarts.length === 0) {
          return of([] as CartWithItems[]);
        }

        const cartObservables = completedCarts.map(cart =>
          this.orderService.getOrdersFromCart(cart.id).pipe(
            map(orderItems => {
              // --- resumen archivos ---
              const fileNames = orderItems
                .map(item => typeof item.file === 'string' ? item.file.split('/').pop() : 'Archivo desconocido')
                .filter(Boolean) as string[];
              
              const fileSummary =
                fileNames.length === 0 ? 'Sin archivos.' :
                fileNames.length === 1 ? fileNames[0] : `${fileNames[0]}... (${fileNames.length} archivos)`;

              // --- NORMALIZAR status: si viene cartStatus, lo copiamos a status (Backward compatibility) ---
              const status = (cart as any).status ?? (cart as any).cartStatus ?? '';

              // Retorna la estructura CartWithItems completa
              return { ...cart, orderItems, fileSummary, status } as CartWithItems;
            })
          )
        );
        // Espera a que todas las peticiones de órdenes se completen
        return forkJoin(cartObservables);
      })
    );
  }

  getDeliveredCartsWithDetails(): Observable<CartWithItems[]> {
    return this.http.get<Cart[]>(this.url).pipe(
      // 1. Filtrar solo los carritos completados
      map(allCarts => allCarts.filter(cart => cart.cartStatus === 'completed' && cart.status === 'delivered')),
      
      // 2. Por cada carrito, obtener sus órdenes y agregar los detalles
      switchMap(completedCarts => {
        if (completedCarts.length === 0) {
          return of([] as CartWithItems[]);
        }

        const cartObservables = completedCarts.map(cart =>
          this.orderService.getOrdersFromCart(cart.id).pipe(
            map(orderItems => {
              // --- resumen archivos ---
              const fileNames = orderItems
                .map(item => typeof item.file === 'string' ? item.file.split('/').pop() : 'Archivo desconocido')
                .filter(Boolean) as string[];
              
              const fileSummary =
                fileNames.length === 0 ? 'Sin archivos.' :
                fileNames.length === 1 ? fileNames[0] : `${fileNames[0]}... (${fileNames.length} archivos)`;

              // --- NORMALIZAR status: si viene cartStatus, lo copiamos a status (Backward compatibility) ---
              const status = (cart as any).status ?? (cart as any).cartStatus ?? '';

              // Retorna la estructura CartWithItems completa
              return { ...cart, orderItems, fileSummary, status } as CartWithItems;
            })
          )
        );
        // Espera a que todas las peticiones de órdenes se completen
        return forkJoin(cartObservables);
      })
    );
  }

  updateCartStatus(id: string, status: string) {
    const updateStatus = {
      status: status
    }
  return this.http.patch<Cart>(`${this.url}/${id}`, updateStatus);
}

getCartById(id: string) {
  return this.http.get<Cart>(`http://localhost:3000/carts/${id}`);
}

}
