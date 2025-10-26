import { UserService } from '../../../services/Users/user-service';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import User from '../../../models/Users/user';
import {  RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-login-page',
  imports: [RouterLink,ReactiveFormsModule],
  templateUrl: './user-login-page.html',
  styleUrl: './user-login-page.css'
})
export class UserLoginPage implements OnInit {

  formUser:FormGroup;
  
constructor(private userS:UserService,private fb:FormBuilder){
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
          this.userS.setUserLoggedIn(usuarioEncontrado);
          console.log('Login exitoso');
        } else {
          console.log('Credenciales incorrectas');
        }
      } else {
        console.log('Formulario no válido');
    }
  }

}
