// src/app/header.component/header.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { User, UserRole } from '../core/models/user.model';
import { UserService } from '../core/services/user.service';
@Component({
  selector: 'app-header',
  standalone: true,
  template: `
   <div class="header">
  <div class="logo">
    <div class="logo-icon">HD</div>
    <div>
      <h1>HotDesk Pro</h1>
    </div>
  </div>
  <div class="user-info" *ngIf="currentUser">
    <div class="user-details">
      <div class="user-name">{{ currentUser?.name || getFullName() }}</div>    
    </div>
    <div class="user-avatar">{{ getInitials(currentUser?.name || getFullName()) }}</div>
    
    <!-- Modern Sign Out Button -->
    <div class="user-actions">
      <button class="logout-button" (click)="onLogout()" title="Sign Out">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  </div>
</div>
  `,
  styleUrls: ['./header.component.css'],
  imports: [CommonModule]
})
export class HeaderComponent implements OnInit {
  @Input() currentUser: User | null = null;

  constructor(private authService: AuthService, private userService: UserService) {}
  
  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.role) {
      case UserRole.Employee:   // 0
        return 'Employee';
      case UserRole.Admin:      // 1
        return 'Admin';

      default:
        return 'User';
    }
  }

  // Check if current user is admin (role 1 or 2)
  isCurrentUserAdmin(): boolean {
    return this.currentUser ? this.currentUser.role >= 1 : false;
  }

  ngOnInit() {
    // Subscribe to current user changes if not passed as input
    if (!this.currentUser) {
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      });
    }
  }

 getInitials(name?: string): string {
  if (name && name.trim()) {
    return name
      .split(' ')
      .filter(n => n)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  if (this.currentUser?.firstName || this.currentUser?.lastName) {
    return `${this.currentUser.firstName?.[0] || ''}${this.currentUser.lastName?.[0] || ''}`.toUpperCase();
  }

  return '??';
}

 getFullName(): string {
  if (!this.currentUser) return '';
  
  const first = this.currentUser.firstName || '';
  const last = this.currentUser.lastName || '';
  return `${first} ${last}`.trim();
}


  getRoleClass(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.role) {
      case 1:
        return 'admin';
      default:
        return 'employee';
    }
  }

  onLogout(): void {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
    }
  }
}

