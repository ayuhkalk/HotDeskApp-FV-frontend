import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../core/models/user.model';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface Desk {
  id: number;
  number: string;
  location: string;
  features: string;
  isActive: boolean;
  floorPlanId: number;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  status: 'Available' | 'Booked' | 'Occupied';
  bookedByUserId?: number;
  bookedByUserName?: string;
}

export interface FloorPlan {
  id: number;
  name: string;
  imagePath: string;
  floor: string;
  zone: string;
  imageWidth: number;
  imageHeight: number;
  isActive: boolean;
  desks: Desk[];
}

@Component({
  selector: 'app-interactive-floor-plan',
  standalone: true,
  imports: [CommonModule],
  template: `      
      <div class="floor-plan-wrapper" #floorPlanWrapper>
        <div class="floor-plan-canvas" 
             [style.width.px]="canvasWidth" 
             [style.height.px]="canvasHeight">
          
          <!-- Floor plan background image -->
          <img 
            #floorPlanImage
            [src]="getImageUrl()" 
            alt="Floor Plan"
            class="floor-plan-image"
            (load)="onImageLoad()"
            (error)="onImageError()"
            [style.width.px]="canvasWidth"
            [style.height.px]="canvasHeight">
          
          <!-- Desk overlays -->
          <div 
            *ngFor="let desk of floorPlan?.desks" 
            class="desk-overlay"
            [class.available]="desk.status === 'Available'"
            [class.booked]="desk.status === 'Booked'"
            [class.occupied]="desk.status === 'Occupied'"
            [class.autoreleased]="desk.status?.toLowerCase() === 'autoreleased'"
            [class.confirmed]="desk.status?.toLowerCase() === 'confirmed'"
            [style.left.%]="desk.positionX"
            [style.top.%]="desk.positionY"
            [style.width.px]="desk.width"
            [style.height.px]="desk.height"
            [title]="getDeskTooltip(desk)"
            (click)="onDeskClick(desk)"
            [class.clickable]="isDeskClickable(desk)">
            
            <div class="desk-number">{{ desk.number }}</div>
            <div class="desk-status-icon" *ngIf="desk.status !== 'Available'">
              <span *ngIf="desk.status === 'Booked'">📅</span>
              <span *ngIf="desk.status === 'Occupied'">👤</span>
            </div>
          </div>
          
          <!-- Admin mode: Click to add desk -->
          <div 
            *ngIf="showAddDeskIndicator"
            class="add-desk-indicator"
            [style.left.px]="newDeskPosition.x"
            [style.top.px]="newDeskPosition.y">
            <div class="add-desk-preview">
              <span>New Desk</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Loading state -->
      <div *ngIf="loading" class="loading-overlay">
        <div class="loading-spinner">Loading floor plan...</div>
      </div>
      
      <!-- Error state -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
  `,
  styles: [`
    .floor-plan-container {
      position: relative;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
      overflow: hidden;
    }

    .floor-plan-header {
      padding: 0px;
      background: white;
      border-bottom: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .floor-plan-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.2em;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .legend {
      display: flex;
      gap:16px;
      align-items: center;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9em;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      border: 1px solid #ccc;
    }

    .legend-color.available {
      background-color: #4CAF50;
    }

    .legend-color.booked {
      background-color: #f44336;
    }

    .legend-color.occupied {
      background-color: #ff9800;
    }

    .date-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .date-input {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9em;
    }

    .floor-plan-wrapper {
      position: relative;
      overflow: auto;
      background: #f0f0f0;
      max-height: 600px;
    }

    .floor-plan-canvas {
      position: relative;
      margin: 20px auto;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .floor-plan-image {
      display: block;
      max-width: 100%;
      height: auto;
    }

    .desk-overlay {
      position: absolute;
      border: 2px solid #333;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 0.8em;
      font-weight: bold;
      color: white;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      transition: all 0.3s ease;
      cursor: default;
      z-index: 10;
    }

    .desk-overlay.available {
      background-color: rgba(76, 175, 80, 0.8);
      border-color: #4CAF50;
    }

    .desk-overlay.booked {
      background-color: rgba(244, 67, 54, 0.8);
      border-color: #f44336;
    }

    .desk-overlay.occupied {
      background-color: rgba(255, 152, 0, 0.8);
      border-color: #ff9800;
    }
    .desk-overlay.autobooked,
    .desk-overlay.autoreleased{
      background-color: rgba(244, 67, 54, 0.8); /* same red */
      border-color: #f44336;}

    .desk-overlay.confirmed{
       background-color: rgba(244, 67, 54, 0.8); /* same red */
      border-color: #f44336;}


    .desk-overlay.clickable {
      cursor: pointer;
    }

    .desk-overlay.clickable:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 20;
    }

    .desk-overlay.available.clickable:hover {
      background-color: rgba(76, 175, 80, 0.95);
    }

    .desk-number {
      font-size: 0.75em;
      margin-bottom: 2px;
    }

    .desk-status-icon {
      font-size: 1.2em;
      line-height: 1;
    }

    .admin-mode .desk-overlay {
      border-style: dashed;
    }

    .admin-mode .floor-plan-canvas {
      cursor: crosshair;
    }

    .add-desk-indicator {
      position: absolute;
      z-index: 30;
      pointer-events: none;
    }

    .add-desk-preview {
      width: 60px;
      height: 40px;
      background-color: rgba(33, 150, 243, 0.8);
      border: 2px dashed #2196F3;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7em;
      color: white;
      font-weight: bold;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .loading-spinner {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .error-message {
      padding: 20px;
      text-align: center;
      color: #f44336;
      background: #ffebee;
      margin: 20px;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .floor-plan-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .controls {
        justify-content: space-between;
      }
      
      .legend {
        flex-wrap: wrap;
      }
    }
  `]
})
export class InteractiveFloorPlanComponent implements OnInit, AfterViewInit {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;
  floorPlan: FloorPlan | null = null;
  @Input() selectedDate: string = new Date().toISOString().split('T')[0];
  @Input() baseApiUrl: string = environment.apiUrl;
  @Input() currentUser: User | null = null;
  
