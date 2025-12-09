// src/app/shared/components/layout/layout.component.ts
import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { StateService } from '../../../core/services/state.service';
import { AnalyticsService, SearchResult } from '../../../core/services/analytics.services';
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
  private analyticsService = inject(AnalyticsService);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  readonly currentUser = this.stateService.currentUser;
  sidebarCollapsed = false;
  searchPlaceholder = 'Search projects, tasks...';
  private destroy$ = new Subject<void>();

  // NEW: Search functionality
  private searchSubject$ = new Subject<string>();
  readonly searchResults = signal<SearchResult[]>([]);
  readonly isSearching = signal<boolean>(false);
  readonly showSearchResults = signal<boolean>(false);

  ngOnInit() {
    this.setSearchPlaceholder(this.router.url);
    
    // Listen to route changes
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.clearSearch();
        this.setSearchPlaceholder(event.url);
      });

    // Setup reactive search with JdbcTemplate API
    this.setupReactiveSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup reactive search using JdbcTemplate analytics API
   */
  private setupReactiveSearch(): void {
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(keyword => {
          if (!keyword || keyword.trim().length < 2) {
            this.searchResults.set([]);
            this.showSearchResults.set(false);
            return [];
          }

          this.isSearching.set(true);
          console.log('🔍 [LAYOUT] Searching via JdbcTemplate for:', keyword);
          
          return this.analyticsService.searchTasks(keyword);
        })
      )
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.showSearchResults.set(results.length > 0);
          this.isSearching.set(false);
          console.log('✅ [LAYOUT] Found', results.length, 'results');
        },
        error: (error) => {
          console.error('❌ [LAYOUT] Search error:', error);
          this.isSearching.set(false);
          this.toastService.show('Search failed', 'error');
        }
      });
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
           currentUrl.includes('/team') ||
           currentUrl.includes('/dashboard');
  }

  /**
   * NEW: Handle search input using JdbcTemplate
   */
  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const searchValue = inputElement.value;
    
    // Update state service for filtering
    this.stateService.setSearchValue(searchValue);
    
    // Trigger reactive search via JdbcTemplate
    this.searchSubject$.next(searchValue);
  }

  /**
   * NEW: Handle Enter key press
   */
  onSearchKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const inputElement = event.target as HTMLInputElement;
      const searchValue = inputElement.value;
      
      if (searchValue.trim().length >= 2) {
        // If there are results, navigate to first one
        const results = this.searchResults();
        if (results.length > 0) {
          this.selectSearchResult(results[0]);
        }
      }
    } else if (event.key === 'Escape') {
      this.closeSearchResults();
    }
  }

  /**
   * NEW: Select a search result
   */
  selectSearchResult(result: SearchResult): void {
    console.log('📍 [LAYOUT] Selected:', result.title);
    
    // Navigate to tasks with the specific task
    this.router.navigate(['/tasks'], {
      queryParams: { taskId: result.id }
    });
    
    this.closeSearchResults();
    this.toastService.show(`Navigating to: ${result.title}`, 'info');
  }

  /**
   * NEW: Close search results
   */
  closeSearchResults(): void {
    this.showSearchResults.set(false);
    if (this.searchInput) {
      this.searchInput.nativeElement.blur();
    }
  }

  /**
   * NEW: Get priority badge class
   */
  getPriorityClass(priority: string): string {
    return `badge--${priority}`;
  }

  /**
   * NEW: Get status badge class
   */
  getStatusClass(status: string): string {
    return `badge-status--${status}`;
  }

  private clearSearch() {
    this.stateService.setSearchValue("");
    this.searchResults.set([]);
    this.showSearchResults.set(false);
    
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
}