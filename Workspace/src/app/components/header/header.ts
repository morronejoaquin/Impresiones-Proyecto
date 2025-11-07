import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';   
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/Users/user-service'; 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'] 
})
export class Header {
  users = inject(UserService);

  logout() {
    this.users.logout();
  }
}
