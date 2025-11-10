import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
 
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { 
        path: 'projects', 
        loadComponent: () => import('./features/projects/projects.component').then(m => m.ProjectsComponent)
      },
      { 
        path: 'tasks', 
        loadComponent: () => import('./features/tasks/tasks.component').then(m => m.TasksComponent)
      },
      { 
        path: 'team', 
        loadComponent: () => import('./features/team/team.component').then(m => m.TeamComponent)
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
    ]
  },
  // { path: '**', redirectTo: 'login' }
];