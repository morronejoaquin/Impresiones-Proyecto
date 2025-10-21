import { Injectable } from '@angular/core';
import { CartItem } from '../../models/Cart/cart';

@Injectable({
  providedIn: 'root'
})
export class PriceCalculatorService {

  private readonly pricePerSheetBW = 15; //PRECIO SUJETO A CAMBIO
  private readonly pricePerSheetColor = 50; //PRECIO SUJETO A CAMBIO
  private readonly ringedPrice = 500; //PRECIO SUJETO A CAMBIO

  constructor() { }

  calculateItemPrice(item: Omit<CartItem, 'totalPrice'>): number {
    const sheetsPerCopy = item.isDoubleSided ? Math.ceil(item.pages / 2) : item.pages;
    const totalSheets = sheetsPerCopy * item.copies;

    const printPrice = item.isColor
      ? totalSheets * this.pricePerSheetColor
      : totalSheets * this.pricePerSheetBW;

    const bindingPrice = item.binding === 'ringed' ? this.ringedPrice : 0;

    return printPrice + bindingPrice;
  }
}