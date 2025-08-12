import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InteractiveFloorPlanComponent, FloorPlan, Desk } from '../floor-layout/floor-layout';
import { FloorPlanService } from '../core/services/floor-plan.service';
import { DeskService } from '../core/services/desk.service';
import { BookingService } from '../core/services/booking.service';
import { environment } from '../environments/environment';
import { User } from '../core/models/user.model';
import { AuthService } from '../core/services/auth.service';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-floor-plan-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, InteractiveFloorPlanComponent],
  template: `
    <div class="main-content">
      <!-- Full Width Floor Plan Container -->
      <div class="desk-grid-container">
        <div class="desk-grid-header">
          <h2>Book a Desk</h2>
          <div class="controls-group">
            <div class="legend">
              <div class="legend-item available">
                <span>Available</span>
              </div>
              <div class="legend-item booked">
                <span>Booked</span>
              </div>
            </div>
            
            <div class="date-control">
              <label for="date">Date:</label>
              <input 
                type="date" 
                id="date"
                [(ngModel)]="selectedDate"
                class="date-input"
                [min]="minDate"
                (change)="onDateChanged(selectedDate)">
            </div>
          </div>
        </div>

        <div class="desk-grid-wrapper">
          <ng-container *ngIf="selectedFloorPlan && !loading">
            <app-interactive-floor-plan
              [selectedDate]="selectedDate"
              [baseApiUrl]="baseApiUrl"
              (deskSelected)="onDeskSelected($event)"
              (dateChanged)="onDateChanged($event)">
            </app-interactive-floor-plan>
          </ng-container>
          
          <div *ngIf="loading" class="no-desks">
            <div class="loading-spinner">Loading floor plan...</div>
          </div>
          
          <div *ngIf="!selectedFloorPlan && !loading" class="no-desks">
            Floor plan not available
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Booking confirmation modal with all options -->
    <div *ngIf="showBookingModal" class="modal-overlay" (click)="closeBookingModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Confirm Booking</h3>
        
        <!-- Desk Information -->
            <div class="booking-summary">
            <h4>Selected Desk</h4>
            <p><strong>Desk:</strong> {{ selectedDesk?.number }}</p>
            <p><strong>Location:</strong> {{ selectedDesk?.location }}</p>
            <p><strong>Date:</strong> {{ formatDate(selectedDate) }}</p>
            <p><strong>Time:</strong> {{ formatTime(startTime) }} - {{ formatTime(endTime) }}</p>
            <p><strong>Duration:</strong> {{ calculateDuration() }}</p>

            <p *ngIf="selectedDesk?.features"><strong>Features:</strong> {{ selectedDesk?.features }}</p>
          </div>

        <!-- Booking Options Form -->
        <div class="booking-options">
          <div class="form-group">
            <label for="bookingType">Booking Type</label>
            <select id="bookingType" [(ngModel)]="bookingType" class="form-control">
              <option value="Single">Single Day</option>
              <option value="Recurring">Recurring Weekly</option>
            </select>
          </div>

          <div class="form-group" *ngIf="bookingType === 'Recurring'">
            <label for="endDate">End Date (for recurring)</label>
            <input 
              type="date" 
              id="endDate"
              [(ngModel)]="endDate"
              class="form-control"
              [min]="selectedDate">
          </div>

      
        <!-- Booking Rules -->
          <div class="booking-rules-modal">
            <strong>📋 Booking Rules:</strong>
            <ul>
              <li>One booking per day per user</li>
              <li>Check-in required within 30 minutes</li>
              <li>Auto-release after 30 min no-show</li>
              <li>Cancel up to 2 hours before</li>
            </ul>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-cancel" (click)="closeBookingModal()">
            Cancel
          </button>
          <button 
            class="btn btn-confirm" 
            (click)="confirmBooking()"
            [disabled]="bookingInProgress || !isFormValid()">
            {{ bookingInProgress ? 'Booking...' : 'Confirm Booking' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success message -->
    <div *ngIf="bookingSuccess" class="success-message">
      <div class="success-content">
        <span class="success-icon">✓</span>
        Desk {{ bookingSuccess.desk?.number }} booked successfully!
        <button class="close-success" (click)="bookingSuccess = null">×</button>
      </div>
    </div>

    <!-- Error message -->
    <div *ngIf="bookingError" class="error-message">
      <div class="error-content">
        <span class="error-icon">⚠</span>
        {{ bookingError }}
        <button class="close-error" (click)="bookingError = null">×</button>
      </div>
    </div>
  `,
  styles: [`
    /* ===== FULL WIDTH LAYOUT ===== */
    .main-content {
      display: block;
      margin-bottom: 30px;
      height: calc(100vh - 120px);
      min-height: 800px;
      padding: 20px;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-bottom: 20px;
        height: auto;
        min-height: auto;
        padding: 15px;
      }
    }

    @media (max-width: 480px) {
      .main-content {
        margin-bottom: 15px;
        padding: 10px;
      }
    }

    /* ===== SIDEBAR WITH EQUAL HEIGHT ===== */
    .sidebar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .sidebar {
        padding: 20px;
        border-radius: 15px;
        height: auto;
      }
    }

    @media (max-width: 480px) {
      .sidebar {
        padding: 15px;
        border-radius: 12px;
      }
    }

    .sidebar h2 {
      margin-bottom: 20px;
      color: #333;
      flex-shrink: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .booking-form {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow-y: auto;
    }

    /* ===== FORM STYLES ===== */
    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    /* ===== SELECTED DESK ===== */
    .selected-desk {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      text-align: center;
      color: #666;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e9ecef;
    }

    .selected-desk strong {
      color: #333;
      font-size: 16px;
    }

    .selected-desk small {
      color: #666;
      display: block;
      margin-top: 4px;
    }

    .desk-features {
      margin-top: 4px;
    }

    .desk-features small {
      color: #28a745;
      font-style: italic;
    }

    .no-selection {
      color: #999;
      font-style: italic;
    }

    /* ===== BUTTON STYLES ===== */
    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      width: 100%;
      margin-bottom: 15px;
    }

    .btn-primary {
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .btn-cancel {
      background: #f5f5f5;
      color: #666;
    }

    .btn-cancel:hover {
      background: #e0e0e0;
    }

    .btn-confirm {
      background: #4CAF50;
      color: white;
    }

    .btn-confirm:hover:not(:disabled) {
      background: #45a049;
    }

    .btn-confirm:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    /* ===== BOOKING RULES ===== */
    .booking-rules {
      margin-top: 20px;
      padding: 15px;
      background: #e8f4fd;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      flex-shrink: 0;
      border: 1px solid #bee5eb;
    }

    .booking-rules strong {
      color: #0c5460;
      display: block;
      margin-bottom: 8px;
    }

    /* ===== DESK GRID CONTAINER WITH EQUAL HEIGHT ===== */
    .desk-grid-container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .desk-grid-container {
        padding: 20px;
        border-radius: 15px;
        height: auto;
      }
    }

    @media (max-width: 480px) {
      .desk-grid-container {
        padding: 15px;
        border-radius: 12px;
      }
    }

    .desk-grid-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
      flex-shrink: 0;
    }

    .desk-grid-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .controls-group {
      display: flex;
      align-items: center;
      gap: 30px;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .desk-grid-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
        margin-bottom: 15px;
      }
      
      .desk-grid-header h2 {
        font-size: 1.25rem;
      }

      .controls-group {
        width: 100%;
        justify-content: space-between;
        gap: 15px;
      }
    }

    /* ===== LEGEND ===== */
    .legend {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .legend-item.available {
      background: #d4edda;
      color: #155724;
    }

    .legend-item.booked {
      background: #f8d7da;
      color: #721c24;
    }

    .legend-item.occupied {
      background: #fff3cd;
      color: #856404;
    }

    .legend-item::before {
      content: '';
      width: 12px;
      height: 12px;
      border-radius: 2px;
      margin-right: 4px;
    }

    .legend-item.available::before {
      background: #28a745;
    }

    .legend-item.booked::before {
      background: #dc3545;
    }

    .legend-item.occupied::before {
      background: #ffc107;
    }

    /* ===== DATE CONTROL ===== */
    .date-control {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .date-control label {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      white-space: nowrap;
    }

    .date-input {
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      background: white;
      min-width: 150px;
      transition: border-color 0.3s ease;
    }

    .date-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }
     @media (max-width: 768px) {
      .legend {
        gap: 10px;
        justify-content: flex-start;
      }

      .controls-group {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }
     }

    @media (max-width: 768px) {
      .date-control {
        padding: 6px 10px;
      }
      
      .date-input {
        min-width: 120px;
        font-size: 13px;
      }
    }

    /* ===== SCROLLABLE DESK GRID ===== */
    .desk-grid-wrapper {
      flex: 1;
      overflow: auto;
      padding: 0;
      border-radius: 12px;
      background: white;
      border: 1px solid #e9ecef;
      min-height: 500px;
    }

    .desk-grid-wrapper::-webkit-scrollbar {
      width: 8px;
    }

    .desk-grid-wrapper::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
    }

    .desk-grid-wrapper::-webkit-scrollbar-thumb {
      background: rgba(102, 126, 234, 0.3);
      border-radius: 10px;
    }

    .desk-grid-wrapper::-webkit-scrollbar-thumb:hover {
      background: rgba(102, 126, 234, 0.5);
    }

    /* ===== NO DESKS / LOADING ===== */
    .no-desks {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      flex-direction: column;
    }

    .loading-spinner {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      color: #666;
    }

    /* ===== MODAL STYLES ===== */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .booking-details {
      margin: 16px 0;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .desk-info-section h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 1rem;
      font-weight: 600;
    }

    .booking-details p {
      margin: 8px 0;
      font-size: 14px;
    }

    .booking-details strong {
      color: #333;
      font-weight: 600;
    }

    /* ===== BOOKING OPTIONS FORM ===== */
    .booking-options {
      margin: 20px 0;
    }

    .booking-options .form-group {
      margin-bottom: 16px;
    }

    .booking-options label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }

    .booking-options .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      background: white;
      transition: border-color 0.3s ease;
    }

    .booking-options .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    /* ===== BOOKING SUMMARY ===== */
    .booking-summary {
      background: #e8f4fd;
      border: 1px solid #bee5eb;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }

    .booking-summary h4 {
      margin: 0 0 12px 0;
      color: #0c5460;
      font-size: 1rem;
      font-weight: 600;
    }

    .booking-summary p {
      margin: 6px 0;
      font-size: 14px;
      color: #0c5460;
    }

    .booking-summary strong {
      font-weight: 600;
    }

    /* ===== BOOKING RULES IN MODAL ===== */
    .booking-rules-modal {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }

    .booking-rules-modal strong {
      color: #856404;
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .booking-rules-modal ul {
      margin: 0;
      padding-left: 20px;
      color: #856404;
    }

    .booking-rules-modal li {
      margin: 4px 0;
      font-size: 13px;
      line-height: 1.4;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }

    .modal-actions .btn {
      margin-bottom: 0;
      width: auto;
      padding: 10px 20px;
    }

    /* ===== NOTIFICATION MESSAGES ===== */
    .success-message, .error-message {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1001;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .success-message {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }

    .error-message {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .success-content, .error-content {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .success-icon, .error-icon {
      font-weight: bold;
      font-size: 18px;
    }

    .close-success, .close-error {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      margin-left: auto;
      opacity: 0.7;
      padding: 0;
      line-height: 1;
    }

    .close-success:hover, .close-error:hover {
      opacity: 1;
    }

    /* ===== RESPONSIVE MOBILE ===== */
    @media (max-width: 768px) {
      .modal-content {
        margin: 20px;
        width: calc(100% - 40px);
        padding: 20px;
      }
      
      .modal-actions {
        flex-direction: column;
        gap: 8px;
      }
      
      .modal-actions .btn {
        width: 100%;
      }

      .success-message, .error-message {
        left: 10px;
        right: 10px;
        top: 10px;
        max-width: none;
      }
    }

    @media (max-width: 480px) {
      .booking-details p {
        font-size: 13px;
      }
      
      .modal-content h3 {
        font-size: 1.1rem;
      }
    }
  `]
})
export class FloorPlanBookingComponent implements OnInit {
  selectedFloorPlan: FloorPlan | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedDesk: Desk | null = null;
  showBookingModal = false;
  bookingInProgress = false;
  bookingSuccess: any = null;
  bookingError: string | null = null;
  loading = false;
  public baseApiUrl = environment.apiUrl;
  
