import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OrderService } from '../../../services/Orders/order-service';

@Component({
  selector: 'app-make-order-page',
  imports: [],
  templateUrl: './make-order-page.html',
  styleUrl: './make-order-page.css'
})
export class MakeOrderPage {
  
orderForm:FormGroup;

constructor(private orderService:OrderService){
    this.orderForm=new FormGroup({});
}

selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    this.selectedFile = input.files[0];

    console.log('Selected file:', this.selectedFile);
  }

}