import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, Project, Task, TeamMember } from '../../shared/models';
import { Observable, throwError, of, BehaviorSubject, Subject } from 'rxjs';
import { 
  catchError, 
  retry, 
  retryWhen, 
  delay, 
  take, 
  tap, 
  map, 
  shareReplay, 
  switchMap,
  debounceTime,
  distinctUntilChanged,
  finalize,
  scan
} from 'rxjs/operators';

export interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private http = inject(HttpClient);
  
  // Java backend URL
  private readonly API_URL = 'http://localhost:8081/api';
  
  // Signals
  readonly currentUser = signal<User | null>(null);
  readonly users = signal<User[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly tasks = signal<Task[]>([]);
 
  readonly teamMembers = signal<TeamMember[]>([]);
  readonly isAuthenticated = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  private searchValue = signal<string>('');
  readonly currentSearchValue = this.searchValue.asReadonly();
  
  // Advanced RxJS: Subjects for reactive streams
  private projectsSubject$ = new BehaviorSubject<Project[]>([]);
  private refreshTrigger$ = new Subject<void>();
  
  // Cached projects observable with shareReplay
  private projects$ = this.projectsSubject$.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  
  // Advanced: Auto-refresh mechanism
  private autoRefresh$ = this.refreshTrigger$.pipe(
    debounceTime(1000),
    switchMap(() => this.fetchProjectsWithRetry()),
    tap(projects => {
      this.projects.set(projects);
      this.projectsSubject$.next(projects);
    }),
    catchError(error => {
      console.error('❌ Auto-refresh failed:', error);
      return of([]);
    }),
    shareReplay(1)
  );

  setSearchValue(value: string) {
    this.searchValue.set(value);
  }

  constructor() {
    this.loadInitialData();
    this.autoRefresh$.subscribe();
  }

  private loadInitialData() {
    this.isLoading.set(true);
    
    Promise.all([
      this.loadUsers(),
      this.loadProjects(),
      this.loadTasks(),
      this.loadTeamMembers()
    ]).finally(() => this.isLoading.set(false));
  }

  // ========================================
  // PROJECT METHODS (Required by ProjectsComponent)
  // ========================================

  /**
   * Get project by ID - REQUIRED BY ProjectsComponent
   */
  getProjectById(projectId: string): Observable<Project | null> {
    return this.http.get<Project>(`${this.API_URL}/projects/${projectId}`).pipe(
      catchError(error => {
        console.error('❌ Error finding project:', error);
        return of(null);
      })
    );
  }

  /**
   * Load projects via HTTP - REQUIRED BY ProjectsComponent
   */
  async loadProjectsViaHttp(): Promise<void> {
    console.log('📡 [STATE SERVICE] Loading projects via HTTP...');
    
    return new Promise((resolve, reject) => {
      this.http.get<Project[]>(`${this.API_URL}/projects`).pipe(
        retry(2),
        catchError(error => {
          console.error('❌ [STATE SERVICE] Error loading projects:', error);
          reject(error);
          return of(null);
        })
      ).subscribe({
        next: (projects) => {
          console.log('✅ [STATE SERVICE] Projects loaded via HTTP:', projects);
          if (projects) {
            this.projects.set(projects);
            this.projectsSubject$.next(projects);
          }
          resolve();
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Fetch projects with automatic retry on failure
   */
  private fetchProjectsWithRetry(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API_URL}/projects`).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.log(`🔄 Retry attempt ${retryCount} after error:`, error);
          return of(null).pipe(delay(Math.pow(2, retryCount - 1) * 1000));
        }
      }),
      catchError(error => {
        console.error('❌ Failed to fetch projects after retries:', error);
        return of([]);
      })
    );
  }

  /**
   * Load projects with advanced error handling and caching
   */
  loadProjectsViaHttpAdvanced(): Observable<Project[]> {
    console.log('📡 [STATE SERVICE] Loading projects from Java backend...');
    
    return this.http.get<Project[]>(`${this.API_URL}/projects`).pipe(
      tap(() => console.log('🔄 Fetching projects from Java backend...')),
      
      retryWhen(errors => 
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 3) {
              throw error;
            }
            console.log(`⚠️ Retry attempt ${retryCount + 1} after error`);
            return retryCount + 1;
          }, 0),
          delay(1000)
        )
      ),
      
      tap(projects => {
        console.log('✅ Projects loaded successfully from Java backend');
        this.projects.set(projects);
        this.projectsSubject$.next(projects);
      }),
      
      catchError(error => {
        console.error('❌ Error loading projects:', error);
        return throwError(() => new Error('Failed to load projects. Please try again.'));
      }),
      
      shareReplay({ bufferSize: 1, refCount: true }),
      
      finalize(() => console.log('🏁 Project loading completed'))
    );
  }

  /**
   * Add project to Java backend
   */
  addProjectViaHttpAdvanced(project: Omit<Project, 'id' | 'createdAt'>): Observable<Project> {
    console.log('📡 [STATE SERVICE] Adding project to Java backend...');
    
    const newProject = {
      ...project,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticProject = { id: tempId, ...newProject };
    this.projects.update(projects => [...projects, optimisticProject]);

    return this.http.post<Project>(`${this.API_URL}/projects`, newProject).pipe(
      retry(2),
      
      tap(createdProject => {
        console.log('✅ Project added successfully:', createdProject);
        this.projects.update(projects => 
          projects.map(p => p.id === tempId ? createdProject : p)
        );
        this.projectsSubject$.next(this.projects());
      }),
      
      catchError(error => {
        console.error('❌ Error adding project:', error);
        this.projects.update(projects => 
          projects.filter(p => p.id !== tempId)
        );
        return throwError(() => new Error('Failed to add project'));
      }),
      
      finalize(() => console.log('🏁 Add project operation completed'))
    );
  }

  /**
   * Update project in Java backend
   */
  updateProjectViaHttpAdvanced(projectId: string, updates: Partial<Project>): Observable<void> {
    console.log('📡 [STATE SERVICE] Updating project in Java backend...');
    
    const originalProjects = [...this.projects()];
    
    this.projects.update(projects => 
      projects.map(p => p.id === projectId ? { ...p, ...updates } : p)
    );

    return this.http.put<void>(`${this.API_URL}/projects/${projectId}`, updates).pipe(
      retry(2),
      
      tap(() => {
        console.log('✅ Project updated successfully');
        this.projectsSubject$.next(this.projects());
      }),
      
      catchError(error => {
        console.error('❌ Error updating project:', error);
        this.projects.set(originalProjects);
        return throwError(() => new Error('Failed to update project'));
      }),
      
      map(() => void 0)
    );
  }

  /**
   * Delete project from Java backend
   */
  deleteProjectViaHttpAdvanced(projectId: string): Observable<void> {
    console.log('📡 [STATE SERVICE] Deleting project from Java backend...');
    
    const originalProjects = [...this.projects()];
    
    this.projects.update(projects => projects.filter(p => p.id !== projectId));

    return this.http.delete<void>(`${this.API_URL}/projects/${projectId}`).pipe(
      retry(1),
      
      tap(() => {
        console.log('✅ Project deleted successfully');
        this.projectsSubject$.next(this.projects());
      }),
      
      switchMap(() => this.deleteRelatedTasks(projectId)),
      
      catchError(error => {
        console.error('❌ Error deleting project:', error);
        this.projects.set(originalProjects);
        return throwError(() => new Error('Failed to delete project'));
      }),
      
      map(() => void 0)
    );
  }

  /**
   * Delete tasks related to a project
   */
  private deleteRelatedTasks(projectId: string): Observable<void> {
    const relatedTasks = this.tasks().filter(t => t.projectId === projectId);
    
    if (relatedTasks.length === 0) {
      return of(void 0);
    }

    const deleteObservables = relatedTasks.map(task => 
      this.http.delete(`${this.API_URL}/tasks/${task.id}`)
    );

    return new Observable(observer => {
      Promise.all(deleteObservables.map(obs => obs.toPromise()))
        .then(() => {
          this.tasks.update(tasks => tasks.filter(t => t.projectId !== projectId));
          observer.next();
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  /**
   * Add project via HTTP (for backward compatibility)
   */
  async addProjectViaHttp(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    console.log('📡 [STATE SERVICE] Adding project via HTTP...');
    
    const newProject = {
      ...project,
      createdAt: new Date().toISOString().split('T')[0]
    };

    return new Promise((resolve, reject) => {
      this.http.post<Project>(`${this.API_URL}/projects`, newProject).pipe(
        retry(2),
        catchError(error => {
          console.error('❌ [STATE SERVICE] Error adding project:', error);
          reject(error);
          return throwError(() => error);
        })
      ).subscribe({
        next: (createdProject) => {
          console.log('✅ [STATE SERVICE] Project added via HTTP:', createdProject);
          this.projects.update(projects => [...projects, createdProject]);
          this.projectsSubject$.next(this.projects());
          resolve(createdProject);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Update project via HTTP (for backward compatibility)
   */
  async updateProjectViaHttp(projectId: string, updates: Partial<Project>): Promise<void> {
    console.log('📡 [STATE SERVICE] Updating project via HTTP...');
    
    return new Promise((resolve, reject) => {
      this.http.put<Project>(`${this.API_URL}/projects/${projectId}`, updates).pipe(
        retry(2),
        catchError(error => {
          console.error('❌ [STATE SERVICE] Error updating project:', error);
          reject(error);
          return throwError(() => error);
        })
      ).subscribe({
        next: (updatedProject) => {
          console.log('✅ [STATE SERVICE] Project updated via HTTP:', updatedProject);
          this.projects.update(projects => 
            projects.map(p => p.id === projectId ? updatedProject : p)
          );
          this.projectsSubject$.next(this.projects());
          resolve();
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Delete project via HTTP (for backward compatibility)
   */
  async deleteProjectViaHttp(projectId: string): Promise<void> {
    console.log('📡 [STATE SERVICE] Deleting project via HTTP...');
    
    return new Promise((resolve, reject) => {
      this.http.delete<void>(`${this.API_URL}/projects/${projectId}`).pipe(
        retry(1),
        catchError(error => {
          console.error('❌ [STATE SERVICE] Error deleting project:', error);
          reject(error);
          return throwError(() => error);
        })
      ).subscribe({
        next: () => {
          console.log('✅ [STATE SERVICE] Project deleted via HTTP');
          this.projects.update(projects => projects.filter(p => p.id !== projectId));
          this.projectsSubject$.next(this.projects());
          resolve();
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  // ========================================
  // OTHER DATA METHODS
  // ========================================

  private async loadUsers() {
    try {
      this.http.get<User[]>(`${this.API_URL}/users`).subscribe({
        next: (users) => {
          this.users.set(users);
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      });
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  /**
   * Load users via HTTP (for backward compatibility)
   */
  async loadUsersViaHttp(): Promise<void> {
    console.log('📡 [STATE SERVICE] Loading users via HTTP...');
    
    return new Promise((resolve, reject) => {
      this.http.get<User[]>(`${this.API_URL}/users`).pipe(
        retry(2),
        catchError(error => {
          console.error('❌ [STATE SERVICE] Error loading users:', error);
          reject(error);
          return of(null);
        })
      ).subscribe({
        next: (users) => {
          console.log('✅ [STATE SERVICE] Users loaded via HTTP:', users);
          if (users) {
            this.users.set(users);
          }
          resolve();
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  setCurrentUser(user: User | null) {
    this.currentUser.set(user);
    this.isAuthenticated.set(!!user);
  }

  async updateUser(userId: string, updates: Partial<User>) {
    try {
      this.http.put<User>(`${this.API_URL}/users/${userId}`, updates).subscribe({
        next: (updatedUser) => {
          this.users.update(users => 
            users.map(u => u.id === userId ? updatedUser : u)
          );
          if (this.currentUser()?.id === userId) {
            this.currentUser.set(updatedUser);
          }
        },
        error: (error) => {
          console.error('Error updating user:', error);
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  private async loadProjects() {
    try {
      this.http.get<Project[]>(`${this.API_URL}/projects`).subscribe({
        next: (projects) => {
          this.projects.set(projects);
          this.projectsSubject$.next(projects);
        },
        error: (error) => {
          console.error('Error loading projects:', error);
        }
      });
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  async addProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const newProject = {
      ...project,
      createdAt: new Date().toISOString().split('T')[0]
    };

    return new Promise((resolve, reject) => {
      this.http.post<Project>(`${this.API_URL}/projects`, newProject).subscribe({
        next: (createdProject) => {
          this.projects.update(projects => [...projects, createdProject]);
          this.projectsSubject$.next(this.projects());
          resolve(createdProject);
        },
        error: (error) => {
          console.error('Error adding project:', error);
          reject(error);
        }
      });
    });
  }

  async updateProject(projectId: string, updates: Partial<Project>) {
    try {
      this.http.put<Project>(`${this.API_URL}/projects/${projectId}`, updates).subscribe({
        next: (updatedProject) => {
          this.projects.update(projects => 
            projects.map(p => p.id === projectId ? updatedProject : p)
          );
          this.projectsSubject$.next(this.projects());
        },
        error: (error) => {
          console.error('Error updating project:', error);
        }
      });
    } catch (error) {
      console.error('Error updating project:', error);
    }
  }

  async deleteProject(projectId: string) {
    try {
      this.http.delete<void>(`${this.API_URL}/projects/${projectId}`).subscribe({
        next: () => {
          this.projects.update(projects => projects.filter(p => p.id !== projectId));
          this.tasks.update(tasks => tasks.filter(t => t.projectId !== projectId));
          this.projectsSubject$.next(this.projects());
        },
        error: (error) => {
          console.error('Error deleting project:', error);
        }
      });
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }

  private async loadTasks() {
    try {
      this.http.get<Task[]>(`${this.API_URL}/tasks`).subscribe({
        next: (tasks) => {
           console.log("jqwdjqwduj",tasks);
          this.tasks.set(tasks);
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
        }
      });
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const newTask = {
      ...task,
      createdAt: new Date().toISOString().split('T')[0]
    };

    return new Promise((resolve, reject) => {
      this.http.post<Task>(`${this.API_URL}/tasks`, newTask).subscribe({
        next: (createdTask) => {
          this.tasks.update(tasks => [...tasks, createdTask]);
          resolve(createdTask);
        },
        error: (error) => {
          console.error('Error adding task:', error);
          reject(error);
        }
      });
    });
  }

  async updateTask(taskId: string, updates: Partial<Task>) {
    try {
      this.http.put<Task>(`${this.API_URL}/tasks/${taskId}`, updates).subscribe({
        next: (updatedTask) => {
          this.tasks.update(tasks => 
            tasks.map(t => t.id === taskId ? updatedTask : t)
          );
        },
        error: (error) => {
          console.error('Error updating task:', error);
        }
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async deleteTask(taskId: string) {
    try {
      this.http.delete<void>(`${this.API_URL}/tasks/${taskId}`).subscribe({
        next: () => {
          this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  private async loadTeamMembers() {
    try {
      this.http.get<TeamMember[]>(`${this.API_URL}/teams`).subscribe({
        next: (teamMembers) => {
          this.teamMembers.set(teamMembers);
        },
        error: (error) => {
          console.error('Error loading team members:', error);
        }
      });
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  }

  /**
   * Trigger manual refresh
   */
  triggerRefresh(): void {
    this.refreshTrigger$.next();
  }

  /**
   * Get projects observable for direct subscription
   */
  getProjectsObservable(): Observable<Project[]> {
    return this.projects$;
  }
}