import { Component, OnInit } from '@angular/core';
import Cart from '../../../models/Cart/cart';
import { CartService } from '../../../services/Cart/cart-service';
import OrderItem from '../../../models/OrderItem/orderItem';
import { OrderService } from '../../../services/Orders/order-service';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface CartWithItems extends Cart {
  orderItems: OrderItem[];
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

  filteredCarts: CartWithItems[] = [];
  filterStatus: string = '';
  filterSurname: string = '';

  readonly STATUSES = ['pending','printing','binding','ready','delivered','cancelled'];
  savingIds = new Set<string>();

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompletedCarts();
  }

  loadCompletedCarts(): void {
    this.cartService.getCartItems().pipe(
      map(allCarts => allCarts.filter(cart => cart.cartStatus === 'completed')),
      switchMap(completedCarts => {
        if (completedCarts.length === 0) return of([] as CartWithItems[]);
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

              // --- NORMALIZAR status: si viene cartStatus, lo copiamos a status ---
              const status = (cart as any).status ?? (cart as any).cartStatus ?? '';

              return { ...cart, orderItems, fileSummary, status } as CartWithItems;
            })
          )
        );
        return forkJoin(cartObservables);
      })
    ).subscribe({
      next: (cartsWithItems) => {
        this.carts = cartsWithItems;
        this.filteredCarts = [...cartsWithItems];
      },
      error: (err) => console.error('Error al cargar pedidos:', err)
    });
  }

  filterByStatus(): void {
    if (!this.filterStatus) { this.filteredCarts = [...this.carts]; return; }
    this.filteredCarts = this.carts.filter(c => c.status === this.filterStatus);
  }

  filterBySurname(): void {
    if (!this.filterSurname) { this.filteredCarts = [...this.carts]; return; }
    const search = this.filterSurname.toLowerCase();
    this.filteredCarts = this.carts.filter(c => c.customer?.surname?.toLowerCase().includes(search));
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterSurname = '';
    this.filteredCarts = [...this.carts];
  }

  updateStatus(cart: CartWithItems, newStatus: string) {
    if (!newStatus || newStatus === cart.status) return;
    this.savingIds.add(cart.id);

    this.cartService.updateCartStatus(cart.id, newStatus).subscribe({
      next: (updated) => {
        // si devuelve 'status' o 'cartStatus', normalizá:
        const st = (updated as any).status ?? (updated as any).cartStatus ?? newStatus;
        cart.status = st;
        // refrescar filtros si había filtro activo
        this.filterByStatus();
      },
      error: (e) => console.error('No se pudo actualizar el estado', e),
      complete: () => this.savingIds.delete(cart.id)
    });
  }

  goToDetail(cart: CartWithItems) {
    this.router.navigate(['/admin/order', cart.id]);
  }

  goToPriceAdmin() {
    this.router.navigate(['/admin/prices']);
  }
}
