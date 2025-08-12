import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FloorPlan {
  id: number;
  name: string;
  imagePath: string;
  floor: string;
  zone: string;
  imageWidth: number;
  imageHeight: number;
  isActive: boolean;
  createdAt: string;
  desks: Desk[];
}

export interface Desk {
  id: number;
  number: string;
  location: string;
  features: string;
  isActive: boolean;
  floorPlanId: number;
  floorPlanName: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  status: 'Available' | 'Booked' | 'Occupied';
  bookedByUserId?: number;
  bookedByUserName?: string;
}

export interface CreateFloorPlanDto {
  name: string;
  floor: string;
  zone: string;
  imageFile: File;
}

export interface CreateDeskDto {
  number: string;
  location: string;
  features: string;
  floorPlanId: number;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class FloorPlanService {
  private apiUrl = `${environment.apiUrl}/api/floorplans`;

  constructor(private http: HttpClient) {}

  getAllFloorPlans(): Observable<FloorPlan[]> {
    return this.http.get<FloorPlan[]>(this.apiUrl);
  }

  getFloorPlan(id: number): Observable<FloorPlan> {
    return this.http.get<FloorPlan>(`${this.apiUrl}/${id}`);
  }

  getFloorPlanWithDesks(id: number, date: string): Observable<FloorPlan> {
    const params = new HttpParams().set('date', date);
    return this.http.get<FloorPlan>(`${this.apiUrl}/${id}/desks/${date}`);
  }

  createFloorPlan(dto: CreateFloorPlanDto): Observable<FloorPlan> {
    const formData = new FormData();
    formData.append('name', dto.name);
    formData.append('floor', dto.floor);
    formData.append('zone', dto.zone);
    formData.append('imageFile', dto.imageFile);

    return this.http.post<FloorPlan>(this.apiUrl, formData);
  }

  deleteFloorPlan(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getFloorPlanImageUrl(id: number): string {
    return `${this.apiUrl}/${id}/image`;
  }
}
