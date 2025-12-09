// src/app/core/services/analytics.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

// Interfaces for type safety
export interface ProjectStatistics {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  completionPercentage: number;
}

export interface TeamPerformance {
  userId: string;
  userName: string;
  totalTasksAssigned: number;
  completedTasks: number;
  successRate: number;
}

export interface DashboardSummary {
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  active_tasks: number;
  pending_tasks: number;
  total_users: number;
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  due_date: string;
  priority: string;
  project_name: string;
  assigned_to_name: string;
}

export interface ProjectStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface OverdueTask {
  priority: string;
  overdue_count: number;
  task_titles: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project_name: string;
}

export interface ActiveProjectSummary {
  id: string;
  name: string;
  status: string;
  start_date: string;
  task_count: number;
  team_members: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/analytics';

  /**
   * Get detailed project statistics with completion rates
   * Used by: dashboard.component.ts
   */
  getProjectStatistics(): Observable<ProjectStatistics[]> {
    console.log('📊 [ANALYTICS SERVICE] Fetching project statistics...');
    
    return this.http.get<ProjectStatistics[]>(`${this.apiUrl}/project-stats`).pipe(
      retry(2),
      tap(stats => console.log('✅ [ANALYTICS SERVICE] Loaded', stats.length, 'project stats')),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Error loading project stats:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get team member performance metrics
   * Used by: team.component.ts, dashboard.component.ts
   */
  getTeamPerformance(): Observable<TeamPerformance[]> {
    console.log('👥 [ANALYTICS SERVICE] Fetching team performance...');
    
    return this.http.get<TeamPerformance[]>(`${this.apiUrl}/team-performance`).pipe(
      retry(2),
      tap(perf => console.log('✅ [ANALYTICS SERVICE] Loaded performance for', perf.length, 'members')),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Error loading team performance:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get comprehensive dashboard summary
   * Used by: dashboard.component.ts
   */
  getDashboardSummary(): Observable<DashboardSummary> {
    console.log('📈 [ANALYTICS SERVICE] Fetching dashboard summary...');
    
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard-summary`).pipe(
      retry(2),
      tap(summary => console.log('✅ [ANALYTICS SERVICE] Dashboard summary loaded:', summary)),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Error loading dashboard summary:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get tasks due within next 7 days
   * Used by: dashboard.component.ts
   */
  getUpcomingDeadlines(): Observable<UpcomingDeadline[]> {
    console.log('⏰ [ANALYTICS SERVICE] Fetching upcoming deadlines...');
    
    return this.http.get<UpcomingDeadline[]>(`${this.apiUrl}/upcoming-deadlines`).pipe(
      retry(2),
      tap(deadlines => console.log('✅ [ANALYTICS SERVICE] Found', deadlines.length, 'upcoming deadlines')),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Error loading deadlines:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get project status distribution
   * Used by: dashboard.component.ts, projects.component.ts
   */
  getProjectStatusDistribution(): Observable<ProjectStatusDistribution[]> {
    console.log('📊 [ANALYTICS SERVICE] Fetching project status distribution...');
    
    return this.http.get<ProjectStatusDistribution[]>(`${this.apiUrl}/project-status-distribution`).pipe(
      retry(2),
      tap(dist => console.log('✅ [ANALYTICS SERVICE] Status distribution loaded')),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Error loading status distribution:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get overdue tasks grouped by priority
   * Used by: dashboard.component.ts
   */
  getOverdueTasksByPriority(): Observable<OverdueTask[]> {
    console.log('⚠️ [ANALYTICS SERVICE] Fetching overdue tasks...');
    
    return this.http.get<OverdueTask[]>(`${this.apiUrl}/overdue-tasks`).pipe(
      retry(2),
      tap(tasks => console.log('✅ [ANALYTICS SERVICE] Found', tasks.length, 'overdue task groups')),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Error loading overdue tasks:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Search tasks by keyword
   * Used by: layout.component.ts (search bar)
   */
  searchTasks(keyword: string): Observable<SearchResult[]> {
    console.log('🔍 [ANALYTICS SERVICE] Searching tasks for:', keyword);
    
    return this.http.get<SearchResult[]>(`${this.apiUrl}/search`, {
      params: { keyword }
    }).pipe(
      retry(1),
      tap(results => console.log('✅ [ANALYTICS SERVICE] Found', results.length, 'matching tasks')),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Search error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get active projects summary
   * Used by: projects.component.ts
   */
  getActiveProjectsSummary(): Observable<ActiveProjectSummary[]> {
    console.log('📁 [ANALYTICS SERVICE] Fetching active projects...');
    
    return this.http.get<ActiveProjectSummary[]>(`${this.apiUrl}/active-projects`).pipe(
      retry(2),
      tap(projects => console.log('✅ [ANALYTICS SERVICE] Loaded', projects.length, 'active projects')),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Error loading active projects:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get task statistics by status
   * Used by: dashboard.component.ts
   */
  getTaskStatsByStatus(): Observable<{ todo: number; in_progress: number; done: number }> {
    console.log('📊 [ANALYTICS SERVICE] Fetching task stats by status...');
    
    return this.http.get<any>(`${this.apiUrl}/task-stats`).pipe(
      retry(2),
      tap(stats => console.log('✅ [ANALYTICS SERVICE] Task stats loaded:', stats)),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Error loading task stats:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get average project completion percentage
   * Used by: dashboard.component.ts
   */
  getAverageCompletion(): Observable<{ averageCompletion: number; formatted: string }> {
    console.log('📈 [ANALYTICS SERVICE] Fetching average completion...');
    
    return this.http.get<any>(`${this.apiUrl}/average-completion`).pipe(
      retry(2),
      tap(result => console.log('✅ [ANALYTICS SERVICE] Average completion:', result.formatted)),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Error loading average completion:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mark all overdue tasks as urgent (bulk operation)
   * Used by: dashboard.component.ts
   */
  markOverdueTasksUrgent(): Observable<{ success: boolean; updatedCount: number; message: string }> {
    console.log('⚡ [ANALYTICS SERVICE] Marking overdue tasks as urgent...');
    
    return this.http.post<any>(`${this.apiUrl}/mark-overdue-urgent`, {}).pipe(
      tap(result => console.log('✅ [ANALYTICS SERVICE]', result.message)),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Error marking tasks urgent:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Bulk update project status
   * Used by: projects.component.ts
   */
  updateProjectStatus(fromStatus: string, toStatus: string): Observable<any> {
    console.log(`🔄 [ANALYTICS SERVICE] Bulk updating: ${fromStatus} → ${toStatus}`);
    
    return this.http.put<any>(`${this.apiUrl}/update-project-status`, null, {
      params: { fromStatus, toStatus }
    }).pipe(
      tap(result => console.log('✅ [ANALYTICS SERVICE]', result.message)),
      catchError(error => {
        console.error('❌ [ANALYTICS SERVICE] Error updating project status:', error);
        return throwError(() => error);
      })
    );
  }
}