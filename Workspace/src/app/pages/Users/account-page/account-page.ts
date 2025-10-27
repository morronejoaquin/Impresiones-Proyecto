import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/Users/user-service';
import User from '../../../models/Users/user';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-page.html',
  styleUrl: './account-page.css'
})
export class AccountPage implements OnInit {
  currentUser: User | null = null;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.currentUser = this.userService.getLoggedInUser();
  }

  logout() {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.userService.logout();
      this.router.navigate(['/']);
    }
  }
}
