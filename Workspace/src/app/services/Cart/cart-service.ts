import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Cart, { CartItem } from '../../models/Cart/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({ items: [], total: 0 });

  public cart$: Observable<Cart> = this.cartSubject.asObservable();

  constructor() { }

  addItem(item: CartItem): void {
    const currentCart = this.cartSubject.getValue();
    const updatedItems = [...currentCart.items, item];
    this.cartSubject.next({
      items: updatedItems,
      total: this.calculateTotal(updatedItems)
    });
  }

  removeItem(index: number): void {
    const currentCart = this.cartSubject.getValue();
    const updatedItems = currentCart.items.filter((_, i) => i !== index);
    this.cartSubject.next({
      items: updatedItems,
      total: this.calculateTotal(updatedItems)
    });
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((acc, item) => acc + item.totalPrice, 0);
  }

  clearCart(): void {
    this.cartSubject.next({ items: [], total: 0 });
  }
}