import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,  RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
   templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  email = '';
  password = '';
  remember = false;
  errorMessage = signal('');

  onSubmit() {
    this.errorMessage.set('');
    
    if (!this.email || !this.password) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    setTimeout(() => {
      const result = this.authService.login(this.email, this.password);
      
      if (result.success) {
        this.toastService.show('Login successful! Welcome back.', 'success');
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('Invalid email or password');
      }
    }, 500);
  }
}
