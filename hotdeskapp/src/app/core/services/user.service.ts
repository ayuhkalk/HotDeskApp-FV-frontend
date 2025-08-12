import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User, UserRole, LoginRequest } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5132';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/user/email/${email}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/api/user/login`, credentials);
  }

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (user) {
      localStorage.setItem('currentUserId', user.id.toString());
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('currentUser');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  loadCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const storedUserId = localStorage.getItem('currentUserId');
      const storedUser = localStorage.getItem('currentUser');
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as User;
          this.setCurrentUser(user);
          resolve(user);
          return;
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
      
      if (storedUserId) {
        this.getUserById(parseInt(storedUserId)).subscribe({
          next: (user) => {
            this.setCurrentUser(user);
            resolve(user);
          },
          error: (error) => {
            console.error('Error loading user:', error);
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('currentUser');
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
  }

  // Check if current user is admin (role 1 or 2)
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role >=1 : false; // 1=Admin, 2=SuperAdmin
  }

  // Alternative method using the isAdmin property from backend
  isAdminFromProperty(): boolean {
    const user = this.getCurrentUser();
    return user?.isAdmin || false;
  }

  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role || false;
  }

  // Check if user is employee (role 0)
  isEmployee(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.Employee || false;
  }

  // Check if user is admin (role 1)
  isRegularAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.Admin || false;
  }


  logout(): void {
    this.setCurrentUser(null);
  }}