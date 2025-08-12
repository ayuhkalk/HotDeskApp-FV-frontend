import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header.component/header.component';
import { TabNavigationComponent } from './tab-navigation.component/tab-navigation.component';
import { NotificationComponent } from './notification.component/notification.component';
import { BookingComponent } from './booking.component/booking.component';
import { MyBookingsComponent } from './my-bookings.component/my-bookings.component';
import { CalendarComponent } from './calendar.component/calendar.component';
import { AdminComponent } from './admin.component/admin.component';
import { LoginComponent } from './login.component/login.component';
import { AuthService } from './core/services/auth.service';
import { User, UserRole } from './core/models/user.model';
import { UserService } from './core/services/user.service';
import { InteractiveFloorPlanComponent } from './floor-layout/floor-layout';
import { FloorPlanBookingComponent } from "./floor-layout.booking/floor-layout.booking";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    TabNavigationComponent,
    BookingComponent,
    MyBookingsComponent,
    CalendarComponent,
    AdminComponent,
    NotificationComponent,
    LoginComponent,
    CommonModule,
    InteractiveFloorPlanComponent,
    HttpClientModule,
    FloorPlanBookingComponent
],
  template: `
    <!-- Login Screen - shown when user is not logged in -->
    <div class="app-container" *ngIf="!isLoggedIn">
      <app-login></app-login>
    </div>
    

    <!-- Main Application - shown when user is logged in -->
    <div class="app-container" *ngIf="isLoggedIn">
      <app-header [currentUser]="currentUser"></app-header>
      <app-tab-navigation 
      [showAdminTab]="isAdmin" 
      [currentUser]="currentUser"
      (tabChange)="onTabChange($event)">
    </app-tab-navigation>

      <div [ngSwitch]="activeTab">
        <app-booking *ngSwitchCase="'booking'"
          [selectedDate]="selectedDateFromCalendar"
          [currentUser]="currentUser">
        </app-booking>
        <app-my-bookings *ngSwitchCase="'mybookings'"
          [currentUser]="currentUser">
        </app-my-bookings>
        <app-calendar *ngSwitchCase="'calendar'"
          (dateSelected)="onDateSelectedFromCalendar($event)"
          [currentUser]="currentUser">
        </app-calendar>
        <app-interactive-floor-plan *ngSwitchCase="'floorlayout'"
          [currentUser]="currentUser"></app-interactive-floor-plan>

          <app-floor-plan-booking *ngSwitchCase="'floorplanbooking'"
          [currentUser]="currentUser"></app-floor-plan-booking>

       <ng-container *ngSwitchCase="'admin'">
        <app-admin *ngIf="isAdmin" [currentUser]="currentUser"></app-admin>
      </ng-container>

      </div>
      
      <app-notification></app-notification>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  activeTab = 'booking';
  selectedDateFromCalendar: string | null = null;
  currentUser: User | null = null;
  isLoggedIn = false;
  isAdmin = false;

  constructor(private authService: AuthService, private userService: UserService) {}
  // Check if user is admin using role digits 1 or 2
  isUserAdmin(): boolean {
    return this.currentUser ? this.currentUser.role >= 1 : false;
  }
  // Alternative using the service method
  isUserAdminViaService(): boolean {
    return this.userService.isAdmin();
  }

  // Get role display name
  getUserRoleName(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.role) {
      case UserRole.Employee:  // 0
        return 'Employee';
      case UserRole.Admin:     // 1
        return 'Admin';
      default:
        return 'Unknown';
    }
  }

  // Check specific roles
  canAccessAdminPanel(): boolean {
    return this.currentUser ? this.currentUser.role >= 1 : false;
  }

  ngOnInit() {
    // Subscribe to authentication state changes
    console.log('Current user:', this.currentUser);
console.log('Is admin:', this.isAdmin);
console.log('Active tab:', this.activeTab);
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = this.authService.isAdmin();
  })}

  onTabChange(tab: string) {
    // Prevent access to admin tab for non-admin users
    if (tab === 'admin' && !this.isAdmin) {
      console.warn('Access denied: Admin privileges required for admin tab');
      return;
    }
    
    this.activeTab = tab;
    console.log('Tab changed to:', tab);
  }

  onDateSelectedFromCalendar(date: string) {
    console.log('App received date from calendar:', date);
    this.selectedDateFromCalendar = date;
    this.activeTab = 'booking'; // Switch to booking tab
    console.log('Switched to booking tab, selectedDate:', this.selectedDateFromCalendar);
  }
}
