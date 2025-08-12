import { Component, OnInit } from '@angular/core';
import { NotificationService, NotificationMessage } from '../core/services/notification.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  trigger,
  style,
  animate,
  transition,
  state
} from '@angular/animations';

@Component({
  selector: 'app-notification',
  template: `
    <div class="notifications-container">
      <div 
        *ngFor="let notification of notifications"
        class="notification"
        [ngClass]="'notification-' + notification.type"
        [@slideIn]>
        {{ notification.message }}
        <button 
          class="notification-close"
          (click)="close(notification.id)">
          ×
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./notification.component.css'],
  standalone:true,
  imports:[ReactiveFormsModule,CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
       ])
    ])
  ]
})
export class NotificationComponent implements OnInit {
  notifications: NotificationMessage[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  close(id: number) {
    this.notificationService.removeNotification(id);
  }
}