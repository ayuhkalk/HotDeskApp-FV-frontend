import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Desk } from '../models/desk.model';

@Injectable({
  providedIn: 'root'
})
export class DeskService {
  constructor(private apiService: ApiService) {}

  getAllDesks(): Observable<Desk[]> {
    return this.apiService.get<Desk[]>('/api/desks');
  }

  getAvailableDesks(date: string): Observable<Desk[]> {
    return this.apiService.get<Desk[]>(`/api/desks/availability/${date}`);
  }

  createDesk(desk: Partial<Desk>): Observable<Desk> {
    return this.apiService.post<Desk>('/api/desks', desk);
  }
  getFloorPlanDesks(floorPlanId: number, date: string): Observable<Desk[]> {
    return this.apiService.get<Desk[]>(`/api/floorplan/${floorPlanId}/availability/${date}`);

  }

  updateDesk(id: number, desk: Partial<Desk>): Observable<Desk> {
    return this.apiService.put<Desk>(`/api/desks/${id}`, desk);
  }

  deleteDesk(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/desks/${id}`);
  }
}