  @Output() deskSelected = new EventEmitter<Desk>();
  @Output() dateChanged = new EventEmitter<string>();
  @Output() deskPositionSelected = new EventEmitter<{x: number, y: number, percentX: number, percentY: number}>();
  
  @ViewChild('floorPlanWrapper') floorPlanWrapper!: ElementRef;
  @ViewChild('floorPlanImage') floorPlanImage!: ElementRef;

  loading = false;
  error: string | null = null;
  canvasWidth = 800;
  canvasHeight = 600;
  showAddDeskIndicator = false;
  newDeskPosition = { x: 0, y: 0 };

  ngOnInit() {
  this.loadFloorPlan(1, this.selectedDate);
  }

  ngAfterViewInit() {
  
  }
  loadFloorPlan(id: number, date: string) {
  this.loading = true;
  const url = `${this.apiUrl}/api/floorplans/${id}/desks/${date}`;

  this.http.get<FloorPlan>(url).subscribe({
    next: (data) => {
      console.log('📥 FloorPlan loaded:', data);
      this.floorPlan = data;
      this.canvasWidth = this.floorPlan.imageWidth || 800;
      this.canvasHeight = this.floorPlan.imageHeight || 600;
      this.loading = false;
      console.log('📋 Desk statuses:');
      this.floorPlan.desks.forEach(d => console.log(`Desk ${d.number} - status: "${d.status}"`));

    },
    error: (err) => {
      console.error('❌ Error loading floor plan in component:', err);
      this.error = 'Could not load floor plan.';
      this.loading = false;
    }
  });
}
  setupAdminMode() {
    const canvas = this.floorPlanWrapper?.nativeElement?.querySelector('.floor-plan-canvas');
    if (canvas) {
      canvas.addEventListener('mousemove', (e: MouseEvent) => this.onCanvasMouseMove(e));
      canvas.addEventListener('click', (e: MouseEvent) => this.onCanvasClick(e));
      canvas.addEventListener('mouseleave', () => this.showAddDeskIndicator = false);
    }
  }

  onCanvasMouseMove(event: MouseEvent) {
    
    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    
    this.newDeskPosition.x = event.clientX - rect.left - 30; // Center the preview
    this.newDeskPosition.y = event.clientY - rect.top - 20;
    this.showAddDeskIndicator = true;
  }

  onCanvasClick(event: MouseEvent) {
    
    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const percentX = (x / this.canvasWidth) * 100;
    const percentY = (y / this.canvasHeight) * 100;
    
    this.deskPositionSelected.emit({ x, y, percentX, percentY });
  }

  onImageLoad() {
    this.loading = false;
    this.error = null;
  }

 onImageError() {
  this.loading = false;
  this.error = 'Failed to load floor plan image';

  console.error('❌ Image load failed.');
  console.log('floorPlan:', this.floorPlan);
  console.log('floorPlan.imagePath:', this.floorPlan?.imagePath);
  console.log('baseApiUrl:', this.baseApiUrl);
  console.log('Generated URL:', this.getImageUrl());
}


  getImageUrl(): string {
  if (!this.floorPlan?.imagePath) {
    console.log('🔴 floorPlan or imagePath is missing:', this.floorPlan);
    return '';
  }

  if (this.floorPlan.imagePath.startsWith('http')) {
    console.log('🌐 Using direct imagePath URL:', this.floorPlan.imagePath);
    return this.floorPlan.imagePath;
  }

  const generatedUrl = `${this.baseApiUrl}/api/floorplans/${this.floorPlan.id}/image`;
  return generatedUrl;
}


  getDeskTooltip(desk: Desk): string {
    let tooltip = `${desk.number} - ${desk.location}`;
    if (desk.features) {
      tooltip += `\nFeatures: ${desk.features}`;
    }
    
    switch (desk.status) {
      case 'Available':
        tooltip += '\nClick to book this desk';
        break;
      case 'Booked':
        tooltip += `\nBooked by: ${desk.bookedByUserName || 'Unknown'}`;
        break;
      case 'Occupied':
        tooltip += '\nCurrently occupied';
        break;
    }
    
    return tooltip;
  }

  isDeskClickable(desk: Desk): boolean {
    return desk.status === 'Available' && desk.isActive;
  }

  onDeskClick(desk: Desk) {
    if (this.isDeskClickable(desk)) {
      this.deskSelected.emit(desk);
    }
  }

  onDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.dateChanged.emit(target.value);
  }
}
