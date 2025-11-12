import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from './state.service';
import { LoginResponse, User } from '../../shared/models';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private stateService: StateService,
    private router: Router
  ) {}

  login(email: string, password: string): LoginResponse {
    const users = this.stateService.users();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      this.stateService.setCurrentUser(user);
      
      // Generate mock tokens
      const token = this.generateMockToken(user);
      const refreshToken = this.generateMockRefreshToken(user);
      
      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setCurrentUser(user);
      
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid credentials' };
  }

  logout() {
    this.stateService.setCurrentUser(null);
    this.removeTokens();
    this.removeCurrentUser();
    this.router.navigate(['/login']);
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
  }

  removeCurrentUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Token refresh method
  refreshToken(refreshToken: string): Observable<{ accessToken: string }> {
    const currentUser = this.getCurrentUser();
    
    if (refreshToken && currentUser) {
      // Validate the refresh token (in a real app, this would call your backend)
      const isValid = this.validateRefreshToken(refreshToken);
      
      if (isValid) {
        const newToken = this.generateMockToken(currentUser);
        return of({ accessToken: newToken }).pipe(delay(500)); // Simulate network delay
      }
    }
    
    return throwError(() => new Error('Invalid refresh token'));
  }

  // Helper methods to generate mock tokens
  private generateMockToken(user: User): string {
    // In a real app, this would come from your backend
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Date.now() + 15 * 60 * 1000, // 15 minutes
      iat: Date.now()
    };
    return `mock.jwt.token.${btoa(JSON.stringify(payload))}`;
  }

  private generateMockRefreshToken(user: User): string {
    // In a real app, this would come from your backend
    const payload = {
      userId: user.id,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      iat: Date.now()
    };
    return `mock.refresh.token.${btoa(JSON.stringify(payload))}`;
  }

  private validateRefreshToken(refreshToken: string): boolean {
    try {
      // Extract the payload part from the mock token
      const tokenParts = refreshToken.split('.');
      if (tokenParts.length !== 3) return false;
      
      const payload = JSON.parse(atob(tokenParts[2]));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }

  // Check if token is expired
  isTokenExpired(token?: string | null): boolean {
    if (!token) return true;
    
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return true;
      
      const payload = JSON.parse(atob(tokenParts[2]));
      return payload.exp < Date.now();
    } catch {
      return true;
    }
  }

  // Auto-login from localStorage
  autoLogin(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    if (token && user && !this.isTokenExpired(token)) {
      this.stateService.setCurrentUser(user);
      return true;
    } else {
      this.removeTokens();
      this.removeCurrentUser();
      return false;
    }
  }
}