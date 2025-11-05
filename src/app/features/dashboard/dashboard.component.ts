import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../../core/services/state.service';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
 templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private stateService = inject(StateService);
  private router = inject(Router);

  readonly currentUser = this.stateService.currentUser;
  readonly projects = this.stateService.projects;
  readonly tasks = this.stateService.tasks;
  readonly users = this.stateService.users;

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
}
