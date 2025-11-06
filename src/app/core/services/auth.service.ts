import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from './state.service';
import { LoginResponse } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private stateService: StateService,
    private router: Router
  ) {}

  login(email: string, password: string): LoginResponse {
    const users = this.stateService.users();
    const user = users.find(u => u.email === email && u.password === password); ;
    
    if (user) {
      this.stateService.setCurrentUser(user);
    
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid credentials' };
  }

  logout() {
    this.stateService.setCurrentUser(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.stateService.isAuthenticated();
  }
}
