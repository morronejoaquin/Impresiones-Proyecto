import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import User from '../../models/Users/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    readonly url='http://localhost:3000/users'

    User:User[]=[]

    constructor(private http:HttpClient) { }

    getUsers(){
      return this.http.get<User[]>(this.url);
    }

    getUserById(id:number){
      return this.http.get<User>(`${this.url}/${id}`);
    }

    postUser(user:User){
      return this.http.post<User>(this.url,user);
    }

    updateUser(user:User){
      return this.http.put<User>(`${this.url}/${user.userId}`,user);
    }

    deleteUser(id:number){
      return this.http.delete<User>(`${this.url}/${id}`);
}
}
