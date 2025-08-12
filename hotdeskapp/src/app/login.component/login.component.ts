import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { LoginRequest } from '../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-section">
            <div class="logo-icon">HD</div>
            <div>
              <h1>HotDesk Pro</h1>
              <p>Sign in to book your workspace</p>
            </div>
          </div>
        </div>
        
        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="credentials.email"
              required
              email
              class="form-input"
              [class.error]="emailError"
              placeholder="Enter your email address"
              autocomplete="email"
            >
            <div class="error-message" *ngIf="emailError">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Please enter a valid email address
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="password-input-container">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                [(ngModel)]="credentials.password"
                required
                class="form-input password-input"
                [class.error]="passwordError"
                placeholder="Enter your password"
                autocomplete="current-password"
              >
              <button
                type="button"
                class="password-toggle"
                (click)="togglePasswordVisibility()"
                tabindex="-1"
                [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
              >
                <svg *ngIf="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <div class="error-message" *ngIf="passwordError">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Password is required
            </div>
          </div>

          <div class="login-error" *ngIf="loginError">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {{ loginError }}
          </div>
          

          <button
            type="submit"
            class="login-button"
            [disabled]="isLoading || !loginForm.form.valid">
            <div class="loading-spinner" *ngIf="isLoading"></div>
            <svg *ngIf="!isLoading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10,17 15,12 10,7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <!--<div class="demo-section">
          <div class="demo-header">
            <div class="divider">
              <span>Demo Accounts</span>
            </div>
          </div>
          
          <div class="demo-credentials">
            <div class="demo-user" (click)="setDemoCredentials('admin')">
              <div class="demo-avatar admin">A</div>
              <div class="demo-info">
                <div class="demo-name">Admin User</div>
                <div class="demo-email">test&#64;example.com</div>
                <div class="demo-role admin">Administrator</div>
              </div>
              <div class="demo-action">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </div>
            </div>
            
            <div class="demo-user" (click)="setDemoCredentials('employee')">
              <div class="demo-avatar employee">J</div>
              <div class="demo-info">
                <div class="demo-name">Testing</div>
                <div class="demo-email">john.doe&#64;company.com</div>
                <div class="demo-role employee">Employee</div>
              </div>
              <div class="demo-action">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div> -->
      
      <div class="login-footer">
        <p>&copy; 2025 HotDesk Pro. Streamline your workspace management.</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
      position: relative;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      pointer-events: none;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.15);
      padding: 40px;
      width: 100%;
      max-width: 420px;
      position: relative;
      z-index: 1;
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 8px;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .logo-section h1 {
      color: #2c3e50;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }

    .logo-section p {
      color: #7f8c8d;
      margin: 4px 0 0 0;
      font-size: 16px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 32px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }

    .form-input {
      padding: 14px 16px;
      border: 2px solid #e1e8ed;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s ease;
      outline: none;
      background: #fafbfc;
      height: 52px; /* Fixed height for consistency */
      box-sizing: border-box;
    }

    .form-input:focus {
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .form-input.error {
      border-color: #e74c3c;
      background: #fff5f5;
    }

    .password-input-container {
      position: relative;
      width: 100%;
    }

    .password-input {
      padding-right: 48px !important; /* Make space for the toggle button */
      width: 100%;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #64748b;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      width: 32px;
      height: 32px;
    }

    .password-toggle:hover {
      color: #475569;
      background: rgba(100, 116, 139, 0.1);
    }

    .password-toggle:focus {
      outline: 2px solid rgba(102, 126, 234, 0.3);
      outline-offset: 2px;
    }

    .error-message {
      color: #e74c3c;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }

    .login-error {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .login-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 24px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      height: 52px; /* Same height as inputs for consistency */
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .login-button:active:not(:disabled) {
      transform: translateY(-1px);
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .loading-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid transparent;
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .demo-section {
      border-top: 1px solid #e1e8ed;
      padding-top: 24px;
    }

    .demo-header {
      margin-bottom: 20px;
    }

    .divider {
      position: relative;
      text-align: center;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e1e8ed;
    }

    .divider span {
      background: white;
      padding: 0 16px;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
      position: relative;
      z-index: 1;
    }

    .demo-credentials {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .demo-user {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .demo-user:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .demo-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
      color: white;
    }

    .demo-avatar.admin {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }

    .demo-avatar.employee {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    }

    .demo-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .demo-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 15px;
    }

    .demo-email {
      color: #7f8c8d;
      font-size: 13px;
    }

    .demo-role {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 8px;
      width: fit-content;
      margin-top: 4px;
    }

    .demo-role.admin {
      background: #fee2e2;
      color: #991b1b;
    }

    .demo-role.employee {
      background: #dbeafe;
      color: #1e40af;
    }

    .demo-action {
      color: #94a3b8;
      transition: all 0.2s ease;
    }

    .demo-user:hover .demo-action {
      color: #64748b;
      transform: translateX(2px);
    }

    .login-footer {
      margin-top: 24px;
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .login-footer p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
      }
      
      .login-card {
        padding: 24px 20px;
      }
      
      .logo-section {
        flex-direction: column;
        gap: 12px;
      }
      
      .logo-section h1 {
        font-size: 24px;
      }
      
      .demo-user {
        padding: 12px;
      }
      
      .demo-avatar {
        width: 36px;
        height: 36px;
        font-size: 14px;
      }
      
      .form-input {
        font-size: 16px; /* Prevent zoom on iOS */
      }
      
      .password-toggle {
        right: 12px;
      }
    }

    @media (max-width: 380px) {
      .demo-user {
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }
      
      .demo-action {
        display: none;
      }
    }
  `]
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };

  isLoading = false;
  loginError = '';
  emailError = false;
  passwordError = false;
  showPassword = false;

  constructor(private authService: AuthService) {}

  onLogin(): void {
    this.clearErrors();
    
    // Basic validation
    if (!this.credentials.email || !this.isValidEmail(this.credentials.email)) {
      this.emailError = true;
      return;
    }
    
    if (!this.credentials.password) {
      this.passwordError = true;
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    this.authService.login(this.credentials).subscribe({
      next: (user) => {
        this.isLoading = false;
        console.log('Login successful:', user);
        // Navigation will be handled by app component
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        if (error.status === 401) {
          this.loginError = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.status === 400) {
          this.loginError = 'Please enter both email and password.';
        } else if (error.status === 0) {
          this.loginError = 'Unable to connect to server. Please check your internet connection.';
        } else {
          this.loginError = 'Login failed. Please try again or contact support if the problem persists.';
        }
      }
    });
  }

  setDemoCredentials(type: 'admin' | 'employee'): void {
    if (type === 'admin') {
      this.credentials = {
        email: 'hot.desk@outlook.com',
        password: 'Password123'
      };
    } else {
      this.credentials = {
        email: 'user2@gmail.com',
        password: 'Password123'
      };
    }
    this.clearErrors();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private clearErrors(): void {
    this.emailError = false;
    this.passwordError = false;
    this.loginError = '';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}