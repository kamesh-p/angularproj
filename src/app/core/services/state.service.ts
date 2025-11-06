import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, Project, Task, TeamMember } from '../../shared/models';
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
  
  readonly currentUser = signal<User | null>(null);
  readonly users = signal<User[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly tasks = signal<Task[]>([]);
  readonly teamMembers = signal<TeamMember[]>([]);
  readonly isAuthenticated = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  private searchValue = signal<string>('');
  readonly currentSearchValue = this.searchValue.asReadonly();

  setSearchValue(value: string) {
    this.searchValue.set(value);
  }
  constructor() {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    this.database = getDatabase(app);
    this.loadInitialData();
  }

  private loadInitialData() {
    this.isLoading.set(true);
    
    // Load all data in parallel
    Promise.all([
      this.loadUsers(),
      this.loadProjects(),
      this.loadTasks(),
      this.loadTeamMembers()
    ]).finally(() => this.isLoading.set(false));
  }

  // Firebase helper methods
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

  // User methods
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
      
      // Update local state
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

  // Project methods
  private async loadProjects() {
    try {
      const projectsData = await this.getData('projects');
      const projects = projectsData ? Object.keys(projectsData).map(key => ({
        id: key,
        ...projectsData[key]
      })) : [];
      this.projects.set(projects);
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
      
      // Update local state
      this.projects.update(projects => [...projects, createdProject]);
      return createdProject;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>) {
    try {
      await this.updateData(`projects/${projectId}`, updates);
      
      // Update local state
      this.projects.update(projects => 
        projects.map(p => p.id === projectId ? { ...p, ...updates } : p)
      );
    } catch (error) {
      console.error('Error updating project:', error);
    }
  }

  async deleteProject(projectId: string) {
    try {
      await this.removeData(`projects/${projectId}`);
      
      // Update local state
      this.projects.update(projects => projects.filter(p => p.id !== projectId));
      
      // Also delete associated tasks
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
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }

  // Task methods
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
      
      // Update local state
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
      
      // Update local state
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
      
      // Update local state
      this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  // Team member methods
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