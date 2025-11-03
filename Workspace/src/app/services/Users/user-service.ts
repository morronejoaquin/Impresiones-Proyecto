import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import User from '../../models/Users/user';
import { decodeToken, encodeToken, isTokenValid } from '../../utils/jwt-utils';
import { CartService } from '../Cart/cart-service';
import { OrderService } from '../Orders/order-service';
import { forkJoin, of, switchMap, tap } from 'rxjs';
import OrderItem from '../../models/OrderItem/orderItem';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  readonly url='http://localhost:3000/users'

  User:User[]=[]

  readonly TOKEN_KEY = 'auth_token'

  private loggedInUser: User | null = null;

  // para localStoragge
  private readonly GUEST_ID_KEY = 'guest_user_id'
  private readonly GUEST_ROLE_KEY = 'guest_user_role'

  constructor(private http:HttpClient, private cartService: CartService, private orderService: OrderService) {
    this.checkPreviousGuestSession()
  }

  getUsers(){
    return this.http.get<User[]>(this.url);
  }

  getUserById(id:string){
    return this.http.get<User>(`${this.url}/${id}`);
  }

  postUser(user:User){
    return this.http.post<User>(this.url,user);
  }

  updateUser(user:User){
    return this.http.put<User>(`${this.url}/${user.id}`,user);
  }

  deleteUser(id:string){
    return this.http.delete<User>(`${this.url}/${id}`);
  }

  // Almacena el token generado en sessionStorage
  setAuthToken(user: User): void {
    const token = encodeToken(user); // Generar el token
    sessionStorage.setItem(this.TOKEN_KEY, token); 
  }

    // Obtiene el token almacenado en sessionStorage
  getAuthToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Obtiene el rol decodificando el token
  getUserRole(): 'admin' | 'guest' | 'registered' | null {
    const token = this.getAuthToken();
    if (!token || !isTokenValid(token)) {
        this.logout();
        return null;
    }
    
    const decoded = decodeToken(token);
    return decoded?.role as ('admin' | 'guest' | 'registered') || null;
  }

  // Cierra la sesión del usuario
  logout() {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  /**
     * @description Obtiene los datos del usuario decodificando el JWT. 
     * Este método reemplaza a getLoggedInUser().
     */
  getDecodedUserPayload(): { userId: string, role: 'admin' | 'guest' | 'registered' } | null {
      const token = this.getAuthToken();
      if (!token || !isTokenValid(token)) {
          this.logout();
          return null;
      }
      
      // decodeToken ahora devuelve el objeto con userId y role (al menos)
      const decoded = decodeToken(token);

      // Si la decodificación es exitosa, devolvemos el payload para usarlo en los componentes.
      if (decoded && decoded.userId) {
            return decoded as { userId: string, role: 'admin' | 'guest' | 'registered' };
      }
      return null;
  }

  /**
   * @description Almacena el ID y el rol del usuario invitado en localStorage.
   */
  setGuestUserForCleanup(user: User): void {
    if (user.role === 'guest' && user.id) {
      localStorage.setItem(this.GUEST_ID_KEY, user.id.toString());
      localStorage.setItem(this.GUEST_ROLE_KEY, user.role);
    }
  }

  /**
   * @description Verifica si existía un usuario invitado de una sesión previa
   * (pestaña cerrada o navegación) y lo elimina.
   */
  checkPreviousGuestSession(): void {
        const guestId = localStorage.getItem(this.GUEST_ID_KEY);
        const guestRole = localStorage.getItem(this.GUEST_ROLE_KEY);

        if (guestId && guestRole === 'guest') {
            console.log(`[LIMPIEZA] Detectado usuario invitado pendiente: ID ${guestId}`);
            this.logout(); // Elimina el token
            
            // 1. Buscar el carrito asociado al guestId
            this.cartService.getCartByUserId(guestId).subscribe({
                next: (carts) => {
                    if (carts && carts.length > 0) {
                        const cartToDeleteId = carts[0].id;
                        console.log(`[LIMPIEZA] Carrito encontrado para limpiar: ${cartToDeleteId}`);

                        // 2. Buscar OrderItems (Vaciar el carrito)
                        this.orderService.getOrdersFromCart(cartToDeleteId).subscribe({
                            next: (items: OrderItem[]) => {
                                if (items.length > 0) {
                                    console.log(`[LIMPIEZA] Eliminando ${items.length} OrderItems asociados...`);
                                    
                                    // Convertimos los observables de eliminación a Promises
                                    const deletePromises = items.map(item => 
                                        this.orderService.deleteOrderFromCart(item.id).toPromise()
                                    );
                                    
                                    // 2.1. Esperar a que se eliminen todos los ítems usando Promise.all
                                    Promise.all(deletePromises)
                                        .then(() => {
                                            console.log('[LIMPIEZA] Todos los OrderItems eliminados con éxito.');
                                            
                                            // 3. Eliminar el carrito
                                            this.deleteCartAndUser(cartToDeleteId, guestId);
                                        })
                                        .catch((e) => {
                                            console.error('[LIMPIEZA] Error eliminando OrderItems:', e);
                                            // Si falla la eliminación de ítems, intentar eliminar el carrito y el usuario de todas formas
                                            this.deleteCartAndUser(cartToDeleteId, guestId);
                                        });

                                } else {
                                    console.log('[LIMPIEZA] No hay OrderItems que eliminar.');
                                    // Si no hay items, ir directamente a eliminar el carrito y el usuario
                                    this.deleteCartAndUser(cartToDeleteId, guestId);
                                }
                            },
                            error: (e) => console.error('[LIMPIEZA] Error buscando OrderItems:', e)
                        });

                    } else {
                        console.log('[LIMPIEZA] No se encontró carrito, solo se elimina el usuario.');
                        // Si no hay carrito, solo eliminamos el usuario
                        this.deleteUser(guestId).subscribe({
                            complete: () => this.cleanupLocalStorage()
                        });
                    }
                },
                error: (err) => {
                    console.error('[LIMPIEZA] Error al buscar carrito para limpieza:', err);
                }
            });
        }
    }
    
    /**
     * @description Elimina el carrito y luego el usuario. 
     */
    private deleteCartAndUser(cartId: string, guestId: string): void {
        // 3. Eliminar el Carrito
        this.cartService.deleteCart(cartId).subscribe({
            next: () => {
                console.log(`[LIMPIEZA] Carrito ${cartId} eliminado.`);
                
                // 4. Eliminar el Usuario
                this.deleteUser(guestId).subscribe({
                    next: () => console.log(`[LIMPIEZA] Usuario invitado ${guestId} eliminado.`),
                    error: (e) => console.error(`[LIMPIEZA] Error eliminando usuario ${guestId}:`, e),
                    complete: () => this.cleanupLocalStorage()
                });
            },
            error: (e) => {
                console.error(`[LIMPIEZA] Error eliminando carrito ${cartId}:`, e);
                // Si falla la eliminación del carrito, intentar eliminar el usuario de todas formas
                this.deleteUser(guestId).subscribe({
                    next: () => console.log(`[LIMPIEZA] Usuario invitado ${guestId} eliminado después de un fallo en carrito.`),
                    error: (e) => console.error(`[LIMPIEZA] Error eliminando usuario ${guestId}:`, e),
                    complete: () => this.cleanupLocalStorage()
                });
            }
        });
    }

    /**
     * @description Limpia las claves del localStorage al finalizar el proceso.
     */
    private cleanupLocalStorage(): void {
        console.log('[LIMPIEZA] Limpiando localStorage.');
        localStorage.removeItem(this.GUEST_ID_KEY); 
        localStorage.removeItem(this.GUEST_ROLE_KEY);
    }

}
