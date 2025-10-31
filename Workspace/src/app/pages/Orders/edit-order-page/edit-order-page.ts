import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-order-page',
  imports: [],
  templateUrl: './edit-order-page.html',
  styleUrl: './edit-order-page.css'
})
export class EditOrderPage {
  orderId: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
  }
}
