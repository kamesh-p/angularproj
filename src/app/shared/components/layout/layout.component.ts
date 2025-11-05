import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StateService } from '../../../core/services/state.service';
import { ModalService } from '../../../core/services/modal.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  private stateService = inject(StateService);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  readonly currentUser = this.stateService.currentUser;
  sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onLogout(event: Event) {
    event.preventDefault();
    this.modalService.showConfirmation(
      'Confirm Logout',
      'Are you sure you want to logout?',
      () => {
        this.authService.logout();
        this.toastService.show('Logged out successfully', 'success');
      }
    );
  }
}