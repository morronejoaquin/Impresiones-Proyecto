import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Prices from '../../models/Prices/Prices';

@Injectable({
  providedIn: 'root'
})

export class PriceManagerService {
  readonly url='http://localhost:3000/prices'
  
  Prices:Prices[]=[]
    constructor (private http:HttpClient) { 
      
  }	

//No se desea que en ningun momento se puedan eliminar los precios

  updatePrices(price:Prices){
    this.http.put<Prices>(this.url,price)
  }

  postPrices(price:Prices){
    this.http.post<Prices>(this.url,price)
  }

  getPrices(){
    this.http.get<Prices>(this.url)
  }
}