  // Booking form properties
  bookingType = 'Single';
  endDate: string = '';
  startTime: string = '07:00';
  endTime: string = '16:00';
  
  // Date validation
  minDate: string;
  
  // Maximum display dimensions for responsive floor plan
  maxDisplayWidth = 1200;
  maxDisplayHeight = 900;

  @Input() currentUser: User | null = null;

  constructor(
    private floorPlanService: FloorPlanService,
    private deskService: DeskService,
    private bookingService: BookingService,
    private authService: AuthService, 
    private userService: UserService
  ) {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    // Calculate optimal display size
    this.calculateOptimalDisplaySize();
  }

  ngOnInit() {
    this.loadFloorPlan1();
    
    // Listen for window resize
    window.addEventListener('resize', () => {
      this.calculateOptimalDisplaySize();
    });
  }
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } 

  private calculateOptimalDisplaySize() {
    // Get available space for the floor plan
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Account for header, padding, and other UI elements
    const availableWidth = viewportWidth - 80; // 40px padding on each side
    const availableHeight = Math.max(viewportHeight - 200, 600); // Ensure minimum height
    
    // Original floor plan dimensions (UPDATE THESE TO MATCH YOUR NEW IMAGE)
    const originalWidth = 1920;  // Changed from 1638
    const originalHeight = 1080; // Changed from 1165
    
    // Calculate scale to fill the width completely
    const scaleX = availableWidth / originalWidth;
    const scaleY = availableHeight / originalHeight;
    
    // Use the scale that fills the width, allowing height to scroll if needed
    const finalScale = Math.max(scaleX, 0.6); // Minimum 60% scale for readability
    
    this.maxDisplayWidth = Math.floor(originalWidth * finalScale);
    this.maxDisplayHeight = Math.floor(originalHeight * finalScale);
    
    console.log('📐 Display size calculated:', {
      viewport: { width: viewportWidth, height: viewportHeight },
      available: { width: availableWidth, height: availableHeight },
      scale: finalScale,
      display: { width: this.maxDisplayWidth, height: this.maxDisplayHeight }
    });
  }

  loadFloorPlan1() {
    this.loading = true;
    this.floorPlanService.getFloorPlanWithDesks(1, this.selectedDate).subscribe({
      next: (floorPlan) => {
        console.log('✅ Floor plan received from API:', floorPlan);
        
        // Override the image dimensions to our calculated display size
        floorPlan.imageWidth = this.maxDisplayWidth;
        floorPlan.imageHeight = this.maxDisplayHeight;
        
        this.selectedFloorPlan = floorPlan;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load floor plan:', err);
        this.bookingError = 'Failed to load floor plan data';
        this.loading = false;
      }
    });
  }

  onDateChanged(date: string) {
    this.selectedDate = date;
    this.selectedDesk = null; // Reset selected desk when date changes
    this.loadFloorPlan1(); 
  }

  onDeskSelected(desk: Desk) {
    console.log('🖱️ Desk selected:', desk);
    if (desk.status === 'Available') {
      this.selectedDesk = desk;
      this.showBookingModal = true; // Auto-open booking modal when desk is clicked
    }
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedDesk = null;
    this.bookingError = null;
    // Reset form values
    this.bookingType = 'Single';
    this.endDate = '';
    this.startTime = '07:00';
    this.endTime = '16:00';
  }

  confirmBooking() {
    if (!this.selectedDesk || !this.currentUser || !this.isFormValid()) {
      this.bookingError = 'Missing required information for booking';
      return;
    }

    this.bookingInProgress = true;
    this.bookingError = null;

const bookingData: any = {
  deskId: this.selectedDesk.id,
  date: this.selectedDate,
  startTime: this.startTime,
  endTime: this.endTime,
  type: this.bookingType
};

if (this.bookingType === 'Recurring' && this.endDate) {
  bookingData.endDate = this.endDate;
}


    console.log('📋 Submitting booking:', bookingData);

    this.bookingService.createBooking(bookingData).subscribe({
      next: (booking) => {
        console.log('✅ Booking successful:', booking);
        this.bookingSuccess = { desk: this.selectedDesk };
        this.closeBookingModal();
        this.bookingInProgress = false;
        
        // Refresh the floor plan to show updated desk status
        this.loadFloorPlan1();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.bookingSuccess = null;
        }, 5000);
      },
      error: (error) => {
        console.error('❌ Booking error:', error);
        this.bookingError = error.error?.message || 'Failed to book desk';
        this.bookingInProgress = false;
      }
    });
  }

  // Form validation
  isFormValid(): boolean {
    if (!this.selectedDate || !this.startTime || !this.endTime) {
      return false;
    }
    
    if (this.bookingType === 'Recurring' && !this.endDate) {
      return false;
    }
    
    // Check if end time is after start time
    if (this.startTime >= this.endTime) {
      return false;
    }
    
    return true;
  }

  // Time formatting helpers
  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  calculateDuration(): string {
    if (!this.startTime || !this.endTime) return '';
    
    const start = new Date(`2000-01-01T${this.startTime}:00`);
    const end = new Date(`2000-01-01T${this.endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const minutes = Math.round(diffMs / (1000 * 60));
      return `${minutes} minutes`;
    } else if (diffHours === 1) {
      return '1 hour';
    } else {
      return `${diffHours} hours`;
    }
  }

  ngOnDestroy() {
    // Clean up event listener
    window.removeEventListener('resize', this.calculateOptimalDisplaySize);
  }
}