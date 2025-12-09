// src/app/features/dashboard/dashboard.component.ts
import { 
  Component, 
  inject, 
  ViewChild, 
  ViewChildren, 
  QueryList, 
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { AnalyticsService, ProjectStatistics, DashboardSummary, UpcomingDeadline, OverdueTask } from '../../core/services/analytics.services';
import { ToastService } from '../../core/services/toast.service';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { HighlightDirective } from '../../shared/directives/highlight.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe, ReactiveFormsModule, HighlightDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private stateService = inject(StateService);
  private analyticsService = inject(AnalyticsService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdRef = inject(ChangeDetectorRef);

  // ViewChild/ViewChildren
  @ViewChild('statsContainer') statsContainer!: ElementRef<HTMLDivElement>;
  @ViewChildren('statCard') statCards!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren(HighlightDirective) highlightDirectives!: QueryList<HighlightDirective>;
  @ViewChild('projectNameInput') projectNameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('taskTitleInput') taskTitleInput!: ElementRef<HTMLInputElement>;

  // State from existing service
  readonly currentUser = this.stateService.currentUser;
  readonly projects = this.stateService.projects;
  readonly tasks = this.stateService.tasks;
  readonly users = this.stateService.users;

  // NEW: Analytics data using signals
  readonly projectStats = signal<ProjectStatistics[]>([]);
  readonly dashboardSummary = signal<DashboardSummary | null>(null);
  readonly upcomingDeadlines = signal<UpcomingDeadline[]>([]);
  readonly overdueTasksGroups = signal<OverdueTask[]>([]);
  readonly averageCompletion = signal<number>(0);
  readonly taskStats = signal<{ todo: number; in_progress: number; done: number }>({ 
    todo: 0, 
    in_progress: 0, 
    done: 0 
  });

  // Loading states
  readonly isLoadingAnalytics = signal<boolean>(false);
  readonly analyticsError = signal<string | null>(null);

  // Dialog states
  showCreateProjectDialog = false;
  showCreateTaskDialog = false;
  projectForm: FormGroup;
  taskForm: FormGroup;

  // ViewChild demo states
  highlightedCardIndex: number = -1;
  totalStatCards: number = 0;
  isStatsContainerVisible: boolean = false;

  // NEW: Computed values from analytics
  readonly totalProjectsFromAnalytics = computed(() => 
    this.dashboardSummary()?.total_projects || 0
  );

  readonly totalTasksFromAnalytics = computed(() => 
    this.dashboardSummary()?.total_tasks || 0
  );

  readonly completedTasksFromAnalytics = computed(() => 
    this.dashboardSummary()?.completed_tasks || 0
  );

  readonly activeTasksFromAnalytics = computed(() => 
    this.dashboardSummary()?.active_tasks || 0
  );

  readonly pendingTasksFromAnalytics = computed(() => 
    this.dashboardSummary()?.pending_tasks || 0
  );

  // Keep existing getters for compatibility
  get totalProjects() {
    return this.totalProjectsFromAnalytics() || this.projects().length;
  }

  get activeTasks() {
    return this.activeTasksFromAnalytics() || this.tasks().filter(t => t.status === 'in_progress').length;
  }

  get completedTasks() {
    return this.completedTasksFromAnalytics() || this.tasks().filter(t => t.status === 'done').length;
  }

  get totalTasks() {
    return this.totalTasksFromAnalytics() || this.tasks().length;
  }

  get todoTasks() {
    return this.taskStats().todo || this.tasks().filter(t => t.status === 'todo').length;
  }

  get recentTasks() {
    return this.tasks()
      // .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      // .slice(0, 5);
  }

  constructor() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['planning', Validators.required],
      startDate: ['', Validators.required]
    });

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      projectId: ['', Validators.required],
      status: ['todo', Validators.required],
      priority: ['medium', Validators.required],
      dueDate: ['', Validators.required],
      assignedTo: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    this.initializeViewQueries();
    
    // Load analytics data
    this.loadAnalytics();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  // ==========================================================================
  // NEW: ANALYTICS LOADING METHODS
  // ==========================================================================

  /**
   * Load all analytics data from JdbcTemplate APIs
   */
  loadAnalytics(): void {
    console.log('🔄 [DASHBOARD] Loading analytics data...',this.tasks());
    this.isLoadingAnalytics.set(true);
    this.analyticsError.set(null);

    // Load dashboard summary
    this.analyticsService.getDashboardSummary().subscribe({
      next: (summary) => {
        this.dashboardSummary.set(summary);
        console.log('✅ [DASHBOARD] Dashboard summary loaded');
        this.cdRef.markForCheck();
      },
      error: (error) => {
        console.error('❌ [DASHBOARD] Error loading dashboard summary:', error);
        this.analyticsError.set('Failed to load dashboard summary');
        this.cdRef.markForCheck();
      }
    });

    // Load project statistics
    this.analyticsService.getProjectStatistics().subscribe({
      next: (stats) => {
        this.projectStats.set(stats);
        console.log('✅ [DASHBOARD] Project statistics loaded');
        this.cdRef.markForCheck();
      },
      error: (error) => {
        console.error('❌ [DASHBOARD] Error loading project stats:', error);
      }
    });

    // Load upcoming deadlines
    this.analyticsService.getUpcomingDeadlines().subscribe({
      next: (deadlines) => {
        this.upcomingDeadlines.set(deadlines);
        console.log('✅ [DASHBOARD] Upcoming deadlines loaded');
        this.cdRef.markForCheck();
      },
      error: (error) => {
        console.error('❌ [DASHBOARD] Error loading deadlines:', error);
      }
    });

    // Load overdue tasks
    this.analyticsService.getOverdueTasksByPriority().subscribe({
      next: (overdue) => {
        this.overdueTasksGroups.set(overdue);
        console.log('✅ [DASHBOARD] Overdue tasks loaded');
        this.cdRef.markForCheck();
      },
      error: (error) => {
        console.error('❌ [DASHBOARD] Error loading overdue tasks:', error);
      }
    });

    // Load task statistics
    this.analyticsService.getTaskStatsByStatus().subscribe({
      next: (stats) => {
        this.taskStats.set(stats);
        console.log('✅ [DASHBOARD] Task stats loaded');
        this.cdRef.markForCheck();
      },
      error: (error) => {
        console.error('❌ [DASHBOARD] Error loading task stats:', error);
      }
    });

    // Load average completion
    this.analyticsService.getAverageCompletion().subscribe({
      next: (result) => {
        this.averageCompletion.set(result.averageCompletion);
        console.log('✅ [DASHBOARD] Average completion loaded');
        this.cdRef.markForCheck();
      },
      error: (error) => {
        console.error('❌ [DASHBOARD] Error loading average completion:', error);
      },
      complete: () => {
        this.isLoadingAnalytics.set(false);
        this.cdRef.markForCheck();
      }
    });
  }

  /**
   * Refresh all analytics data
   */
  refreshAnalytics(): void {
    console.log('🔄 [DASHBOARD] Refreshing analytics...');
    this.toastService.show('Refreshing analytics...', 'info');
    this.loadAnalytics();
  }

  /**
   * Mark overdue tasks as urgent (bulk operation)
   */
  markOverdueTasksUrgent(): void {
    console.log('⚡ [DASHBOARD] Marking overdue tasks as urgent...');
    
    this.analyticsService.markOverdueTasksUrgent().subscribe({
      next: (result) => {
        this.toastService.show(result.message, 'success');
        // Reload analytics to reflect changes
        this.loadAnalytics();
        this.cdRef.markForCheck();
      },
      error: (error) => {
        this.toastService.show('Failed to mark tasks as urgent', 'error');
        console.error('❌ [DASHBOARD] Error:', error);
      }
    });
  }

  // ==========================================================================
  // VIEW QUERIES IMPLEMENTATION (Existing)
  // ==========================================================================

  private initializeViewQueries() {
    this.setupStatCards();
    this.setupHighlightDirectives();
    this.setupStatCardsChanges();
  }

  highlightCard(index: number): void {
    if (index === -1) {
      this.highlightedCardIndex = -1;
    } else {
      this.highlightedCardIndex = index;
      
      if (this.statCards && this.statCards.length > index) {
        const card = this.statCards.get(index);
        if (card) {
          card.nativeElement.style.transform = 'scale(1.02)';
          setTimeout(() => {
            if (card.nativeElement) {
              card.nativeElement.style.transform = 'scale(1)';
            }
          }, 150);
        }
      }
    }
    this.cdRef.markForCheck();
  }

  getCardContent(index: number): string {
    if (this.statCards && this.statCards.length > index) {
      const card = this.statCards.get(index);
      return card?.nativeElement.textContent?.trim() || '';
    }
    return '';
  }

  focusOnDialogInput(dialogType: 'project' | 'task'): void {
    setTimeout(() => {
      let inputElement: HTMLInputElement | null = null;
      
      if (dialogType === 'project') {
        inputElement = document.querySelector('#projectName') as HTMLInputElement;
      } else if (dialogType === 'task') {
        inputElement = document.querySelector('#taskTitle') as HTMLInputElement;
      }
      
      if (inputElement) {
        inputElement.focus();
      }
    });
  }

  private setupStatCards() {
    if (this.statCards) {
      this.totalStatCards = this.statCards.length;
      console.log(`Found ${this.totalStatCards} stat cards`);

      this.statCards.forEach((card, index) => {
        card.nativeElement.title = `Click to view ${this.getCardAction(index)}`;
        card.nativeElement.setAttribute('data-card-index', index.toString());
      });
    }
  }

  private setupHighlightDirectives() {
    if (this.highlightDirectives) {
      console.log(`Found ${this.highlightDirectives.length} highlight directives`);
      
      this.highlightDirectives.forEach((directive, index) => {
        console.log(`Directive ${index} highlight color:`, directive.appHighlight);
      });
    }
  }

  private setupStatCardsChanges() {
    if (this.statCards) {
      this.statCards.changes.subscribe((cards: QueryList<ElementRef>) => {
        console.log('Stat cards changed, new count:', cards.length);
        this.totalStatCards = cards.length;
        this.cdRef.markForCheck();
      });
    }
  }

  private getCardAction(index: number): string {
    const actions = ['projects', 'active tasks', 'completed tasks', 'all tasks'];
    return actions[index] || 'details';
  }

  // ==========================================================================
  // EXISTING METHODS (Keep all your existing methods)
  // ==========================================================================

  getUserAvatar(userId: string): string {
    return this.users().find(u => u.id === userId)?.avatar || '👤';
  }

  getUserName(userId: string): string {
    return this.users().find(u => u.id === userId)?.name || 'Unknown';
  }

  navigateToProjects() {
    this.router.navigate(['/projects']);
  }

  navigateToTasks(status?: string) {
    if (status) {
      this.router.navigate(['/tasks'], { queryParams: { status } });
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  openCreateProjectDialog() {
    this.showCreateProjectDialog = true;
    this.projectForm.reset({
      name: '',
      description: '',
      status: 'planning',
      startDate: ''
    });
    
    this.focusOnDialogInput('project');
  }

  openCreateTaskDialog() {
    this.showCreateTaskDialog = true;
    this.taskForm.reset({
      title: '',
      description: '',
      projectId: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      assignedTo: ''
    });
    
    this.focusOnDialogInput('task');
  }

  closeCreateProjectDialog() {
    this.showCreateProjectDialog = false;
    this.projectForm.reset();
  }

  closeCreateTaskDialog() {
    this.showCreateTaskDialog = false;
    this.taskForm.reset();
  }

  createProject() {
    if (this.projectForm.valid) {
      const newProject = {
        id: this.generateId(),
        ...this.projectForm.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: this.currentUser()?.id,
        teamMembers: [this.currentUser()?.id]
      };

      this.stateService.addProject(newProject);
      this.closeCreateProjectDialog();
      
      // Refresh analytics after creating project
      setTimeout(() => this.loadAnalytics(), 500);
      
      this.cdRef.markForCheck();
    }
  }

  createTask() {
    if (this.taskForm.valid) {
      const newTask = {
        id: this.generateId(),
        ...this.taskForm.value,
        assignedTo: [this.taskForm.value.assignedTo], 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: this.currentUser()?.id
      };

      this.stateService.addTask(newTask);
      this.closeCreateTaskDialog();
      
      // Refresh analytics after creating task
      setTimeout(() => this.loadAnalytics(), 500);
      
      this.cdRef.markForCheck();
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}