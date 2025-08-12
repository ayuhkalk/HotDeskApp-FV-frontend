import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Booking } from '../models/booking.model';
import { AuthService } from './auth.service';
export interface CreateBookingDto {
  deskId: number;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(private apiService: ApiService, private authService: AuthService) {}

 getUserBookings(): Observable<Booking[]> {
  const userId = this.authService.getCurrentUserId();
  return this.apiService.get<Booking[]>(`/api/bookings/user?userId=${userId}`);
}

  getAllBookings(): Observable<Booking[]> {
    return this.apiService.get<Booking[]>('/api/bookings');
  }

 createBooking(booking: CreateBookingDto): Observable<Booking> {
  const userId = this.authService.getCurrentUserId();
  return this.apiService.post<Booking>(`/api/bookings?userId=${userId}`, booking);
}


 cancelBooking(id: number): Observable<void> {
  const userId = this.authService.getCurrentUserId();
  return this.apiService.delete<void>(`/api/bookings/${id}?userId=${userId}`);
}

  checkIn(id: number): Observable<void> {
  const userId = this.authService.getCurrentUserId();
  return this.apiService.post<void>(`/api/bookings/${id}/checkin?userId=${userId}`, {});
}
  getCalendarBookings(month: number, year: number): Observable<Booking[]> {
  const userId = this.authService.getCurrentUserId();
  return this.apiService.get<Booking[]>(`/api/bookings/calendar/${month}/${year}?userId=${userId}`);
}
 adminCancelBooking(bookingId: number, reason?: string): Observable<any> {
  const adminUserId = this.authService.getCurrentUserId();
  const payload = {
    adminUserId: adminUserId,
    reason: reason || 'Cancelled by administrator'
  };
  console.log(payload)


  return this.apiService.post<any>(`/api/bookings/${bookingId}/admin-cancel`, payload);
}




}

