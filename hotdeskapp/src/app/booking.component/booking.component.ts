import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeskService } from '../core/services/desk.service';
import { BookingService } from '../core/services/booking.service';
import { NotificationService } from '../core/services/notification.service';
import { Desk } from '../core/models/desk.model';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeskCardComponent } from '../desk-card.component/desk-card.component';
import { User } from '../core/models/user.model';
@Component({
  selector: 'app-booking',
  template: `
    <div class="main-content">
      <!-- Sidebar with Booking Form -->
      <div class="sidebar">
        <h2>Book a Desk</h2>
        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="booking-form">
          <div class="form-group">
            <label for="date">Select Date</label>
            <input 
              type="date" 
              id="date"
              formControlName="date"
              class="form-control"
              [min]="minDate"
              (change)="onDateChange()">
          </div>
          
          <div class="form-group">
            <label for="type">Booking Type</label>
            <select id="type" formControlName="type" class="form-control">
              <option value="Single">Single Day</option>
              <option value="Recurring">Recurring Weekly</option>
            </select>
          </div>

          <div class="form-group" *ngIf="bookingForm.get('type')?.value === 'Recurring'">
            <label for="endDate">End Date (for recurring)</label>
            <input 
              type="date" 
              id="endDate"
              formControlName="endDate"
              class="form-control">
          </div>

          <div class="form-group">
            <label>Selected Desk</label>
            <div class="selected-desk">
              <div *ngIf="selectedDesk; else noSelection">
                <strong>{{ selectedDesk.number }}</strong><br>
                <small>{{ selectedDesk.location }}</small>
              </div>
              <ng-template #noSelection>
                <span class="no-selection">No desk selected</span>
              </ng-template>
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="!selectedDesk || bookingForm.invalid || isLoading">
            {{ isLoading ? 'Booking...' : 'Book Selected Desk' }}
          </button>

          <div class="booking-rules">
            <strong>📋 Booking Rules:</strong><br>
            • One booking per day per user<br>
            • Check-in required within 30 minutes<br>
            • Auto-release after 30 min no-show<br>
            • Cancel up to 2 hours before
          </div>
        </form>
      </div>

      <!-- Desk Grid -->
      <div class="desk-grid-container">
        <div class="desk-grid-header">
          <h2>Available Desks</h2>
          <div class="legend">
            <span class="legend-item available"></span>
            <span class="legend-item booked"></span>
            <span class="legend-item selected"></span>
          </div>
        </div>

        <div class="desk-grid-wrapper"> 
        <div class="desk-grid">
          <app-desk-card
            *ngFor="let desk of availableDesks"
            [desk]="desk"
            [isSelected]="selectedDesk?.id === desk.id"
            (selected)="onDeskSelected($event)">
          </app-desk-card>
        </div>
        <div *ngIf="availableDesks.length === 0" class="no-desks">
          No desks available for the selected date
        </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./booking.component.css'],
  standalone:true,
  imports: [ReactiveFormsModule, CommonModule, DeskCardComponent]
})
export class BookingComponent implements OnInit {
  @Input() selectedDate: string | null = null;
  @Input() currentUser!: User | null;
  

  bookingForm: FormGroup;
  availableDesks: Desk[] = [];
  selectedDesk: Desk | null = null;
  isLoading = false;
  minDate: string;

  constructor(
    private fb: FormBuilder,
    private deskService: DeskService,
    private bookingService: BookingService,
    private notificationService: NotificationService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    this.bookingForm = this.fb.group({
      date: [this.minDate, Validators.required],
      type: ['Single', Validators.required],
      endDate: ['']
    });
  }

  ngOnInit() {
    this.loadAvailableDesks();
  }

  ngOnChanges(changes: SimpleChanges) {
  console.log('BookingComponent received date:', this.selectedDate); 
  if (changes['selectedDate'] && this.selectedDate && this.bookingForm) {
    console.log('Updating form with date:', this.selectedDate); 
    this.bookingForm.patchValue({ 
      date: this.selectedDate });
      // Reset selected desk and reload
      this.selectedDesk = null; 
      this.loadAvailableDesks();
    }
  }



  onDateChange() {
    this.selectedDesk = null;
    this.loadAvailableDesks();
  }

  loadAvailableDesks() {
    const date = this.bookingForm.get('date')?.value;
    console.log('🔥 loadAvailableDesks called with date from form:', date);

    if (date) {
      this.deskService.getAvailableDesks(date).subscribe({
        next: (desks) => {
          this.availableDesks = desks.filter(d => d.status === 'Available');
        },
        error: (error) => {
          this.notificationService.showError('Failed to load available desks');
          console.error('Error loading desks:', error);
        }
      });
    }
  }

  onDeskSelected(desk: Desk) {
    this.selectedDesk = desk;
  }

  onSubmit() {
    if (this.bookingForm.valid && this.selectedDesk) {
      this.isLoading = true;
      
      const bookingData = {
        deskId: this.selectedDesk.id,
        date: this.bookingForm.get('date')?.value,
        startTime: '07:00',
        endTime: '16:00',
        type: this.bookingForm.get('type')?.value,
        endDate: this.bookingForm.get('endDate')?.value || null
      };

      this.bookingService.createBooking(bookingData).subscribe({
        next: (booking) => {
          this.notificationService.showSuccess('Desk booked successfully!');
          this.selectedDesk = null;
          this.loadAvailableDesks();
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.showError('Failed to book desk. Please try again.');
          console.error('Booking error:', error);
          this.isLoading = false;
        }
      });
    }
  }
}


