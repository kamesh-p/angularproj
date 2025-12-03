import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map, startWith } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormatDatePipe],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  private stateService = inject(StateService);
  
  // Basic signals
  readonly projects = this.stateService.projects;
  readonly searchValue = this.stateService.currentSearchValue;
  
  // Loading and error states
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  
  // Convert search signal to observable for RxJS operators
  private searchValue$ = toObservable(this.searchValue);
  
  private debouncedSearch$ = this.searchValue$.pipe(
    debounceTime(300), 
    distinctUntilChanged(), 
    map(term => term.toLowerCase().trim()),
    startWith('') 
  );

  readonly debouncedSearchTerm = toSignal(this.debouncedSearch$, { 
    initialValue: '' 
  });
  
  readonly filteredProjects = computed(() => {
    const searchTerm = this.debouncedSearchTerm();
    const allProjects = this.projects();
    
    if (!searchTerm) {
      return allProjects; 
    }
    
    return allProjects.filter(project => 
      project.name.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.status.toLowerCase().includes(searchTerm)
    );
  });
  
  // Advanced: Reactive project statistics
  readonly projectStats = computed(() => {
    const projects = this.filteredProjects();
    return {
      total: projects.length,
      completed: projects.filter(p => p.status === 'completed').length,
      onProgress: projects.filter(p => p.status === 'in_progress').length,
      onHold: projects.filter(p => p.status === 'on_hold').length,
      Planning: projects.filter(p => p.status === 'planning').length,
    };
  });
  
  // Advanced: Dynamic project loading with switchMap
  readonly selectedProjectId = signal<string | null>(null);
  
  private selectedProject$ = toObservable(this.selectedProjectId).pipe(
    debounceTime(100),
    distinctUntilChanged(),
    switchMap(projectId => {
      if (!projectId) return of(null);
      
      // Simulate API call or complex operation
      return this.stateService.getProjectById(projectId).pipe(
        catchError(error => {
          this.error.set(`Failed to load project: ${error.message}`);
          return of(null);
        })
      );
    })
  );
  
  readonly selectedProject = toSignal(this.selectedProject$, { 
    initialValue: null 
  });
  

  ngOnInit(): void {
    this.refreshProjects();
  }
  
  
  async refreshProjects(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      await this.stateService.loadProjectsViaHttp();
    } catch (err: any) {
      this.error.set(`Failed to refresh projects: ${err.message}`);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  // Select project method
  selectProject(projectId: string): void {
    this.selectedProjectId.set(projectId);
  }
  
  // Clear selection
  clearSelection(): void {
    this.selectedProjectId.set(null);
  }
  
  closeDialog(): void {
    this.selectedProjectId.set(null);
  }
}