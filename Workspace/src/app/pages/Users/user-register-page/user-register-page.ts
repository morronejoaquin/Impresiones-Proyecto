import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/Users/user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-register-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-register-page.html',
  styleUrl: './user-register-page.css'
})
export class UserRegisterPage implements OnInit {

  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userS: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(18),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,18}$/
          )
        ]
      ]
    });
  }

  onRegisterSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.registerForm.value.role = 'registered';
    this.userS.postUser(this.registerForm.value).subscribe({
      next: (data) => {
        console.log('User registered successfully');
        console.log(data);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error(' Error registering user', error);
      }
    });
  }
}
