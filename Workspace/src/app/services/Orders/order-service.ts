import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import OrderItem from '../../models/OrderItem/orderItem';

@Injectable({
  providedIn: 'root'
})

export class OrderService {
    readonly url='http://localhost:3000/orderItems'

OrderItem:OrderItem[]=[]
constructor(private http:HttpClient) { }

getOrder(id:number){
  return this.http.get<OrderItem>(`${this.url}/${id}`);
}

getOrdersFromCart(cartId:string){
  return this.http.get<OrderItem[]>(`${this.url}?cartId=${cartId}`);
}

postOrderToCart(order:OrderItem){
  return this.http.post<OrderItem>(this.url,order);
}//Cuando se llame desde la page hay que pasarle el cartId

updateOrderInCart(order:OrderItem){
  return this.http.put<OrderItem>(`${this.url}/${order.id}`,order);
}

deleteOrderFromCart(id:string){
  return this.http.delete<OrderItem>(`${this.url}/${id}`);
}
}
