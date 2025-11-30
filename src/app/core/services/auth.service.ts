import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StateService } from './state.service';
import { LoginResponse, User } from '../../shared/models';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  private readonly API_URL = 'http://localhost:8081/api';

  private http = inject(HttpClient);
  private stateService = inject(StateService);
  private router = inject(Router);

 
  login(email: string, password: string): Observable<LoginResponse> {
    console.log('🔵 Login attempt:', email);
    
    return this.http.post<{success: boolean, user?: User, error?: string}>(
      `${this.API_URL}/auth/login`, 
      { email, password }
    ).pipe(
      map(response => {
        console.log('✅ Login response:', response);
        
        if (response.success && response.user) {
          console.log('✅ Authentication successful');
          this.handleSuccessfulLogin(response.user);
          return { success: true, user: response.user };
        } else {
          console.error('❌ Login failed:', response.error);
          return { success: false, error: response.error || 'Login failed' };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Login error:', error);
        
        let errorMessage = 'Connection failed. Please ensure the backend server is running on port 8081.';
        
        if (error.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.status === 400) {
          errorMessage = error.error?.error || 'Invalid request';
        }
        
        return of({ 
          success: false, 
          error: errorMessage
        });
      })
    );
  }

  /**
   * Handle successful login - set tokens and user
   */
  private handleSuccessfulLogin(user: User): void {
    console.log('🎉 Login successful, setting up session');
    
    // Update state
    this.stateService.setCurrentUser(user);
    
    // Generate mock tokens
    const token = this.generateMockToken(user);
    const refreshToken = this.generateMockRefreshToken(user);
    
    // Store tokens and user
    this.setToken(token);
    this.setRefreshToken(refreshToken);
    this.setCurrentUser(user);
  }

  /**
   * Logout user
   */
  logout() {
    console.log('👋 Logging out');
    const currentUser = this.getCurrentUser();
    
    // Call logout endpoint to update user status
    if (currentUser) {
      this.http.post(`${this.API_URL}/auth/logout`, { userId: currentUser.id })
        .pipe(catchError(error => {
          console.warn('Logout endpoint failed:', error);
          return of(null);
        }))
        .subscribe();
    }
    
    this.stateService.setCurrentUser(null);
    this.removeTokens();
    this.removeCurrentUser();
    this.router.navigate(['/login']);
  }

  /**
   * Register new user
   */
  register(name: string, email: string, password: string, role?: string, avatar?: string): Observable<LoginResponse> {
    console.log('🔵 Registration attempt:', email);
    
    return this.http.post<{success: boolean, user?: User, error?: string}>(
      `${this.API_URL}/auth/register`,
      { name, email, password, role, avatar }
    ).pipe(
      map(response => {
        console.log('✅ Registration response:', response);
        
        if (response.success && response.user) {
          console.log('✅ Registration successful');
          this.handleSuccessfulLogin(response.user);
          return { success: true, user: response.user };
        } else {
          console.error('❌ Registration failed:', response.error);
          return { success: false, error: response.error || 'Registration failed' };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Registration error:', error);
        
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.status === 409) {
          errorMessage = 'Email already registered';
        } else if (error.status === 400) {
          errorMessage = error.error?.error || 'Invalid request';
        }
        
        return of({ 
          success: false, 
          error: errorMessage
        });
      })
    );
  }

  isAuthenticated(): boolean {
    return this.stateService.isAuthenticated() && !!this.getToken();
  }

  // Token management methods
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  setCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  removeTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  removeCurrentUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Helper methods to generate mock tokens
  private generateMockToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Date.now() + 15 * 60 * 1000,
      iat: Date.now()
    };
    return `mock.jwt.token.${btoa(JSON.stringify(payload))}`;
  }

  private generateMockRefreshToken(user: User): string {
    const payload = {
      userId: user.id,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      iat: Date.now()
    };
    return `mock.refresh.token.${btoa(JSON.stringify(payload))}`;
  }

  // Auto-login from localStorage
  autoLogin(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    if (token && user) {
      console.log('🔄 Auto-login successful');
      this.stateService.setCurrentUser(user);
      return true;
    } else {
      console.log('❌ Auto-login failed');
      this.removeTokens();
      return false;
    }
  }
}