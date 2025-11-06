import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/Users/user-service';
import User from '../../../models/Users/user';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../services/Payment/payment-service';
import { CartService } from '../../../services/Cart/cart-service';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/Orders/order-service';

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
            }
        },
        error: (err) => console.error('Error getting cart for total:', err)
    });
    }

    onSubmit(){
      if(this.cartForm.invalid){
        this.cartForm.markAllAsTouched()
        console.log("Datos invalidos")
        return;
      }

      const p = this.cartForm.value
      
      this.cartService.getCartByUserId(this.userId).subscribe({
        next: (carts) => {
            if (!carts || carts.length === 0) {
                console.error("No se encontró un carrito activo para el usuario.");
                return;
            }

            const cartId = carts[0].id;
            
            const payment = {
                ...p,
                cartId: cartId, 
                payMentStatus: 'pending',
                finalPrice: this.cartTotal, 
                depositAmount: p.sign || 0, 
                orderDate: Date.now()
            };

            this.paymentService.postPayment(payment).subscribe({
                next: (data) => {
                    this.cartService.clearOrdersInCart(cartId).subscribe({
                      next: () => {
                        console.log("Pago registrado")
                        alert("Pago registrado")
                        this.router.navigate(['home'])
                      },
                      error: (e) => {
                        console.error('Error al vaciar los items después del pago:', e);
                        alert("Pago registrado, pero hubo un error al vaciar el carrito.");
                      }
                    })
                },
                error: (e) => {
                    console.error("Error al registrar el pago:", e);
                }
            });

        },
        error: (err) => {
            console.error("Error obteniendo el carrito:", err);
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
