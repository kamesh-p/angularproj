import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
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
export class LayoutComponent implements OnInit, OnDestroy {
  private stateService = inject(StateService);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  readonly currentUser = this.stateService.currentUser;
  sidebarCollapsed = false;
  searchPlaceholder = 'Search projects, tasks...';
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.setSearchPlaceholder(this.router.url);
    
    // Listen to route changes to update placeholder and clear search
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        // Clear search value on every route change
        this.clearSearch();
        this.setSearchPlaceholder(event.url);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  showSearchBar(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('/projects') || 
           currentUrl.includes('/tasks') || 
           currentUrl.includes('/team');
  }

  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const searchValue = inputElement.value;
    this.stateService.setSearchValue(searchValue);
    
    if (searchValue.trim()) {
      console.log('Search value:', searchValue);
      this.performSearch(searchValue, this.router.url);
    }
  }

  onSearchKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const inputElement = event.target as HTMLInputElement;
      const searchValue = inputElement.value;
      this.stateService.setSearchValue(searchValue);
      
      if (searchValue.trim()) {
        console.log('Enter pressed with search value:', searchValue);
        this.performSearch(searchValue, this.router.url);
      }
    }
  }

  private clearSearch() {
    // Clear search value in state service
    this.stateService.setSearchValue("");
    
    // Clear the input field visually if it exists
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.value = '';
    }
  }

  private setSearchPlaceholder(url: string) {
    if (url.includes('/projects')) {
      this.searchPlaceholder = 'Search projects...';
    } else if (url.includes('/tasks')) {
      this.searchPlaceholder = 'Search tasks...';
    } else if (url.includes('/team')) {
      this.searchPlaceholder = 'Search team members...';
    } else if (url.includes('/profile')) {
      this.searchPlaceholder = 'Search in profile...';
    } else {
      this.searchPlaceholder = 'Search projects, tasks...';
    }
  }

  private performSearch(searchValue: string, currentRoute: string) {
    // Implement your search logic based on the current route
    if (currentRoute.includes('/projects')) {
      console.log('Searching in projects:', searchValue);
      // Add project search logic here
    } else if (currentRoute.includes('/tasks')) {
      console.log('Searching in tasks:', searchValue);
      // Add task search logic here
    } else if (currentRoute.includes('/team')) {
      console.log('Searching in team:', searchValue);
      // Add team search logic here
    } else {
      console.log('Global search:', searchValue);
      // Add global search logic here
    }
  }
}