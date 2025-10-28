import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import User from '../../models/Users/user';
import { decodeToken, encodeToken, isTokenValid } from '../../utils/jwt-utils';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  readonly url='http://localhost:3000/users'

  User:User[]=[]

  readonly TOKEN_KEY = 'auth_token'

  private loggedInUser: User | null = null;

  constructor(private http:HttpClient) {
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

  // Almacena el token generado en sessionStorage
  setAuthToken(user: User): void {
    const token = encodeToken(user); // Generar el token
    sessionStorage.setItem(this.TOKEN_KEY, token); 
  }

    // Obtiene el token almacenado en sessionStorage
  getAuthToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Obtiene el rol decodificando el token
  getUserRole(): 'admin' | 'guest' | 'registered' | null {
    const token = this.getAuthToken();
    if (!token || !isTokenValid(token)) {
        this.logout();
        return null;
    }
    
    const decoded = decodeToken(token);
    return decoded?.role as ('admin' | 'guest' | 'registered') || null;
  }

  // Cierra la sesión del usuario
  logout() {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  /**
     * @description Obtiene los datos del usuario decodificando el JWT. 
     * Este método reemplaza a getLoggedInUser().
     */
  getDecodedUserPayload(): { userId: string, role: 'admin' | 'guest' | 'registered' } | null {
      const token = this.getAuthToken();
      if (!token || !isTokenValid(token)) {
          this.logout();
          return null;
      }
      
      // decodeToken ahora devuelve el objeto con userId y role (al menos)
      const decoded = decodeToken(token);

      // Si la decodificación es exitosa, devolvemos el payload para usarlo en los componentes.
      if (decoded && decoded.userId) {
            return decoded as { userId: string, role: 'admin' | 'guest' | 'registered' };
      }
      return null;
  }

}
