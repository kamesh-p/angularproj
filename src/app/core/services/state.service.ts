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
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, push, update, remove, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAn7Xg5stumYKFK0aU-G9hEpKjIUGc5DYM",
  authDomain: "food-app-http-request.firebaseapp.com",
  databaseURL: "https://food-app-http-request-default-rtdb.firebaseio.com",
  projectId: "food-app-http-request",
  storageBucket: "food-app-http-request.firebasestorage.app",
  messagingSenderId: "937563553862",
  appId: "1:937563553862:web:8a92dd30398c8e8c528a47"
};

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
  private database: Database;
  
  private firebaseUrl = 'https://food-app-http-request-default-rtdb.firebaseio.com';
  
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
    const app = initializeApp(firebaseConfig);
    this.database = getDatabase(app);
    this.loadInitialData();
    
    // Subscribe to auto-refresh
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
  // ADVANCED RxJS METHODS
  // ========================================

  /**
   * Fetch projects with automatic retry on failure
   * Uses retry operator with exponential backoff
   */
  private fetchProjectsWithRetry(): Observable<Project[]> {
    return this.http.get<any>(`${this.firebaseUrl}/projects.json`).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.log(`🔄 Retry attempt ${retryCount} after error:`, error);
          // Exponential backoff: 1s, 2s, 4s
          return of(null).pipe(delay(Math.pow(2, retryCount - 1) * 1000));
        }
      }),
      map(projectsData => {
        if (!projectsData) return [];
        return Object.keys(projectsData).map(key => ({
          id: key,
          ...projectsData[key]
        }));
      }),
      catchError(error => {
        console.error('❌ Failed to fetch projects after retries:', error);
        return of([]); // Return empty array as fallback
      })
    );
  }

  /**
   * Load projects with advanced error handling and caching
   */
  loadProjectsViaHttpAdvanced(): Observable<Project[]> {
    console.log('📡 [STATE SERVICE] Loading projects via HTTP with advanced operators...');
    
    return this.http.get<any>(`${this.firebaseUrl}/projects.json`).pipe(
      // Log the request
      tap(() => console.log('🔄 Fetching projects...')),
      
      // Retry 3 times with 1 second delay between attempts
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
      
      // Transform response
      map(projectsData => {
        console.log('✅ Projects loaded successfully');
        if (!projectsData) return [];
        return Object.keys(projectsData).map(key => ({
          id: key,
          ...projectsData[key]
        }));
      }),
      
      // Update signals
      tap(projects => {
        this.projects.set(projects);
        this.projectsSubject$.next(projects);
      }),
      
      // Handle errors gracefully
      catchError(error => {
        console.error('❌ Error loading projects:', error);
        return throwError(() => new Error('Failed to load projects. Please try again.'));
      }),
      
      // Cache the result for subsequent subscribers
      shareReplay({ bufferSize: 1, refCount: true }),
      
      // Cleanup logging
      finalize(() => console.log('🏁 Project loading completed'))
    );
  }

  /**
   * Get project by ID with caching and error handling
   */
  getProjectById(projectId: string): Observable<Project | null> {
    return this.projects$.pipe(
      map(projects => projects.find(p => p.id === projectId) || null),
      catchError(error => {
        console.error('❌ Error finding project:', error);
        return of(null);
      })
    );
  }

  /**
   * Search projects with debouncing
   */
  searchProjects(searchTerm$: Observable<string>): Observable<Project[]> {
    return searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        const lowerTerm = term.toLowerCase().trim();
        return this.projects$.pipe(
          map(projects => {
            if (!lowerTerm) return projects;
            return projects.filter(p => 
              p.name.toLowerCase().includes(lowerTerm) ||
              p.description.toLowerCase().includes(lowerTerm) ||
              p.status.toLowerCase().includes(lowerTerm)
            );
          })
        );
      }),
      catchError(error => {
        console.error('❌ Search error:', error);
        return of([]);
      })
    );
  }

  /**
   * Add project with optimistic updates and rollback on error
   */
  addProjectViaHttpAdvanced(project: Omit<Project, 'id' | 'createdAt'>): Observable<Project> {
    console.log('📡 [STATE SERVICE] Adding project via HTTP with advanced operators...');
    
    const newProject = {
      ...project,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticProject = { id: tempId, ...newProject };
    this.projects.update(projects => [...projects, optimisticProject]);

    return this.http.post<any>(`${this.firebaseUrl}/projects.json`, newProject).pipe(
      retry(2), // Retry twice on failure
      
      map(response => {
        const createdProject = { id: response.name, ...newProject };
        console.log('✅ Project added successfully:', createdProject);
        return createdProject;
      }),
      
      tap(createdProject => {
        // Replace optimistic update with real data
        this.projects.update(projects => 
          projects.map(p => p.id === tempId ? createdProject : p)
        );
        this.projectsSubject$.next(this.projects());
      }),
      
      catchError(error => {
        console.error('❌ Error adding project:', error);
        // Rollback optimistic update
        this.projects.update(projects => 
          projects.filter(p => p.id !== tempId)
        );
        return throwError(() => new Error('Failed to add project'));
      }),
      
      finalize(() => console.log('🏁 Add project operation completed'))
    );
  }

  /**
   * Update project with retry logic
   */
  updateProjectViaHttpAdvanced(projectId: string, updates: Partial<Project>): Observable<void> {
    console.log('📡 [STATE SERVICE] Updating project via HTTP...');
    
    // Store original state for rollback
    const originalProjects = [...this.projects()];
    
    // Optimistic update
    this.projects.update(projects => 
      projects.map(p => p.id === projectId ? { ...p, ...updates } : p)
    );

    return this.http.patch<any>(`${this.firebaseUrl}/projects/${projectId}.json`, updates).pipe(
      retry(2),
      
      tap(() => {
        console.log('✅ Project updated successfully');
        this.projectsSubject$.next(this.projects());
      }),
      
      catchError(error => {
        console.error('❌ Error updating project:', error);
        // Rollback to original state
        this.projects.set(originalProjects);
        return throwError(() => new Error('Failed to update project'));
      }),
      
      map(() => void 0) // Return void
    );
  }

  /**
   * Delete project with confirmation and cleanup
   */
  deleteProjectViaHttpAdvanced(projectId: string): Observable<void> {
    console.log('📡 [STATE SERVICE] Deleting project via HTTP...');
    
    // Store original state for rollback
    const originalProjects = [...this.projects()];
    
    // Optimistic delete
    this.projects.update(projects => projects.filter(p => p.id !== projectId));

    return this.http.delete<any>(`${this.firebaseUrl}/projects/${projectId}.json`).pipe(
      retry(1), // Retry once on failure
      
      tap(() => {
        console.log('✅ Project deleted successfully');
        this.projectsSubject$.next(this.projects());
      }),
      
      // Also delete related tasks
      switchMap(() => this.deleteRelatedTasks(projectId)),
      
      catchError(error => {
        console.error('❌ Error deleting project:', error);
        // Rollback deletion
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

    // Delete each task
    const deleteObservables = relatedTasks.map(task => 
      this.http.delete(`${this.firebaseUrl}/tasks/${task.id}.json`)
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

  // ========================================
  // EXISTING FIREBASE SDK METHODS (Keep these)
  // ========================================

  private async getData(path: string): Promise<any> {
    try {
      const dbRef = ref(this.database, path);
      const snapshot = await get(dbRef);
      return snapshot.val();
    } catch (error) {
      console.error(`Error fetching data from ${path}:`, error);
      throw error;
    }
  }

  private async setData(path: string, data: any): Promise<void> {
    try {
      const dbRef = ref(this.database, path);
      await set(dbRef, data);
    } catch (error) {
      console.error(`Error setting data at ${path}:`, error);
      throw error;
    }
  }

  private async pushData(path: string, data: any): Promise<string> {
    try {
      const dbRef = ref(this.database, path);
      const newRef = push(dbRef);
      await set(newRef, data);
      return newRef.key!;
    } catch (error) {
      console.error(`Error pushing data to ${path}:`, error);
      throw error;
    }
  }

  private async updateData(path: string, updates: any): Promise<void> {
    try {
      const dbRef = ref(this.database, path);
      await update(dbRef, updates);
    } catch (error) {
      console.error(`Error updating data at ${path}:`, error);
      throw error;
    }
  }

  private async removeData(path: string): Promise<void> {
    try {
      const dbRef = ref(this.database, path);
      await remove(dbRef);
    } catch (error) {
      console.error(`Error removing data at ${path}:`, error);
      throw error;
    }
  }

  // Original HTTP methods (keep these for backward compatibility)
  async loadUsersViaHttp() {
    console.log('📡 [STATE SERVICE] Loading users via HTTP...');
    
    this.http.get<any>(`${this.firebaseUrl}/users.json`)
      .pipe(
        retry(2),
        catchError(error => {
          console.error('❌ [STATE SERVICE] Error loading users:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (usersData) => {
          console.log('✅ [STATE SERVICE] Users loaded via HTTP:', usersData);
          const users = usersData ? Object.keys(usersData).map(key => ({
            id: key,
            ...usersData[key]
          })) : [];
          this.users.set(users);
        }
      });
  }

  async loadProjectsViaHttp() {
    console.log('📡 [STATE SERVICE] Loading projects via HTTP...');
    
    this.http.get<any>(`${this.firebaseUrl}/projects.json`)
      .pipe(
        retry(2),
        catchError(error => {
          console.error('❌ [STATE SERVICE] Error loading projects:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (projectsData) => {
          console.log('✅ [STATE SERVICE] Projects loaded via HTTP:', projectsData);
          const projects = projectsData ? Object.keys(projectsData).map(key => ({
            id: key,
            ...projectsData[key]
          })) : [];
          this.projects.set(projects);
        }
      });
  }

  async addProjectViaHttp(project: Omit<Project, 'id' | 'createdAt'>) {
    console.log('📡 [STATE SERVICE] Adding project via HTTP...');
    
    const newProject = {
      ...project,
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.http.post<any>(`${this.firebaseUrl}/projects.json`, newProject)
      .pipe(
        retry(2),
        catchError(error => {
          console.error('❌ [STATE SERVICE] Error adding project:', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('✅ [STATE SERVICE] Project added via HTTP:', response);
          const createdProject = { id: response.name, ...newProject };
          this.projects.update(projects => [...projects, createdProject]);
          return createdProject;
        }
      });
  }

  async updateProjectViaHttp(projectId: string, updates: Partial<Project>) {
    console.log('📡 [STATE SERVICE] Updating project via HTTP...');
    
    this.http.patch<any>(`${this.firebaseUrl}/projects/${projectId}.json`, updates)
      .pipe(
        retry(2),
        catchError(error => {
          console.error('❌ [STATE SERVICE] Error updating project:', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('✅ [STATE SERVICE] Project updated via HTTP:', response);
          this.projects.update(projects => 
            projects.map(p => p.id === projectId ? { ...p, ...updates } : p)
          );
        }
      });
  }

  async deleteProjectViaHttp(projectId: string) {
    console.log('📡 [STATE SERVICE] Deleting project via HTTP...');
    
    this.http.delete<any>(`${this.firebaseUrl}/projects/${projectId}.json`)
      .pipe(
        retry(1),
        catchError(error => {
          console.error('❌ [STATE SERVICE] Error deleting project:', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('✅ [STATE SERVICE] Project deleted via HTTP:', response);
          this.projects.update(projects => projects.filter(p => p.id !== projectId));
        }
      });
  }

  // Keep all your existing Firebase SDK methods
  private async loadUsers() {
    try {
      const usersData = await this.getData('users');
      const users = usersData ? Object.keys(usersData).map(key => ({
        id: key,
        ...usersData[key]
      })) : [];
      this.users.set(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  setCurrentUser(user: User | null) {
    this.currentUser.set(user);
    this.isAuthenticated.set(!!user);
  }

  async updateUser(userId: string, updates: Partial<User>) {
    try {
      await this.updateData(`users/${userId}`, updates);
      this.users.update(users => 
        users.map(u => u.id === userId ? { ...u, ...updates } : u)
      );
      if (this.currentUser()?.id === userId) {
        this.currentUser.set({ ...this.currentUser(), ...updates } as User);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  private async loadProjects() {
    try {
      const projectsData = await this.getData('projects');
      const projects = projectsData ? Object.keys(projectsData).map(key => ({
        id: key,
        ...projectsData[key]
      })) : [];
      this.projects.set(projects);
      this.projectsSubject$.next(projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  async addProject(project: Omit<Project, 'id' | 'createdAt'>) {
    const newProject = {
      ...project,
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      const projectId = await this.pushData('projects', newProject);
      const createdProject = { id: projectId, ...newProject };
      this.projects.update(projects => [...projects, createdProject]);
      this.projectsSubject$.next(this.projects());
      return createdProject;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>) {
    try {
      await this.updateData(`projects/${projectId}`, updates);
      this.projects.update(projects => 
        projects.map(p => p.id === projectId ? { ...p, ...updates } : p)
      );
      this.projectsSubject$.next(this.projects());
    } catch (error) {
      console.error('Error updating project:', error);
    }
  }

  async deleteProject(projectId: string) {
    try {
      await this.removeData(`projects/${projectId}`);
      this.projects.update(projects => projects.filter(p => p.id !== projectId));
      
      const tasksData = await this.getData('tasks');
      if (tasksData) {
        const taskUpdates: any = {};
        Object.keys(tasksData).forEach(taskId => {
          if (tasksData[taskId].projectId === projectId) {
            taskUpdates[`tasks/${taskId}`] = null;
          }
        });
        if (Object.keys(taskUpdates).length > 0) {
          await this.updateData('/', taskUpdates);
        }
      }
      
      this.tasks.update(tasks => tasks.filter(t => t.projectId !== projectId));
      this.projectsSubject$.next(this.projects());
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }

  private async loadTasks() {
    try {
      const tasksData = await this.getData('tasks');
      const tasks = tasksData ? Object.keys(tasksData).map(key => ({
        id: key,
        ...tasksData[key]
      })) : [];
      this.tasks.set(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const newTask = {
      ...task,
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      const taskId = await this.pushData('tasks', newTask);
      const createdTask = { id: taskId, ...newTask };
      this.tasks.update(tasks => [...tasks, createdTask]);
      return createdTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>) {
    try {
      await this.updateData(`tasks/${taskId}`, updates);
      this.tasks.update(tasks => 
        tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async deleteTask(taskId: string) {
    try {
      await this.removeData(`tasks/${taskId}`);
      this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  private async loadTeamMembers() {
    try {
      const teamMembersData = await this.getData('teamMembers');
      const teamMembers = teamMembersData ? Object.keys(teamMembersData).map(key => ({
        id: key,
        ...teamMembersData[key]
      })) : [];
      this.teamMembers.set(teamMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  }
}
