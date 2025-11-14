import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ImpresionesNotification {
  message: string;
  type: 'success' | 'error' | 'info';
  redirectUrl?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<ImpresionesNotification>();
  notification$ = this.notificationSubject.asObservable();

  private pendingNotification: ImpresionesNotification | null = null;

  show(message: string, type: 'success' | 'error' | 'info' = 'info', redirectUrl?: string) {
    const notification: ImpresionesNotification = { message, type, redirectUrl }; 

    // Almacena el mensaje 
    this.pendingNotification = notification;

    this.notificationSubject.next(notification);
  }

  getPendingNotification(): ImpresionesNotification | null {
    const notification = this.pendingNotification;
    this.pendingNotification = null;
    return notification;
  }

  success(message: string, redirectUrl?: string) {
    this.show(message, 'success', redirectUrl);
  }

  error(message: string, redirectUrl?: string) {
    this.show(message, 'error', redirectUrl);
  }

  info(message: string, redirectUrl?: string) {
    this.show(message, 'info', redirectUrl);
  } 
}
