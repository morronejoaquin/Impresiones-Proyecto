import { Component } from '@angular/core';
import { UserService } from '../../../services/Users/user-service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import User from '../../../models/Users/user';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-login-page',
  imports: [RouterLink],
  templateUrl: './user-login-page.html',
  styleUrl: './user-login-page.css'
})
export class UserLoginPage implements OnInit {

  formUser:FormGroup;
  
constructor(private userS:UserService,private fb:FormBuilder){
  this.formUser=this.fb.group({
    usernameF:['',Validators.required],
    password:['',Validators.required]
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
        const password=this.formUser.get('password')?.value;

        const usuarioEncontrado=this.userS.User
        .find((user:User)=> user.username===username && user.password===password)
        if (usuarioEncontrado){
          console.log('Login exitoso');
        } else {
          console.log('Credenciales incorrectas');
        }
      } else {
        console.log('Formulario no válido')
        ;
    }
  }

}
