import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private stateService = inject(StateService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  readonly currentUser = this.stateService.currentUser;
  readonly projects = this.stateService.projects;
  readonly tasks = this.stateService.tasks;
  readonly users = this.stateService.users;

  showCreateProjectDialog = false;
  showCreateTaskDialog = false;
  projectForm: FormGroup;
  taskForm: FormGroup;

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
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}