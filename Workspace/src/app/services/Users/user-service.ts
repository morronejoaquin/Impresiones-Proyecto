import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import User from '../../models/Users/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  readonly url='http://localhost:3000/users'

  User:User[]=[]

  private loggedInUser: User | null = null;

  constructor(private http:HttpClient) {
    const userJson = sessionStorage.getItem('currentUser');
      if (userJson) {
          this.loggedInUser = JSON.parse(userJson);
      }
  }

  getUsers(){
    return this.http.get<User[]>(this.url);
  }

  getUserById(id:string){
    return this.http.get<User>(`${this.url}/${id}`);
  }

  postUser(user:User){
    return this.http.post<User>(this.url,user);
  }

  updateUser(user:User){
    return this.http.put<User>(`${this.url}/${user.id}`,user);
  }

  deleteUser(id:string){
    return this.http.delete<User>(`${this.url}/${id}`);
  }

  // guarda el usuario en sessionStorage
  setLoggedInUser(user: User) {
      this.loggedInUser = user;
      sessionStorage.setItem('currentUser', JSON.stringify(user)); 
  }

  // recupera el usuario guardado en sessionStorage en caso de que se recargue
  // la pagina
  getLoggedInUser(): User | null {
    if (!this.loggedInUser) {
        const userJson = sessionStorage.getItem('currentUser');
        if (userJson) {
            this.loggedInUser = JSON.parse(userJson);
        }
    }
    return this.loggedInUser;
  }

  // obtiene el rol del usuario
  getUserRole(): 'admin' | 'guest' | 'registered' | null {
    return this.getLoggedInUser()?.role || null;
  }

  // Cierra la sesión del usuario
  logout() {
    this.loggedInUser = null;
    sessionStorage.removeItem('currentUser');
  }

}
