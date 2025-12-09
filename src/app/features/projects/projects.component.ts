import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
import { Project } from '../../shared/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormatDatePipe, ReactiveFormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  private stateService = inject(StateService);
  private toastService = inject(ToastService);
  private modalService = inject(ModalService);
  private fb = inject(FormBuilder);
  
  // Basic signals
  readonly projects = this.stateService.projects;
  readonly searchValue = this.stateService.currentSearchValue;
  
  // Loading and error states
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  
  // Dialog states for CRUD operations
  readonly showCreateDialog = signal<boolean>(false);
  readonly showEditDialog = signal<boolean>(false);
  readonly editingProject = signal<Project | null>(null);
  
  // Form for create/edit
  projectForm: FormGroup;
  
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
      planning: projects.filter(p => p.status === 'planning').length,
    };
  });
  
  // Advanced: Dynamic project loading with switchMap
  readonly selectedProjectId = signal<string | null>(null);
  
  private selectedProject$ = toObservable(this.selectedProjectId).pipe(
    debounceTime(100),
    distinctUntilChanged(),
    switchMap(projectId => {
      if (!projectId) return of(null);
      
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

  constructor() {
    // Initialize form with validation
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['planning', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      budget: [0],
      owner: [''],
      members: [[]]
    });
  }

  ngOnInit(): void {
    this.refreshProjects();
  }
  
  // ========================================
  // READ - Refresh Projects
  // ========================================
  async refreshProjects(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      await this.stateService.loadProjectsViaHttp();
      this.toastService.show('Projects loaded successfully', 'success');
    } catch (err: any) {
      this.error.set(`Failed to refresh projects: ${err.message}`);
      this.toastService.show('Failed to load projects', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  // ========================================
  // CREATE - Add New Project
  // ========================================
  openCreateDialog(): void {
    this.showCreateDialog.set(true);
    this.editingProject.set(null);
    this.projectForm.reset({
      name: '',
      description: '',
      status: 'planning',
      startDate: '',
      endDate: '',
      budget: 0,
      owner: 'user-1', // Default owner
      members: []
    });
    this.focusFirstInput();
  }

  async createProject(): Promise<void> {
    if (this.projectForm.invalid) {
      this.markFormFieldsAsTouched();
      this.toastService.show('Please fill in all required fields', 'error');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const projectData = {
        ...this.projectForm.value,
        updatedAt: new Date().toISOString().split('T')[0]
      };

      await this.stateService.addProject(projectData);
      this.toastService.show('Project created successfully!', 'success');
      this.closeCreateDialog();
    } catch (err: any) {
      this.error.set(`Failed to create project: ${err.message}`);
      this.toastService.show('Failed to create project', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
    this.projectForm.reset();
  }

  // ========================================
  // UPDATE - Edit Existing Project
  // ========================================
  openEditDialog(project: Project, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.editingProject.set(project);
    this.showEditDialog.set(true);
    
    // Populate form with existing project data
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate || '',
      budget: project.budget || 0,
      owner: project.owner || '',
      // members: project.members || []
    });
    
    this.focusFirstInput();
  }

  async updateProject(): Promise<void> {
    if (this.projectForm.invalid || !this.editingProject()) {
      this.markFormFieldsAsTouched();
      this.toastService.show('Please fill in all required fields', 'error');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const updates = {
        ...this.projectForm.value,
        updatedAt: new Date().toISOString().split('T')[0]
      };

      await this.stateService.updateProject(this.editingProject()!.id, updates);
      this.toastService.show('Project updated successfully!', 'success');
      this.closeEditDialog();
      
      // If the updated project was selected, refresh the selection
      if (this.selectedProjectId() === this.editingProject()!.id) {
        this.selectProject(this.editingProject()!.id);
      }
    } catch (err: any) {
      console.log("Error updating project:", err);
      this.error.set(`Failed to update project: ${err.message}`);
      this.toastService.show('Failed to update project', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.editingProject.set(null);
    this.projectForm.reset();
  }

  // ========================================
  // DELETE - Remove Project
  // ========================================
  confirmDeleteProject(project: Project, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.modalService.showConfirmation(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This action cannot be undone and will also delete all related tasks.`,
      () => this.deleteProject(project.id)
    );
  }

  async deleteProject(projectId: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.stateService.deleteProject(projectId);
      this.toastService.show('Project deleted successfully!', 'success');
      
      // Close detail dialog if deleted project was selected
      if (this.selectedProjectId() === projectId) {
        this.closeDialog();
      }
    } catch (err: any) {
      this.error.set(`Failed to delete project: ${err.message}`);
      this.toastService.show('Failed to delete project', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ========================================
  // Helper Methods
  // ========================================
  selectProject(projectId: string): void {
    this.selectedProjectId.set(projectId);
  }
  
  clearSelection(): void {
    this.selectedProjectId.set(null);
  }
  
  closeDialog(): void {
    this.selectedProjectId.set(null);
  }

  private focusFirstInput(): void {
    setTimeout(() => {
      const input = document.querySelector('#projectName') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  }

  private markFormFieldsAsTouched(): void {
    Object.keys(this.projectForm.controls).forEach(key => {
      this.projectForm.get(key)?.markAsTouched();
    });
  }

  // Utility method to check if form field has error
  hasError(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Get error message for a field
  getErrorMessage(fieldName: string): string {
    const field = this.projectForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      name: 'Project name',
      description: 'Description',
      status: 'Status',
      startDate: 'Start date',
      endDate: 'End date',
      budget: 'Budget',
      owner: 'Owner',
      members: 'Members'
    };
    return labels[fieldName] || fieldName;
  }
}