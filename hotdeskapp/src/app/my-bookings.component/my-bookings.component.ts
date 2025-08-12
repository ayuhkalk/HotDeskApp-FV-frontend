import { Component, Input, OnInit } from '@angular/core';
import { BookingService } from '../core/services/booking.service';
import { NotificationService } from '../core/services/notification.service';
import { Booking } from '../core/models/booking.model';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../core/models/user.model';
@Component({
  selector: 'app-my-bookings',
  template: `
    <div class="bookings-section">
      <h2>My Bookings</h2>
      <div class="table-container">
        <table class="bookings-table">
          <thead>
            <tr>
              <th>Desk</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let booking of bookings">
              <td><strong>{{ booking.deskNumber }}</strong></td>
              <td>{{ formatDate(booking.date) }}</td>
              <td>{{ booking.startTime }} - {{ booking.endTime }}</td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(booking)">
                  {{ getStatusText(booking) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    *ngIf="canCancel(booking)"
                    class="btn btn-danger btn-sm"
                    (click)="cancelBooking(booking.id)">
                    Cancel
                  </button>
                  <button 
                    *ngIf="canCheckIn(booking)"
                    class="btn btn-success btn-sm"
                    (click)="checkIn(booking.id)">
                    Check-in
                  </button>
                  <span *ngIf="!canCancel(booking) && !canCheckIn(booking)" class="no-action">-</span>
                </div>
              </td>
            </tr>
            <tr *ngIf="bookings.length === 0">
              <td colspan="5" class="no-bookings">No bookings found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./my-bookings.component.css'],
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule]
})
export class MyBookingsComponent implements OnInit {
  @Input() currentUser!: User | null;

  bookings: Booking[] = [];
  isLoading = false;

  constructor(
    private bookingService: BookingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.bookingService.getUserBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load bookings');
        console.error('Error loading bookings:', error);
        this.isLoading = false;
      }
    });
  }

  cancelBooking(bookingId: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Booking cancelled successfully');
          this.loadBookings();
        },
        error: (error) => {
          this.notificationService.showError('Failed to cancel booking');
          console.error('Error cancelling booking:', error);
        }
      });
    }
  }

  checkIn(bookingId: number) {
    this.bookingService.checkIn(bookingId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Checked in successfully!');
        this.loadBookings();
      },
      error: (error) => {
        this.notificationService.showError('Failed to check in');
        console.error('Error checking in:', error);
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  getStatusClass(booking: Booking): string {
    if (booking.checkedIn) return 'status-success';
    if (this.isToday(booking.date)) return 'status-warning';
    if (this.isPast(booking.date)) return 'status-secondary';
    return 'status-primary';
  }

  getStatusText(booking: Booking): string {
    if (booking.checkedIn) return 'Checked In';
    if (this.isToday(booking.date)) return 'Pending Check-in';
    if (this.isPast(booking.date)) return 'Completed';
    return 'Confirmed';
  }

  canCancel(booking: Booking): boolean {
    return !this.isPast(booking.date) && !booking.checkedIn;
  }

  canCheckIn(booking: Booking): boolean {
    return this.isToday(booking.date) && !booking.checkedIn;
  }

  private isToday(date: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  }

  private isPast(date: string): boolean {
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate < today;
  }
}