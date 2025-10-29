import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserService } from '../../../services/Users/user-service';

@Component({
  selector: 'app-cart-payment-page',
  imports: [],
  templateUrl: './cart-payment-page.html',
  styleUrl: './cart-payment-page.css'
})
export class CartPaymentPage implements OnInit{
cartTotal: number = 0;
  cartForm: FormGroup;
user:User | null = null;
  constructor(private fb: FormBuilder,private userService: UserService) {
    this.cartForm = this.fb.group({
      customerName: ['', Validators.required],
      surname: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      paymentMethod: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const payload = this.userService.getDecodedUserPayload();
  this.userService.getUserById(payload?.userId || '').subscribe(
      {next: (userGet) => this.user=userGet,
      error: (err) => {console.error('Error al cargar datos del usuario:', err);}
    }
    );
    this.cartForm.setValue({
      customerName: this.user?.name,
      surname: this.user?.surname,
      phone: this.user?.phone,
    });
  }
}
