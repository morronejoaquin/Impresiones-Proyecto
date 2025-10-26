import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Prices from '../../models/Prices/Prices';

@Injectable({
  providedIn: 'root'
})
export class PriceManagerService {
  readonly url = 'http://localhost:3000/prices';
  Prices: Prices[] = [];

  constructor(private http: HttpClient) {}

  getPrices() {
    return this.http.get<Prices[]>(this.url);
  }

  postPrices(price: Prices) {
    return this.http.post<Prices>(this.url, price);
  }

  updatePrices(price: Prices) {
    return this.http.put<Prices>(`${this.url}/${price.priceId}`, price);
  }

  loadPrices() {
    this.getPrices().subscribe(data => {
      this.Prices = data;
    });
  }

  calculatePrice(pages: number,copies: number,isDoubleSided: boolean,binding: 'ringed' | 'stapled' | null,isColor: boolean): number {
    const priceData = this.Prices[0];
    if (!priceData) return 0;

    let pricePerPage = isColor
      ? priceData.pricePerSheetColor
      : priceData.pricePerSheetBW;

    if (isDoubleSided) pages = Math.ceil(pages / 2);

    let bindingCost = 0;
    if (binding === 'ringed') bindingCost = priceData.priceRingedBinding;

    const total = (pricePerPage * pages * copies) + bindingCost;
    return parseFloat(total.toFixed(2));
  }
}
