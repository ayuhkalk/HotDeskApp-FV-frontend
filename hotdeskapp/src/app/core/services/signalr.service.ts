import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private connectionState = new BehaviorSubject<signalR.HubConnectionState>(signalR.HubConnectionState.Disconnected);
  
  constructor() { }
  
  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/booking`, {
      })
      .build();
    
    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connection started');
        this.connectionState.next(signalR.HubConnectionState.Connected);
      })
      .catch(err => {
        console.error('Error starting SignalR connection:', err);
        this.connectionState.next(signalR.HubConnectionState.Disconnected);
      });
    
    this.hubConnection.onclose(() => {
      this.connectionState.next(signalR.HubConnectionState.Disconnected);
    });
  }
  
  public getConnectionState(): Observable<signalR.HubConnectionState> {
    return this.connectionState.asObservable();
  }
  
  public joinFloorGroup(floorId: number): void {
    this.hubConnection.invoke('JoinFloorGroup', floorId);
  }
  
  public leaveFloorGroup(floorId: number): void {
    this.hubConnection.invoke('LeaveFloorGroup', floorId);
  }
  
  public onBookingCreated(callback: (booking: any) => void): void {
    this.hubConnection.on('BookingCreated', callback);
  }
  
  public onBookingCheckedIn(callback: (booking: any) => void): void {
    this.hubConnection.on('BookingCheckedIn', callback);
  }
  
  public onBookingNoShow(callback: (bookingId: string) => void): void {
    this.hubConnection.on('BookingNoShow', callback);
  }
  
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}