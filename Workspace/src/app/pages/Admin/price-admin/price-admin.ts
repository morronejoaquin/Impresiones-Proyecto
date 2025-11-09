import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PriceManagerService } from '../../../services/Prices/price-manager-service';
import Prices from '../../../models/Prices/Prices';

@Component({
  selector: 'app-price-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './price-admin.component.html',
  styleUrls: ['./price-admin.component.css']
})
export class PriceAdminComponent implements OnInit {
  priceForm!: FormGroup;
  prices: Prices[] = [];
  loading = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private priceService: PriceManagerService
  ) {}

  ngOnInit(): void {
    this.loadPrices();
    this.priceForm = this.fb.group({
      pricePerSheetBW: [0, [Validators.required, Validators.min(0)]],
      pricePerSheetColor: [0, [Validators.required, Validators.min(0)]],
      priceRingedBinding: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadPrices() {
    this.priceService.getPrices().subscribe({
      next: (data) => {
        this.prices = data;
        if (this.prices.length > 0) {
          const price = this.prices[0];
          this.priceForm.patchValue({
            pricePerSheetBW: price.pricePerSheetBW,
            pricePerSheetColor: price.pricePerSheetColor,
            priceRingedBinding: price.priceRingedBinding
          });
        }
      },
      error: (err) => console.error('Error loading prices', err)
    });
  }

  savePrices() {
    if (!this.prices[0]) return;

    const updatedPrice: Prices = {
      priceId: this.prices[0].priceId,
      ...this.priceForm.value
    };

    this.loading = true;
    this.priceService.updatePrices(updatedPrice).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = 'Precios actualizados correctamente!';
        this.loadPrices();
      },
      error: (err) => {
        this.loading = false;
        this.message = 'Error al actualizar precios';
        console.error(err);
      }
    });
  }
}
