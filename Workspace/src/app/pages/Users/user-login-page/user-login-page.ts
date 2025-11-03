import { UserService } from '../../../services/Users/user-service';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import User from '../../../models/Users/user';
import {  Router, RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-login-page',
  imports: [RouterLink,ReactiveFormsModule],
  templateUrl: './user-login-page.html',
  styleUrl: './user-login-page.css'
})
export class UserLoginPage implements OnInit {

  formUser:FormGroup;
  
  constructor(private userS:UserService,private fb:FormBuilder, private router: Router){
    this.formUser=this.fb.group({
      usernameF:['',Validators.required],
      passwordF:['',Validators.required]
    });
  }
  
  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios(){
    this.userS.getUsers().subscribe({
      next:(data)=>{this.userS.User=data},
      error:(e: any)=>{console.log(e)}
    })
  }

  verificarLogin(){
    if (this.formUser.valid){
      const username=this.formUser.get('usernameF')?.value;
      const password=this.formUser.get('passwordF')?.value;

      const usuarioEncontrado=this.userS.User
      .find((user:User)=> user.username===username && user.password===password)
      if (usuarioEncontrado){
        this.userS.setAuthToken(usuarioEncontrado);
        console.log('Login exitoso');
        this.router.navigate(['/home'])
      } else {
        console.log('Credenciales incorrectas');
      }
    } else {
      console.log('Formulario no válido');
    }
  }

  loginAsGuest() {
    const guestUser: User = { 
        id: `${Date.now()}`, 
        username: `guest_${Date.now()}`, 
        name: 'Invitado',
        surname: 'Temporal',
        email: 'guest@temp.com',
        phone: '0000000000',
        password: '', 
        role: 'guest',
    };

    this.userS.postUser(guestUser).subscribe({
        next: (createdUser: User) => {
            console.log('Usuario invitado creado:', createdUser);
            
            // establece el token de autenticación
            this.handleLogin(createdUser); 
            
            // guarda el ID en sessionStorage para limpieza al cerrar la pestaña
            this.userS.setGuestUserForCleanup(createdUser); 

            this.router.navigate(['/make-order']); 
        },
        error: (error) => {
            console.error('Error al crear el usuario invitado en el servidor:', error);
        }
    });
  }

  private handleLogin(user: User | undefined) {
    if (user) {
      this.userS.setAuthToken(user);
      console.log(`Login exitoso como ${user.role}`);
      this.router.navigate(['/make-order']); 
    } else {
      console.log('Credenciales incorrectas');
    }
  }
}
