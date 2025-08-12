import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserRole } from '../core/models/user.model';

@Component({
  selector: 'app-tab-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="nav-tabs">
      <button
        class="nav-tab"
        [class.active]="activeTab === 'booking'"
        (click)="setActiveTab('booking')">Book A Desk
      </button>
      <button
        class="nav-tab"
        [class.active]="activeTab === 'mybookings'"
        (click)="setActiveTab('mybookings')"> My Bookings
      </button>
      <button
        class="nav-tab"
        [class.active]="activeTab === 'calendar'"
        (click)="setActiveTab('calendar')">Calendar View
      </button>
        <button
        class="nav-tab"
        [class.active]="activeTab === 'floorplanbooking'"
        (click)="setActiveTab('floorplanbooking')">Floor Layout
      </button>
      <button
        *ngIf="showAdminTab"
        class="nav-tab admin-tab"
        [class.active]="activeTab === 'admin'"
        (click)="setActiveTab('admin')">Admin Panel
      </button>
    </div>
  `,
  styleUrls: ['./tab-navigation.component.css']
})
export class TabNavigationComponent implements OnInit {
  activeTab = 'booking';
  
  @Input() showAdminTab: boolean = false;
  @Input() currentUser: User | null = null;
  @Output() tabChange = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {}

  setActiveTab(tab: string) {
    // Check admin access using role digits (1 or 2)
    if (tab === 'admin' && !this.isUserAdmin()) {
      console.warn('Access denied: Admin privileges required for admin tab');
      return;
    }
    
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }

  // Check if user is admin (role 1 or 2)
  private isUserAdmin(): boolean {
  console.log('Checking admin status for user:', this.currentUser);

  if (!this.currentUser) {
    console.log('No user found → returning false');
    return false;
  }

  console.log('User role:', this.currentUser.role);
  const isAdmin = this.currentUser.role == 1;
  console.log('Is admin?', isAdmin);

  return isAdmin;
}

}
