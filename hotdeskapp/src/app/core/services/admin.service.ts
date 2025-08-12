import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AdminStats } from '../models/admin-stats.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private apiService: ApiService) {}

  getStats(): Observable<AdminStats> {
    return this.apiService.get<AdminStats>('/api/admin/stats');
  }
}