import { UserService } from './../../../services/Users/user-service';
import { CartService } from './../../../services/Cart/cart-service';
import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/Orders/order-service';
import OrderItem from '../../../models/OrderItem/orderItem';

@Component({
  selector: 'app-show-cart-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './show-cart-page.html',
  styleUrl: './show-cart-page.css'
})
export class ShowCartPage implements OnInit {
  orders: OrderItem[] = [];
  cartTotal: number = 0;
  constructor(private router:Router,private orderService:OrderService,private cartService:CartService,private userService:UserService) {}

  ngOnInit(): void {
    const userId = this.userService.getDecodedUserPayload()?.userId;
  
    if (!userId) {
      console.error('No se encontró userId en el payload');
      return;
    }
  
    this.cartService.getCartByUserId(userId).subscribe({
      next: (carts) => {
        if (carts && carts.length > 0) {
          const cartId = carts[0].id;
  
          // Ahora sí puedes pedir las órdenes de ese carrito
          this.orderService.getOrdersFromCart(cartId).subscribe({
            next: (orders) => {
              this.orders = orders;
              this.calculateCartTotal();
            },
            error: (err) => {
              console.error('Error fetching orders from cart:', err);
            }
          });
        } else {
          console.warn('No se encontró carrito para este usuario');
        }
      },
      error: (err) => {
        console.error('Error obteniendo carrito por userId:', err);
      }
    });
  }

  calculateCartTotal() {
    this.cartTotal = this.orders.reduce((total, order) => total + order.amount, 0);
  }
  
  removeItem(orderId: string) {
    this.orderService.deleteOrderFromCart(orderId).subscribe({
      next: () => {
        this.orders = this.orders.filter(order => order.id !== orderId);
        this.calculateCartTotal();
      },
      error: (err) => {
        console.error('Error removing item from cart:', err);
      }
    });
  }

  editItem(orderId: string) {
    this.router.navigate(['/make-order', orderId]);
  }

  clearCart() {
    const userId = this.userService.getDecodedUserPayload()?.userId;
  
    if (!userId) {
      console.error('No se encontró userId en el payload');
      return;
    }
  
    this.cartService.getCartByUserId(userId).subscribe({
      next: (carts) => {
        if (carts && carts.length > 0) {
          const cartId = carts[0].id;
  
          this.orderService.getOrdersFromCart(cartId).subscribe({
            next: (orders) => {
              const deleteObservables = orders.map(order =>
                this.orderService.deleteOrderFromCart(order.id)
              );
  
              Promise.all(deleteObservables.map(obs => obs.toPromise()))
                .then(() => {
                  this.orders = [];
                  this.cartTotal = 0;
                })
                .catch(err => {
                  console.error('Error clearing cart:', err);
                });
            },
            error: (err) => {
              console.error('Error fetching orders for clearing cart:', err);
            }
          });
        } else {
          console.warn('No se encontró carrito para este usuario');
        }
      },
      error: (err) => {
        console.error('Error obteniendo carrito por userId:', err);
      }
    });
  }

  proceedToPayment() {
    this.router.navigate(['/cart-payment']);
  }

  confirmAndClearCart(): void {
    const confirmed = confirm('¿Estás seguro de que deseas vaciar el carrito?');
    if (confirmed) {
      this.clearCart();
    }
  }

  confirmAndRemoveItem(itemId: string): void {
    const confirmed = confirm('¿Estás seguro de que deseas eliminar este ítem?');
    if (confirmed) {
      this.removeItem(itemId);
    }
  }
}