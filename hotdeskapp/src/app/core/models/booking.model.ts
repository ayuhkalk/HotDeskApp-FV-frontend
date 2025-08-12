export interface Booking {
  id: number;
  userId: number;
  userName?: string;
  deskId: number;
  deskNumber?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  checkedIn: boolean;
  type: BookingType;
  endDate?: string;
  createdAt: Date;
}

export enum BookingStatus {
  Confirmed = 'Confirmed',
  CheckedIn = 'CheckedIn',
  Cancelled = 'Cancelled',
  AutoReleased = 'AutoReleased'
}

export enum BookingType {
  Single = 'Single',
  Recurring = 'Recurring'
}