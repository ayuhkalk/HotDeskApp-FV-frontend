export interface DashboardData {
  totalDesks: number;
  bookedDesks: number;
  availableDesks: number;
  checkedInToday: number;
  noShowsToday: number;
  utilizationRate: number;
  floorUtilization: FloorUtilization[];
  bookingTrends: BookingTrend[];
}

export interface FloorUtilization {
  floorId: number;
  floorName: string;
  totalDesks: number;
  bookedDesks: number;
  utilizationRate: number;
}

export interface BookingTrend {
  date: Date;
  totalBookings: number;
  checkIns: number;
  noShows: number;
}