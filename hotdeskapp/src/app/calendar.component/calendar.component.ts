import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BookingService } from '../core/services/booking.service';
import { Booking } from '../core/models/booking.model';
import { CommonModule } from '@angular/common';
import { User } from '../core/models/user.model';
@Component({
  selector: 'app-calendar',
  template: `
    <div class="calendar-view">
      <div class="calendar-header">
        <h2>Calendar View</h2>
        <div class="calendar-navigation">
          <button class="btn btn-secondary" (click)="previousMonth()">←</button>
          <span class="current-month">{{ getCurrentMonthYear() }}</span>
          <button class="btn btn-secondary" (click)="nextMonth()">→</button>
        </div>
      </div>
      
      <div class="calendar-grid">
        <div class="calendar-day-header" *ngFor="let day of dayHeaders">
          {{ day }}
        </div>
        
        <div 
          *ngFor="let day of calendarDays"
          class="calendar-day"
          [class.has-booking]="day.hasBooking"
          [class.selected]="day.isToday"
          [class.other-month]="day.isOtherMonth"
          (click)="onDayClick(day)">
          <span class="day-number">{{ day.day }}</span>
          <div class="booking-indicator" *ngIf="day.hasBooking">
            <span class="booking-count">{{ day.bookingCount }}</span>
          </div>
        </div>
      </div>
      
      <div class="calendar-legend">
        <div class="legend-item">
          <span class="legend-color has-booking"></span>
          <span>Has Booking</span>
        </div>
        <div class="legend-item">
          <span class="legend-color selected"></span>
          <span>Today</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./calendar.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CalendarComponent implements OnInit {
  @Input() currentUser!: User | null;
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  bookings: Booking[] = [];
  
  @Output() dateSelected = new EventEmitter<string>();


  constructor(
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.loadCalendar();
  }

  loadCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    this.bookingService.getCalendarBookings(month + 1, year).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.generateCalendarDays();
      },
      error: (error) => {
        console.error('Error loading calendar bookings:', error);
        this.generateCalendarDays(); // Generate calendar without bookings
      }
    });
  }

  generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();
    
    this.calendarDays = [];
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const daysFromPrevMonth = startingDayOfWeek;
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const day = prevMonth.getDate() - i + 1;
      this.calendarDays.push({
        day: day,
        date: new Date(year, month - 1, day),
        hasBooking: false,
        bookingCount: 0,
        isToday: false,
        isOtherMonth: true
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const dayBookings = this.bookings.filter(b => b.date === dateString);
      
      this.calendarDays.push({
        day: day,
        date: date,
        hasBooking: dayBookings.length > 0,
        bookingCount: dayBookings.length,
        isToday: this.isSameDate(date, today),
        isOtherMonth: false
      });
    }
    
    // Add days from next month to fill the calendar
    const remainingDays = 42 - this.calendarDays.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      this.calendarDays.push({
        day: day,
        date: new Date(year, month + 1, day),
        hasBooking: false,
        bookingCount: 0,
        isToday: false,
        isOtherMonth: true
      });
    }
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.loadCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.loadCalendar();
  }

  getCurrentMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  onDayClick(day: CalendarDay) {
    if (!day.isOtherMonth) {
      // Navigate to booking page with selected date
      const dateString = day.date.toISOString().split('T')[0];
      console.log('Calendar date clicked:', dateString); 
      this.dateSelected.emit(dateString);
      };
    }
  

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}

interface CalendarDay {
  day: number;
  date: Date;
  hasBooking: boolean;
  bookingCount: number;
  isToday: boolean;
  isOtherMonth: boolean;
}
