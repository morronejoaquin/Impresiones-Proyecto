import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import OrderItem from '../../models/OrderItem/orderItem';

@Injectable({
  providedIn: 'root'
})

export class OrderService {
    readonly url='http://localhost:3000/orderItems'

OrderItem:OrderItem[]=[]
constructor(private http:HttpClient) { }

getOrderById(id:string): Observable<OrderItem>{
  return this.http.get<OrderItem>(`${this.url}/${id}`);
}

getOrdersFromCart(cartId:string){
  return this.http.get<OrderItem[]>(`${this.url}?cartId=${cartId}`);
}

postOrderToCart(order:Partial<OrderItem>){
  return this.http.post<OrderItem>(this.url,order);
}//Cuando se llame desde la page hay que pasarle el cartId

updateOrder(id: string, order: Partial<OrderItem>){
  return this.http.put<OrderItem>(`${this.url}/${id}`,order);
}

deleteOrderFromCart(id:string){
  return this.http.delete<OrderItem>(`${this.url}/${id}`);
}
}
