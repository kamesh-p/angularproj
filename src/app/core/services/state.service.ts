import { Injectable, signal } from '@angular/core';
import { User, Project, Task, TeamMember } from '../../shared/models';

export interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  isAuthenticated: boolean;
}

const MOCK_DATA = {
  users: [
    { id: 'user-1', name: 'Raj Kumar', email: 'raj@taskflow.com', avatar: '👨‍💼', role: 'Admin', status: 'online' as const, createdAt: '2025-01-15' },
    { id: 'user-2', name: 'Priya Singh', email: 'priya@taskflow.com', avatar: '👩‍💻', role: 'Developer', status: 'online' as const, createdAt: '2025-02-10' },
    { id: 'user-3', name: 'Amit Patel', email: 'amit@taskflow.com', avatar: '👨‍🔧', role: 'Developer', status: 'offline' as const, createdAt: '2025-02-15' }
  ],
  projects: [
    { id: 'proj-1', name: 'Website Redesign', description: 'Complete redesign of company website with modern UI/UX', status: 'in_progress' as const, budget: 50000, startDate: '2025-01-01', endDate: '2025-03-31', owner: 'user-1', members: ['user-1', 'user-2'], createdAt: '2025-01-10' },
    { id: 'proj-2', name: 'Mobile App Development', description: 'Native iOS and Android mobile application', status: 'in_progress' as const, budget: 120000, startDate: '2024-11-01', endDate: '2025-06-30', owner: 'user-1', members: ['user-1', 'user-3'], createdAt: '2024-10-20' },
    { id: 'proj-3', name: 'Cloud Migration', description: 'Migrate infrastructure to AWS cloud', status: 'planned' as const, budget: 75000, startDate: '2025-04-01', endDate: '2025-08-31', owner: 'user-1', members: ['user-1', 'user-2', 'user-3'], createdAt: '2025-02-01' },
    { id: 'proj-4', name: 'API Documentation', description: 'Complete API documentation and guide', status: 'completed' as const, budget: 15000, startDate: '2024-12-01', endDate: '2025-01-30', owner: 'user-2', members: ['user-2'], createdAt: '2024-11-15' },
    { id: 'proj-5', name: 'Database Optimization', description: 'Optimize database performance and queries', status: 'in_progress' as const, budget: 35000, startDate: '2025-01-20', endDate: '2025-04-30', owner: 'user-3', members: ['user-3', 'user-2'], createdAt: '2025-01-18' }
  ],
  tasks: [
    { id: 'task-1', title: 'Design homepage mockup', description: 'Create initial mockup designs for the homepage', status: 'done' as const, priority: 'high' as const, assignedTo: ['user-2'], projectId: 'proj-1', dueDate: '2025-01-31', createdAt: '2025-01-15' },
    { id: 'task-2', title: 'Setup React project structure', description: 'Initialize React project with necessary dependencies', status: 'in_progress' as const, priority: 'high' as const, assignedTo: ['user-2'], projectId: 'proj-1', dueDate: '2025-02-15', createdAt: '2025-01-20' },
    { id: 'task-3', title: 'Create login component', description: 'Build authentication login component', status: 'in_progress' as const, priority: 'urgent' as const, assignedTo: ['user-3'], projectId: 'proj-1', dueDate: '2025-02-10', createdAt: '2025-01-25' },
    { id: 'task-4', title: 'Mobile UI Design', description: 'Design mobile interface for iOS application', status: 'in_progress' as const, priority: 'high' as const, assignedTo: ['user-2'], projectId: 'proj-2', dueDate: '2025-02-28', createdAt: '2025-01-10' },
    { id: 'task-5', title: 'API Backend Development', description: 'Build REST API endpoints for mobile app', status: 'todo' as const, priority: 'high' as const, assignedTo: ['user-3'], projectId: 'proj-2', dueDate: '2025-03-31', createdAt: '2025-01-15' },
    { id: 'task-6', title: 'Database Schema Design', description: 'Create and design database schema', status: 'done' as const, priority: 'urgent' as const, assignedTo: ['user-3'], projectId: 'proj-2', dueDate: '2025-01-28', createdAt: '2025-01-05' },
    { id: 'task-7', title: 'AWS Account Setup', description: 'Configure AWS account and VPC', status: 'todo' as const, priority: 'medium' as const, assignedTo: ['user-1'], projectId: 'proj-3', dueDate: '2025-04-15', createdAt: '2025-02-05' },
    { id: 'task-8', title: 'Review API Documentation', description: 'Review and approve final API documentation', status: 'done' as const, priority: 'medium' as const, assignedTo: ['user-1'], projectId: 'proj-4', dueDate: '2025-01-28', createdAt: '2025-01-20' },
    { id: 'task-9', title: 'Fix database indexes', description: 'Add missing database indexes for performance', status: 'in_progress' as const, priority: 'high' as const, assignedTo: ['user-3'], projectId: 'proj-5', dueDate: '2025-02-20', createdAt: '2025-02-01' },
    { id: 'task-10', title: 'Query optimization', description: 'Optimize slow running queries', status: 'todo' as const, priority: 'high' as const, assignedTo: ['user-3'], projectId: 'proj-5', dueDate: '2025-03-15', createdAt: '2025-02-03' },
    { id: 'task-11', title: 'Create API documentation guide', description: 'Write comprehensive API documentation', status: 'done' as const, priority: 'medium' as const, assignedTo: ['user-2'], projectId: 'proj-4', dueDate: '2025-01-25', createdAt: '2025-01-10' },
    { id: 'task-12', title: 'Setup CI/CD Pipeline', description: 'Configure GitHub Actions for automated deployment', status: 'todo' as const, priority: 'high' as const, assignedTo: ['user-2'], projectId: 'proj-1', dueDate: '2025-03-01', createdAt: '2025-02-08' },
    { id: 'task-13', title: 'Performance Testing', description: 'Run performance tests and optimize', status: 'todo' as const, priority: 'medium' as const, assignedTo: ['user-3'], projectId: 'proj-2', dueDate: '2025-04-15', createdAt: '2025-02-10' },
    { id: 'task-14', title: 'Security Audit', description: 'Conduct security audit and fix vulnerabilities', status: 'in_progress' as const, priority: 'urgent' as const, assignedTo: ['user-1'], projectId: 'proj-2', dueDate: '2025-02-25', createdAt: '2025-02-05' },
    { id: 'task-15', title: 'User Testing', description: 'Conduct user acceptance testing', status: 'todo' as const, priority: 'medium' as const, assignedTo: ['user-2'], projectId: 'proj-1', dueDate: '2025-03-20', createdAt: '2025-02-12' }
  ],
  teamMembers: [
    { id: 'team-1', name: 'Raj Kumar', email: 'raj@taskflow.com', avatar: '👨‍💼', role: 'Project Manager', status: 'online' as const, joinedAt: '2024-12-01' },
    { id: 'team-2', name: 'Priya Singh', email: 'priya@taskflow.com', avatar: '👩‍💻', role: 'Senior Developer', status: 'online' as const, joinedAt: '2024-12-10' },
    { id: 'team-3', name: 'Amit Patel', email: 'amit@taskflow.com', avatar: '👨‍🔧', role: 'DevOps Engineer', status: 'offline' as const, joinedAt: '2025-01-05' },
    { id: 'team-4', name: 'Sarah Johnson', email: 'sarah@taskflow.com', avatar: '👩‍🎨', role: 'UI/UX Designer', status: 'online' as const, joinedAt: '2025-01-15' },
    { id: 'team-5', name: 'Mike Chen', email: 'mike@taskflow.com', avatar: '👨‍💼', role: 'QA Engineer', status: 'online' as const, joinedAt: '2025-01-20' },
    { id: 'team-6', name: 'Emma Wilson', email: 'emma@taskflow.com', avatar: '👩‍💻', role: 'Full Stack Developer', status: 'offline' as const, joinedAt: '2025-02-01' },
    { id: 'team-7', name: 'David Brown', email: 'david@taskflow.com', avatar: '👨‍💻', role: 'Backend Developer', status: 'online' as const, joinedAt: '2025-02-05' },
    { id: 'team-8', name: 'Lisa Anderson', email: 'lisa@taskflow.com', avatar: '👩‍💼', role: 'Product Owner', status: 'online' as const, joinedAt: '2025-02-10' }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private state = signal<AppState>({
    currentUser: null,
    users: [...MOCK_DATA.users],
    projects: [...MOCK_DATA.projects],
    tasks: [...MOCK_DATA.tasks],
    teamMembers: [...MOCK_DATA.teamMembers],
    isAuthenticated: false
  });

  readonly currentUser = signal<User | null>(null);
  readonly users = signal<User[]>([...MOCK_DATA.users]);
  readonly projects = signal<Project[]>([...MOCK_DATA.projects]);
  readonly tasks = signal<Task[]>([...MOCK_DATA.tasks]);
  readonly teamMembers = signal<TeamMember[]>([...MOCK_DATA.teamMembers]);
  readonly isAuthenticated = signal<boolean>(false);

  getState() {
    return this.state();
  }

  setCurrentUser(user: User | null) {
    this.currentUser.set(user);
    this.state.update(s => ({ ...s, currentUser: user, isAuthenticated: !!user }));
  }

  setAuthenticated(value: boolean) {
    this.isAuthenticated.set(value);
    this.state.update(s => ({ ...s, isAuthenticated: value }));
  }

  updateUser(userId: string, updates: Partial<User>) {
    const userIndex = this.users().findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const updatedUsers = [...this.users()];
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...updates };
      this.users.set(updatedUsers);
      
      if (this.currentUser()?.id === userId) {
        this.currentUser.set(updatedUsers[userIndex]);
      }
      
      this.state.update(s => ({ ...s, users: updatedUsers }));
    }
  }

  addProject(project: Omit<Project, 'id' | 'createdAt'>) {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...project,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.projects.update(projects => [...projects, newProject]);
    this.state.update(s => ({ ...s, projects: [...s.projects, newProject] }));
    return newProject;
  }

  updateProject(projectId: string, updates: Partial<Project>) {
    const projectIndex = this.projects().findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      const updatedProjects = [...this.projects()];
      updatedProjects[projectIndex] = { ...updatedProjects[projectIndex], ...updates };
      this.projects.set(updatedProjects);
      this.state.update(s => ({ ...s, projects: updatedProjects }));
    }
  }

  deleteProject(projectId: string) {
    const updatedProjects = this.projects().filter(p => p.id !== projectId);
    const updatedTasks = this.tasks().filter(t => t.projectId !== projectId);
    this.projects.set(updatedProjects);
    this.tasks.set(updatedTasks);
    this.state.update(s => ({ ...s, projects: updatedProjects, tasks: updatedTasks }));
  }

  addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...task,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.tasks.update(tasks => [...tasks, newTask]);
    this.state.update(s => ({ ...s, tasks: [...s.tasks, newTask] }));
    return newTask;
  }

  updateTask(taskId: string, updates: Partial<Task>) {
    const taskIndex = this.tasks().findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const updatedTasks = [...this.tasks()];
      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updates };
      this.tasks.set(updatedTasks);
      this.state.update(s => ({ ...s, tasks: updatedTasks }));
    }
  }

  deleteTask(taskId: string) {
    const updatedTasks = this.tasks().filter(t => t.id !== taskId);
    this.tasks.set(updatedTasks);
    this.state.update(s => ({ ...s, tasks: updatedTasks }));
  }
}
