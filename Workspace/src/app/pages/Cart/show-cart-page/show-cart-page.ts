import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import OrderItem from '../../../models/Orders/order';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/Orders/order-service';

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

  constructor(private router:Router,private orderService:OrderService) {}

  ngOnInit(): void {
    /*
    this.orderService.getOrdersFromCart.subscribe({
      next: (ordersGet) => {
        this.orders = ordersGet;
        this.cartTotal = this.orders.reduce((total, order) => total + order.amount * order.copies, 0);
      },
      error:(err)=>{console.error('Error al cargar los pedidos del carrito:', err);}
    });

    */
  }
}