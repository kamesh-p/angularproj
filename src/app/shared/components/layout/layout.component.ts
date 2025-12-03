// layout.component.ts
import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  private http = inject(HttpClient);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  readonly currentUser = this.stateService.currentUser;
  sidebarCollapsed = false;
  searchPlaceholder = 'Search projects, tasks...';
  currentThemeName = 'light'; // Track current theme
  private destroy$ = new Subject<void>();
  private apiUrl = 'http://localhost:8081/api/theme';

  ngOnInit() {
    this.setSearchPlaceholder(this.router.url);
    
    // Initialize theme from localStorage or default
    this.initializeTheme();
    
    // Listen to route changes to update placeholder and clear search
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
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

  toggleTheme() {
    const newTheme = this.currentThemeName === 'light' ? 'dark' : 'light';
    console.log(`🔄 Switching theme from ${this.currentThemeName} to ${newTheme}`);
    this.loadTheme(newTheme);
  }

  initializeTheme() {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.loadTheme(savedTheme);
    } else {
      // Use default light theme
      this.loadTheme('light');
    }
  }

  loadTheme(themeName: string) {
    console.log(`📥 Loading ${themeName} theme...`);
    
    this.http.get<any>(`${this.apiUrl}/${themeName}`).subscribe({
      next: (theme) => {
        console.log(`✅ ${themeName} theme loaded successfully`);
        this.currentThemeName = themeName;
        this.applyTheme(theme);
        
        // Save theme preference
        localStorage.setItem('preferred-theme', themeName);
        
        // Show notification
        this.toastService.show(`Switched to ${themeName} theme`, 'success');
      },
      error: (err) => {
        console.error(`❌ Error loading ${themeName} theme:`, err);
        
        // Fallback to local theme if API fails
        this.applyFallbackTheme(themeName);
        this.toastService.show(`Switched to ${themeName} theme`, 'success');
      }
    });
  }

  applyTheme(theme: any) {
    console.log(`🎨 Applying ${theme.name} theme...`);
    
    // Set data-color-scheme attribute
    document.documentElement.setAttribute('data-color-scheme', theme.name);
    
    // Apply all CSS custom properties
    if (theme.colors && typeof theme.colors === 'object') {
      Object.keys(theme.colors).forEach((key) => {
        const value = theme.colors[key];
        document.documentElement.style.setProperty(`--${key}`, value);
      });
      console.log(`✅ Applied ${Object.keys(theme.colors).length} CSS variables`);
    }
    
    // Update body styles
    document.body.style.backgroundColor = theme.colors?.['color-background'] || theme.backgroundColor;
    document.body.style.color = theme.colors?.['color-text'] || theme.textColor;
  }

  applyFallbackTheme(themeName: string) {
    console.log(`🔄 Applying fallback ${themeName} theme`);
    
    const fallbackThemes = {
      dark: {
        name: 'dark',
        colors: {
          'color-background': '#1f2121',
          'color-surface': '#262828',
          'color-text': '#f5f5f5',
          'color-text-secondary': 'rgba(167, 169, 169, 0.7)',
          'color-primary': '#32b8c6',
          'color-primary-hover': '#2da6b2',
          'color-primary-active': '#2996a1',
          'color-secondary': 'rgba(119, 124, 124, 0.15)',
          'color-secondary-hover': 'rgba(119, 124, 124, 0.25)',
          'color-secondary-active': 'rgba(119, 124, 124, 0.3)',
          'color-border': 'rgba(119, 124, 124, 0.3)',
          'color-btn-primary-text': '#13343b',
          'color-card-border': 'rgba(119, 124, 124, 0.15)',
          'color-card-border-inner': 'rgba(119, 124, 124, 0.15)',
          'color-error': '#ff5459',
          'color-success': '#32b8c6',
          'color-warning': '#e68161',
          'color-info': '#a7a9a9',
          'color-focus-ring': 'rgba(50, 184, 198, 0.4)',
          'color-select-caret': 'rgba(245, 245, 245, 0.8)'
        }
      },
      light: {
        name: 'light',
        colors: {
          'color-background': '#fcfcf9',
          'color-surface': '#fffffd',
          'color-text': '#13343b',
          'color-text-secondary': '#626c71',
          'color-primary': '#21808d',
          'color-primary-hover': '#1d7480',
          'color-primary-active': '#1a6873',
          'color-secondary': 'rgba(94, 82, 64, 0.12)',
          'color-secondary-hover': 'rgba(94, 82, 64, 0.2)',
          'color-secondary-active': 'rgba(94, 82, 64, 0.25)',
          'color-border': 'rgba(94, 82, 64, 0.2)',
          'color-btn-primary-text': '#fcfcf9',
          'color-card-border': 'rgba(94, 82, 64, 0.12)',
          'color-card-border-inner': 'rgba(94, 82, 64, 0.12)',
          'color-error': '#c0152f',
          'color-success': '#21808d',
          'color-warning': '#a84b2f',
          'color-info': '#626c71',
          'color-focus-ring': 'rgba(33, 128, 141, 0.4)',
          'color-select-caret': 'rgba(19, 52, 59, 0.8)'
        }
      }
    };
    
    const theme = fallbackThemes[themeName as keyof typeof fallbackThemes] || fallbackThemes.light;
    this.currentThemeName = themeName;
    this.applyTheme(theme);
  }

 onLogout(event: Event) {
  event.preventDefault();
  this.modalService.showConfirmation(
    'Confirm Logout',
    'Are you sure you want to logout?',
    () => {
      // Reset theme to light mode before logging out
      this.resetThemeToLight();
      
      this.authService.logout();
      this.toastService.show('Logged out successfully', 'success');
    }
  );
}

private resetThemeToLight() {

  this.currentThemeName = 'light';
  

  localStorage.removeItem('preferred-theme');
  

  this.applyFallbackTheme('light');
  
  console.log('🎨 Theme reset to light mode for logout');
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
    this.stateService.setSearchValue("");
    
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
    if (currentRoute.includes('/projects')) {
      console.log('Searching in projects:', searchValue);
    } else if (currentRoute.includes('/tasks')) {
      console.log('Searching in tasks:', searchValue);
    } else if (currentRoute.includes('/team')) {
      console.log('Searching in team:', searchValue);
    } else {
      console.log('Global search:', searchValue);
    }
  }
}