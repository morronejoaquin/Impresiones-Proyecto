import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-show-cart-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './show-cart-page.html',
  styleUrl: './show-cart-page.css'
})
export class ShowCartPage {
  cartTotal: number = 0;
  cartForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.cartForm = this.fb.group({
      customerNameF: [''],
      surnameF: [''],
      phoneF: [''],
      paymentMethodF: [''],
      signF: [0]
    });
  }
}
