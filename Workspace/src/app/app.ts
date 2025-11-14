import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { NotificationDisplay } from './pages/Notification/notification-display/notification-display';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Header,Footer, NotificationDisplay],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Workspace');
}
