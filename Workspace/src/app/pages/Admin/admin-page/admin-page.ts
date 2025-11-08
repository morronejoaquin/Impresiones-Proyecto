import { Component, OnInit } from '@angular/core';
import Cart from '../../../models/Cart/cart';
import { CartService } from '../../../services/Cart/cart-service';
import OrderItem from '../../../models/OrderItem/orderItem';
import { OrderService } from '../../../services/Orders/order-service';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CartWithItems extends Cart {
    orderItems: OrderItem[];
    // Propiedad calculada para el resumen de archivos
    fileSummary: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css'
})

export class AdminPage implements OnInit{
  carts: CartWithItems[] = [];

  //variables para el filtrado
  filteredCarts: CartWithItems[] = [];
  filterStatus: string = '';
  filterSurname: string = '';


  constructor(private cartService: CartService, private orderService: OrderService){
  }

  ngOnInit(): void {
    this.loadCompletedCarts()
  }

  loadCompletedCarts(): void {
  this.cartService.getCartItems().pipe(
    map(allCarts => allCarts.filter(cart => cart.cartStatus === 'completed')),
    switchMap(completedCarts => {
      if (completedCarts.length === 0) return of([] as CartWithItems[]);
      const cartObservables = completedCarts.map(cart =>
        this.orderService.getOrdersFromCart(cart.id).pipe(
          map(orderItems => {
            let fileSummary = '';
            const fileNames = orderItems
              .map(item => typeof item.file === 'string' ? item.file.split('/').pop() : 'Archivo desconocido')
              .filter(name => name);
            if (fileNames.length === 0) fileSummary = 'Sin archivos.';
            else if (fileNames.length === 1) fileSummary = fileNames[0] as string;
            else fileSummary = `${fileNames[0]}... (${fileNames.length} archivos)`;
            return { ...cart, orderItems, fileSummary } as CartWithItems;
          })
        )
      );
      return forkJoin(cartObservables);
    })
  ).subscribe({
    next: (cartsWithItems) => {
      this.carts = cartsWithItems;
      this.filteredCarts = [...cartsWithItems]; // 🔹 Inicializamos filteredCarts con todos
      console.log('Pedidos cargados para el administrador:', this.carts);
    },
    error: (err) => console.error('Error al cargar pedidos:', err)
  });
  }

  //filtrados
  filterByStatus(): void {
    if (!this.filterStatus) {
      this.filteredCarts = [...this.carts];
      return;
    }
    this.filteredCarts = this.carts.filter(c => c.status === this.filterStatus);
  }

  filterBySurname(): void {
    if (!this.filterSurname) {
      this.filteredCarts = [...this.carts];
      return;
    }
    const search = this.filterSurname.toLowerCase();
    this.filteredCarts = this.carts.filter(c =>
      c.customer?.surname?.toLowerCase().includes(search)
    );
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterSurname = '';
    this.filteredCarts = [...this.carts];
  }
}
