import { Component, OnInit } from '@angular/core';
import Cart from '../../../models/Cart/cart';
import { CartService } from '../../../services/Cart/cart-service';
import OrderItem from '../../../models/OrderItem/orderItem';
import { OrderService } from '../../../services/Orders/order-service';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

interface CartWithItems extends Cart {
    orderItems: OrderItem[];
    // Propiedad calculada para el resumen de archivos
    fileSummary: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-page',
  imports: [CommonModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css'
})

export class AdminPage implements OnInit{
  carts: CartWithItems[] = []


  constructor(private cartService: CartService, private orderService: OrderService){
  }

  ngOnInit(): void {
    this.loadCompletedCarts()
  }

  loadCompletedCarts(): void {
    // 1. Obtener TODOS los carritos (no solo los 'pending' del cliente)
    this.cartService.getCartItems().pipe(
      // Filtrar solo los carritos que ya fueron pagados y usados (cartStatus: 'completed')
      map(allCarts => allCarts.filter((cart) => cart.cartStatus === 'completed')),
      
      // Si no hay carritos, retornar un Observable vacío
      switchMap(completedCarts => {
        if (completedCarts.length === 0) {
          return of([] as CartWithItems[]);
        }

        // 2. Para cada carrito, obtener sus OrderItems asociados
        const cartObservables = completedCarts.map(cart => 
          this.orderService.getOrdersFromCart(cart.id).pipe(
            map(orderItems => {

                // Calcular el resumen de archivos
                let fileSummary = '';
                const fileNames = orderItems
                  .map(item => typeof item.file === 'string' ? item.file.split('/').pop() : 'Archivo desconocido')
                  .filter(name => name); // Filtrar nombres nulos/vacíos

                if (fileNames.length === 0) {
                  fileSummary = 'Sin archivos.';
                } else if (fileNames.length === 1) {
                  fileSummary = fileNames[0] as string;
                } else {
                  fileSummary = `${fileNames[0]}... (${fileNames.length} archivos)`;
                }

                // Combinar Cart con OrderItems y el resumen
                return {
                  ...cart, 
                  orderItems: orderItems,
                  fileSummary: fileSummary
                } as CartWithItems;
            })
          )
        );

        // 3. Esperar a que todos los ítems se carguen
        return forkJoin(cartObservables);
      })
    ).subscribe({
      next: (cartsWithItems) => {
        // Asignar los carritos cargados (que ahora son pedidos)
        this.carts = cartsWithItems;
        console.log('Pedidos cargados para el administrador:', this.carts);
      },
      error: (err) => console.error('Error al cargar pedidos:', err)
    });
  }
}
