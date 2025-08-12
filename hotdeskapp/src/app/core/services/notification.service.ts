import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationMessage[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private nextId = 1;

  showSuccess(message: string) {
    this.addNotification(message, 'success');
  }

  showError(message: string) {
    this.addNotification(message, 'error');
  }

  showInfo(message: string) {
    this.addNotification(message, 'info');
  }

  showWarning(message: string) {
    this.addNotification(message, 'warning');
  }

  private addNotification(message: string, type: NotificationMessage['type']) {
    const notification: NotificationMessage = {
      message,
      type,
      id: this.nextId++
    };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, notification]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 3000);
  }

  removeNotification(id: number) {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }
}