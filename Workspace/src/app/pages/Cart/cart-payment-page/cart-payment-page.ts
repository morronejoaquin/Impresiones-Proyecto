import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/Users/user-service';
import User from '../../../models/Users/user';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../services/Payment/payment-service';
import { CartService } from '../../../services/Cart/cart-service';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/Orders/order-service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-cart-payment-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cart-payment-page.html',
  styleUrl: './cart-payment-page.css'
})
export class CartPaymentPage implements OnInit{
  
  cartTotal: number = 0;
  cartForm: FormGroup;
  user: User | null = null;
  userId!: string;

  constructor(private fb: FormBuilder, 
    private userService: UserService, 
    private paymentService: PaymentService,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ){
    this.cartForm = this.fb.group({
      customerName: ['', Validators.required],
      surname: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      paymentMethod: ['cash', Validators.required],
      sign: ['']
    });
  }

  ngOnInit(): void {
    const payload = this.userService.getDecodedUserPayload();
    this.userId = payload?.userId || '';
    
    this.userService.getUserById(this.userId).subscribe({
      next: (userGet) => {
        this.user = userGet

        if(this.user && this.user.role === 'registered'){
          this.cartForm.patchValue({
            customerName: this.user.name,  
            surname: this.user.surname,
            phone: this.user.phone,
           });
          }
        },
        error: (err) => {console.error('Error al cargar datos del usuario:', err);
        }}
      );

      this.cartService.getCartByUserId(this.userId).subscribe({
        next: (carts) => {
            if (carts && carts.length > 0) {
                const cartId = carts[0].id;
                this.orderService.getOrdersFromCart(cartId).subscribe({
                    next: (orders) => {
                        this.cartTotal = this.orderService.calculateTotal(orders)
                    },
                    error: (err) => console.error('Error fetching orders for total:', err)
                });
            }else {
              this.cartTotal = 0;
            }
        },
        error: (err) => console.error('Error getting cart for total:', err)
    });
    }

    onSubmit() {
  if (this.cartForm.invalid) {
    this.cartForm.markAllAsTouched();
    console.log('Datos inválidos');
    return;
  }

  const p = this.cartForm.value;

  this.cartService.getCartByUserId(this.userId).pipe(
    switchMap(carts => {
      if (!carts || carts.length === 0) {
        throw new Error('No se encontró un carrito activo para el usuario. Imposible pagar.');
      }

      const cartId = carts[0].id;

      const payment = {
        cartId,
        paymentMethod: p.paymentMethod,
        paymentStatus: 'completed',
        finalPrice: this.cartTotal,
        depositAmount: p.sign || 0,
        orderDate: new Date().toISOString()
      };

      return this.paymentService.postPayment(payment as any).pipe(
        // luego de registrar el pago, cerramos el carrito
        switchMap(() => this.cartService.updateCart(cartId, {
          userId: this.userId,
          total: this.cartTotal,
          customer: {
            name: p.customerName,
            surname: p.surname,
            phone: p.phone
          },
          status: 'pending',
          cartStatus: 'completed',
          completedAt: new Date().toISOString()
        }))
      );
    })
  ).subscribe({
    next: () => {
      console.log('Pago registrado y carrito movido a completado.');
      alert('Pago registrado. Su pedido está siendo procesado.');
      this.router.navigate(['home']);
    },
    error: (e) => {
      console.error('Error en el flujo de pago:', e);
      alert('Error al procesar el pago o actualizar el pedido.');
    }
  });
}


  getCustomerName() {
    return this.cartForm.get('customerName');
  }

  getSurname() {
    return this.cartForm.get('surname');
  }

  getPhone() {
    return this.cartForm.get('phone');
  }

  getPaymentMethod() {
    return this.cartForm.get('paymentMethod');
  }
}
