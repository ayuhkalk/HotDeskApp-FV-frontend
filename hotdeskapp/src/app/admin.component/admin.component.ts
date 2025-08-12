import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../core/services/admin.service';
import { DeskService } from '../core/services/desk.service';
import { BookingService } from '../core/services/booking.service';
import { NotificationService } from '../core/services/notification.service';
import { AdminStats } from '../core/models/admin-stats.model';
import { Desk } from '../core/models/desk.model';
import { Booking } from '../core/models/booking.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { User } from '../core/models/user.model';
@Component({
  selector: 'app-admin',
  template: `
    <div class="admin-container">
      <!-- Statistics Cards -->
      <div class="admin-panel">
        <div class="stats-card">
          <div class="stats-number">{{ stats?.totalDesks || 0 }}</div>
          <div class="stats-label">Total Desks</div>
        </div>
        <div class="stats-card">
          <div class="stats-number">{{ stats?.todayBookings || 0 }}</div>
          <div class="stats-label">Today's Bookings</div>
        </div>
        <div class="stats-card">
          <div class="stats-number">{{ stats?.utilizationRate || 0 }}%</div>
          <div class="stats-label">Utilization Rate</div>
        </div>

      </div>

      <!-- Desk Management Section -->
      <div class="admin-section">
        <div class="section-header">
          <h2>Manage Desks</h2>
          <button class="btn btn-primary" (click)="showAddDeskModal = true">
            Add New Desk
          </button>
        </div>
        
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Desk ID</th>
                <th>Location</th>
                <th>Features</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let desk of desks">
                <td><strong>{{ desk.number }}</strong></td>
                <td>{{ desk.location }}</td>
                <td>{{ desk.features }}</td>
                <td>
                  <span class="status-badge" [class.status-active]="desk.isActive" [class.status-inactive]="!desk.isActive">
                    {{ desk.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-danger btn-sm" (click)="removeDesk(desk.id)">
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="desks.length === 0">
                <td colspan="5" class="no-data">No desks found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- All Bookings Section -->
      <div class="admin-section">
        <h2>All Bookings</h2>
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Desk</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let booking of allBookings">
                <td>{{ booking.userName }}</td>
                <td><strong>{{ booking.deskNumber }}</strong></td>
                <td>{{ formatDate(booking.date) }}</td>
                <td>{{ booking.startTime }} - {{ booking.endTime }}</td>
                <td>
                  <span class="status-badge" [ngClass]="getBookingStatusClass(booking)">
                    {{ booking.status }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      *ngIf="canCancelBooking(booking)"
                      class="btn btn-danger btn-sm"
                      (click)="adminCancelBooking(booking.id)">
                      Cancel
                    </button>
                    <span *ngIf="!canCancelBooking(booking)" class="no-action">-</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="allBookings.length === 0">
                <td colspan="6" class="no-data">No bookings found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Desk Modal -->
    <div class="modal" [class.show]="showAddDeskModal" *ngIf="showAddDeskModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add New Desk</h3>
          <button class="close-btn" (click)="showAddDeskModal = false">&times;</button>
        </div>
        <form [formGroup]="addDeskForm" (ngSubmit)="onAddDesk()" class="modal-form">
          <div class="form-group">
            <label for="deskNumber">Desk Number</label>
            <input 
              type="text" 
              id="deskNumber"
              formControlName="number"
              class="form-control"
              placeholder="e.g., D-009">
            <div *ngIf="addDeskForm.get('number')?.invalid && addDeskForm.get('number')?.touched" class="error-message">
              Desk number is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="deskLocation">Location</label>
            <input 
              type="text" 
              id="deskLocation"
              formControlName="location"
              class="form-control"
              placeholder="e.g., Floor 2, Zone A">
            <div *ngIf="addDeskForm.get('location')?.invalid && addDeskForm.get('location')?.touched" class="error-message">
              Location is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="deskFeatures">Features</label>
            <textarea 
              id="deskFeatures"
              formControlName="features"
              class="form-control"
              placeholder="Monitor, Standing desk, Near window..."></textarea>
          </div>
          <div class="form-group">
  <label for="floorPlanId">Floor Plan ID</label>
  <input type="number" id="floorPlanId" formControlName="floorPlanId" class="form-control">
</div>

<div class="form-group">
  <label for="positionX">Position X</label>
  <input type="number" id="positionX" formControlName="positionX" class="form-control">
</div>

<div class="form-group">
  <label for="positionY">Position Y</label>
  <input type="number" id="positionY" formControlName="positionY" class="form-control">
</div>

<div class="form-group">
  <label for="width">Width</label>
  <input type="number" id="width" formControlName="width" class="form-control">
</div>

<div class="form-group">
  <label for="height">Height</label>
  <input type="number" id="height" formControlName="height" class="form-control">
</div>
          
          
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="showAddDeskModal = false">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="addDeskForm.invalid || isLoading">
              {{ isLoading ? 'Adding...' : 'Add Desk' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AdminComponent implements OnInit {
  @Input() currentUser!: User | null;
  stats: AdminStats | null = null;
  desks: Desk[] = [];
  allBookings: Booking[] = [];
  showAddDeskModal = false;
  addDeskForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private deskService: DeskService,
    private bookingService: BookingService,
    private notificationService: NotificationService
  ) {
    this.addDeskForm = this.fb.group({
      number: ['', [Validators.required, Validators.maxLength(20)]],
      location: ['', [Validators.required, Validators.maxLength(100)]],
      features: [''],
      floorPlanId: [1, Validators.required], // Default to floor plan 1
      positionX: [0, Validators.required],
      positionY: [0, Validators.required],
      width: [45, Validators.required],
      height: [25, Validators.required],
    });
  }

  ngOnInit() {
    this.loadAdminData();
  }

  loadAdminData() {
    this.loadStats();
    this.loadDesks();
    this.loadAllBookings();
  }

  loadStats() {
    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load statistics');
        console.error('Error loading stats:', error);
      }
    });
  }

  loadDesks() {
    this.deskService.getAllDesks().subscribe({
      next: (desks) => {
        this.desks = desks;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load desks');
        console.error('Error loading desks:', error);
      }
    });
  }

  loadAllBookings() {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.allBookings = bookings.slice(0, 50); // Limit to 50 recent bookings
      },
      error: (error) => {
        this.notificationService.showError('Failed to load bookings');
        console.error('Error loading bookings:', error);
      }
    });
  }

  onAddDesk() {
    if (this.addDeskForm.valid) {
      this.isLoading = true;
      
      const deskData = {
        number: this.addDeskForm.get('number')?.value,
        location: this.addDeskForm.get('location')?.value,
        features: this.addDeskForm.get('features')?.value || 'Standard desk',
        floorPlanId: this.addDeskForm.get('floorPlanId')?.value,
  positionX: this.addDeskForm.get('positionX')?.value,
  positionY: this.addDeskForm.get('positionY')?.value,
  width: this.addDeskForm.get('width')?.value,
  height: this.addDeskForm.get('height')?.value,
      };

      this.deskService.createDesk(deskData).subscribe({
        next: (desk) => {
          this.notificationService.showSuccess('Desk added successfully!');
          this.showAddDeskModal = false;
          this.addDeskForm.reset();
          this.loadDesks();
          this.loadStats();
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.showError('Failed to add desk. Please try again.');
          console.error('Error adding desk:', error);
          this.isLoading = false;
        }
      });
    }
  }

  removeDesk(deskId: number) {
    if (confirm('Are you sure you want to remove this desk? This will cancel all future bookings for this desk.')) {
      this.deskService.deleteDesk(deskId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Desk removed successfully');
          this.loadDesks();
          this.loadStats();
          this.loadAllBookings();
        },
        error: (error) => {
          this.notificationService.showError('Failed to remove desk');
          console.error('Error removing desk:', error);
        }
      });
    }
  }

  adminCancelBooking(bookingId: number) {
  // Create a custom dialog for reason input
  const reason = prompt('Please provide a reason for cancellation (optional):');
  
  if (confirm('Are you sure you want to cancel this booking?\n\nThe user will receive an email notification with the cancellation details.')) {
    const adminUserId = this.currentUser?.id || 0;
    
    this.bookingService.adminCancelBooking(bookingId, reason || undefined).subscribe({
      next: () => {
        this.notificationService.showSuccess('Booking cancelled successfully! Email notification sent to user.');
        this.loadAllBookings();
        this.loadStats();
      },
      error: (error) => {
        this.notificationService.showError('Failed to cancel booking. Please try again.');
        console.error('Error cancelling booking:', error);
      }
    });
  }
}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  getBookingStatusClass(booking: Booking): string {
    switch (booking.status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'checkedin': return 'status-checkedin';
      case 'cancelled': return 'status-cancelled';
      case 'autoreleased': return 'status-autoreleased';
      default: return 'status-default';
    }
  }

  canCancelBooking(booking: Booking): boolean {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookingDate >= today && 
           booking.status.toLowerCase() === 'confirmed' && 
           !booking.checkedIn;
  }
}