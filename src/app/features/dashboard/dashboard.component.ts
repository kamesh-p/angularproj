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
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
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
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdRef = inject(ChangeDetectorRef);

  // ==========================================================================
  // VIEW QUERIES - COMPLETE IMPLEMENTATION
  // ==========================================================================

  @ViewChild('statsContainer') statsContainer!: ElementRef<HTMLDivElement>;
  @ViewChildren('statCard') statCards!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren(HighlightDirective) highlightDirectives!: QueryList<HighlightDirective>;
  
  // Additional ViewChild for form inputs
  @ViewChild('projectNameInput') projectNameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('taskTitleInput') taskTitleInput!: ElementRef<HTMLInputElement>;

  // ==========================================================================
  // COMPONENT STATE
  // ==========================================================================

  readonly currentUser = this.stateService.currentUser;
  readonly projects = this.stateService.projects;
  readonly tasks = this.stateService.tasks;
  readonly users = this.stateService.users;

  showCreateProjectDialog = false;
  showCreateTaskDialog = false;
  projectForm: FormGroup;
  taskForm: FormGroup;

  highlightedCardIndex: number = -1;
  totalStatCards: number = 0;
  isStatsContainerVisible: boolean = false;

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

  // ==========================================================================
  // LIFECYCLE HOOKS
  // ==========================================================================

  ngAfterViewInit() {
    this.initializeViewQueries();
  }

  ngOnDestroy() {
    // Clean up any subscriptions if needed
  }

  // ==========================================================================
  // VIEW QUERIES IMPLEMENTATION
  // ==========================================================================

  private initializeViewQueries() {
    this.setupStatCards();
    this.setupHighlightDirectives();
    this.setupStatCardsChanges();
  }

  highlightCard(index: number): void {
    if (index === -1) {
      // Clear all highlights
      this.highlightedCardIndex = -1;
    } else {
      // Set the highlighted card
      this.highlightedCardIndex = index;
      
      // Optional: Add a subtle animation effect
      if (this.statCards && this.statCards.length > index) {
        const card = this.statCards.get(index);
        if (card) {
          // Add a subtle pulse effect
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

  /**
   * Focus on the first input in a dialog when it opens
   */
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

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

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
  // GETTERS & EXISTING METHODS
  // ==========================================================================

  get totalProjects() {
    return this.projects().length;
  }

  get activeTasks() {
    return this.tasks().filter(t => t.status === 'in_progress').length;
  }

  get completedTasks() {
    return this.tasks().filter(t => t.status === 'done').length;
  }

  get totalTasks() {
    return this.tasks().length;
  }

  get todoTasks() {
    return this.tasks().filter(t => t.status === 'todo').length;
  }

  get recentTasks() {
    return this.tasks()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  getUserAvatar(userId: string): string {
    return this.users().find(u => u.id === userId)?.avatar || '👤';
  }

  getUserName(userId: string): string {
    return this.users().find(u => u.id === userId)?.name || 'Unknown';
  }

  // Navigation methods
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

  // Dialog methods
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
      this.cdRef.markForCheck();
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}