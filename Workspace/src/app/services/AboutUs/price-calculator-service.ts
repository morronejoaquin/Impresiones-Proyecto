import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PriceCalculatorService {

  private readonly pricePerSheetBW = 15; //PRECIO SUJETO A CAMBIO
  private readonly pricePerSheetColor = 50; //PRECIO SUJETO A CAMBIO
  private readonly ringedPrice = 500; //PRECIO SUJETO A CAMBIO

  constructor() { }

 
}