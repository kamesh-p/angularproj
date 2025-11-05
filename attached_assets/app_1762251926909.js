// ============================================
// DATA MODELS AND MOCK DATA
// ============================================

const MOCK_DATA = {
  users: [
    { id: 'user-1', name: 'Raj Kumar', email: 'raj@taskflow.com', avatar: '👨‍💼', role: 'Admin', status: 'online', createdAt: '2025-01-15' },
    { id: 'user-2', name: 'Priya Singh', email: 'priya@taskflow.com', avatar: '👩‍💻', role: 'Developer', status: 'online', createdAt: '2025-02-10' },
    { id: 'user-3', name: 'Amit Patel', email: 'amit@taskflow.com', avatar: '👨‍🔧', role: 'Developer', status: 'offline', createdAt: '2025-02-15' }
  ],
  projects: [
    { id: 'proj-1', name: 'Website Redesign', description: 'Complete redesign of company website with modern UI/UX', status: 'in_progress', budget: 50000, startDate: '2025-01-01', endDate: '2025-03-31', owner: 'user-1', members: ['user-1', 'user-2'], createdAt: '2025-01-10' },
    { id: 'proj-2', name: 'Mobile App Development', description: 'Native iOS and Android mobile application', status: 'in_progress', budget: 120000, startDate: '2024-11-01', endDate: '2025-06-30', owner: 'user-1', members: ['user-1', 'user-3'], createdAt: '2024-10-20' },
    { id: 'proj-3', name: 'Cloud Migration', description: 'Migrate infrastructure to AWS cloud', status: 'planned', budget: 75000, startDate: '2025-04-01', endDate: '2025-08-31', owner: 'user-1', members: ['user-1', 'user-2', 'user-3'], createdAt: '2025-02-01' },
    { id: 'proj-4', name: 'API Documentation', description: 'Complete API documentation and guide', status: 'completed', budget: 15000, startDate: '2024-12-01', endDate: '2025-01-30', owner: 'user-2', members: ['user-2'], createdAt: '2024-11-15' },
    { id: 'proj-5', name: 'Database Optimization', description: 'Optimize database performance and queries', status: 'in_progress', budget: 35000, startDate: '2025-01-20', endDate: '2025-04-30', owner: 'user-3', members: ['user-3', 'user-2'], createdAt: '2025-01-18' }
  ],
  tasks: [
    { id: 'task-1', title: 'Design homepage mockup', description: 'Create initial mockup designs for the homepage', status: 'done', priority: 'high', assignedTo: ['user-2'], projectId: 'proj-1', dueDate: '2025-01-31', createdAt: '2025-01-15' },
    { id: 'task-2', title: 'Setup React project structure', description: 'Initialize React project with necessary dependencies', status: 'in_progress', priority: 'high', assignedTo: ['user-2'], projectId: 'proj-1', dueDate: '2025-02-15', createdAt: '2025-01-20' },
    { id: 'task-3', title: 'Create login component', description: 'Build authentication login component', status: 'in_progress', priority: 'urgent', assignedTo: ['user-3'], projectId: 'proj-1', dueDate: '2025-02-10', createdAt: '2025-01-25' },
    { id: 'task-4', title: 'Mobile UI Design', description: 'Design mobile interface for iOS application', status: 'in_progress', priority: 'high', assignedTo: ['user-2'], projectId: 'proj-2', dueDate: '2025-02-28', createdAt: '2025-01-10' },
    { id: 'task-5', title: 'API Backend Development', description: 'Build REST API endpoints for mobile app', status: 'todo', priority: 'high', assignedTo: ['user-3'], projectId: 'proj-2', dueDate: '2025-03-31', createdAt: '2025-01-15' },
    { id: 'task-6', title: 'Database Schema Design', description: 'Create and design database schema', status: 'done', priority: 'urgent', assignedTo: ['user-3'], projectId: 'proj-2', dueDate: '2025-01-28', createdAt: '2025-01-05' },
    { id: 'task-7', title: 'AWS Account Setup', description: 'Configure AWS account and VPC', status: 'todo', priority: 'medium', assignedTo: ['user-1'], projectId: 'proj-3', dueDate: '2025-04-15', createdAt: '2025-02-05' },
    { id: 'task-8', title: 'Review API Documentation', description: 'Review and approve final API documentation', status: 'done', priority: 'medium', assignedTo: ['user-1'], projectId: 'proj-4', dueDate: '2025-01-28', createdAt: '2025-01-20' },
    { id: 'task-9', title: 'Fix database indexes', description: 'Add missing database indexes for performance', status: 'in_progress', priority: 'high', assignedTo: ['user-3'], projectId: 'proj-5', dueDate: '2025-02-20', createdAt: '2025-02-01' },
    { id: 'task-10', title: 'Query optimization', description: 'Optimize slow running queries', status: 'todo', priority: 'high', assignedTo: ['user-3'], projectId: 'proj-5', dueDate: '2025-03-15', createdAt: '2025-02-03' },
    { id: 'task-11', title: 'Create API documentation guide', description: 'Write comprehensive API documentation', status: 'done', priority: 'medium', assignedTo: ['user-2'], projectId: 'proj-4', dueDate: '2025-01-25', createdAt: '2025-01-10' },
    { id: 'task-12', title: 'Setup CI/CD Pipeline', description: 'Configure GitHub Actions for automated deployment', status: 'todo', priority: 'high', assignedTo: ['user-2'], projectId: 'proj-1', dueDate: '2025-03-01', createdAt: '2025-02-08' },
    { id: 'task-13', title: 'Performance Testing', description: 'Run performance tests and optimize', status: 'todo', priority: 'medium', assignedTo: ['user-3'], projectId: 'proj-2', dueDate: '2025-04-15', createdAt: '2025-02-10' },
    { id: 'task-14', title: 'Security Audit', description: 'Conduct security audit and fix vulnerabilities', status: 'in_progress', priority: 'urgent', assignedTo: ['user-1'], projectId: 'proj-2', dueDate: '2025-02-25', createdAt: '2025-02-05' },
    { id: 'task-15', title: 'User Testing', description: 'Conduct user acceptance testing', status: 'todo', priority: 'medium', assignedTo: ['user-2'], projectId: 'proj-1', dueDate: '2025-03-20', createdAt: '2025-02-12' }
  ],
  teamMembers: [
    { id: 'team-1', name: 'Raj Kumar', email: 'raj@taskflow.com', avatar: '👨‍💼', role: 'Project Manager', status: 'online', joinedAt: '2024-12-01' },
    { id: 'team-2', name: 'Priya Singh', email: 'priya@taskflow.com', avatar: '👩‍💻', role: 'Senior Developer', status: 'online', joinedAt: '2024-12-10' },
    { id: 'team-3', name: 'Amit Patel', email: 'amit@taskflow.com', avatar: '👨‍🔧', role: 'DevOps Engineer', status: 'offline', joinedAt: '2025-01-05' },
    { id: 'team-4', name: 'Sarah Johnson', email: 'sarah@taskflow.com', avatar: '👩‍🎨', role: 'UI/UX Designer', status: 'online', joinedAt: '2025-01-15' },
    { id: 'team-5', name: 'Mike Chen', email: 'mike@taskflow.com', avatar: '👨‍💼', role: 'QA Engineer', status: 'online', joinedAt: '2025-01-20' },
    { id: 'team-6', name: 'Emma Wilson', email: 'emma@taskflow.com', avatar: '👩‍💻', role: 'Full Stack Developer', status: 'offline', joinedAt: '2025-02-01' },
    { id: 'team-7', name: 'David Brown', email: 'david@taskflow.com', avatar: '👨‍💻', role: 'Backend Developer', status: 'online', joinedAt: '2025-02-05' },
    { id: 'team-8', name: 'Lisa Anderson', email: 'lisa@taskflow.com', avatar: '👩‍💼', role: 'Product Owner', status: 'online', joinedAt: '2025-02-10' }
  ]
};

// ============================================
// STATE MANAGEMENT SERVICE
// ============================================

class StateManager {
  constructor() {
    this.state = {
      currentUser: null,
      users: [...MOCK_DATA.users],
      projects: [...MOCK_DATA.projects],
      tasks: [...MOCK_DATA.tasks],
      teamMembers: [...MOCK_DATA.teamMembers],
      isAuthenticated: false
    };
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  getState() {
    return this.state;
  }

  login(email, password) {
    const user = this.state.users.find(u => u.email === email);
    if (user) {
      this.state.currentUser = user;
      this.state.isAuthenticated = true;
      this.notify();
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  }

  logout() {
    this.state.currentUser = null;
    this.state.isAuthenticated = false;
    this.notify();
  }

  updateUser(userId, updates) {
    const index = this.state.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.state.users[index] = { ...this.state.users[index], ...updates };
      if (this.state.currentUser?.id === userId) {
        this.state.currentUser = this.state.users[index];
      }
      this.notify();
    }
  }

  addProject(project) {
    const newProject = {
      id: `proj-${Date.now()}`,
      ...project,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.state.projects.push(newProject);
    this.notify();
    return newProject;
  }

  updateProject(projectId, updates) {
    const index = this.state.projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      this.state.projects[index] = { ...this.state.projects[index], ...updates };
      this.notify();
    }
  }

  deleteProject(projectId) {
    this.state.projects = this.state.projects.filter(p => p.id !== projectId);
    this.state.tasks = this.state.tasks.filter(t => t.projectId !== projectId);
    this.notify();
  }

  addTask(task) {
    const newTask = {
      id: `task-${Date.now()}`,
      ...task,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.state.tasks.push(newTask);
    this.notify();
    return newTask;
  }

  updateTask(taskId, updates) {
    const index = this.state.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.state.tasks[index] = { ...this.state.tasks[index], ...updates };
      this.notify();
    }
  }

  deleteTask(taskId) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
    this.notify();
  }
}

const stateManager = new StateManager();

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showLoading() {
  document.getElementById('loading-spinner').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-spinner').classList.add('hidden');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function showConfirmation(title, message, onConfirm) {
  const modal = document.getElementById('confirmation-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const confirmBtn = document.getElementById('modal-confirm');
  const cancelBtn = document.getElementById('modal-cancel');
  
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.classList.remove('hidden');
  
  const handleConfirm = () => {
    onConfirm();
    modal.classList.add('hidden');
    cleanup();
  };
  
  const handleCancel = () => {
    modal.classList.add('hidden');
    cleanup();
  };
  
  const cleanup = () => {
    confirmBtn.removeEventListener('click', handleConfirm);
    cancelBtn.removeEventListener('click', handleCancel);
  };
  
  confirmBtn.addEventListener('click', handleConfirm);
  cancelBtn.addEventListener('click', handleCancel);
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function truncate(text, length = 100) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// ============================================
// ROUTER
// ============================================

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  register(path, component) {
    this.routes[path] = component;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/login';
    const [path, ...params] = hash.split('/');
    const route = this.routes[`/${path}`] || this.routes[hash];
    
    if (route) {
      this.currentRoute = hash;
      route(params);
    } else {
      this.navigate('/login');
    }
  }

  getCurrentRoute() {
    return this.currentRoute;
  }
}

const router = new Router();

// ============================================
// AUTH GUARD
// ============================================

function requireAuth(callback) {
  return (...args) => {
    const state = stateManager.getState();
    if (!state.isAuthenticated) {
      router.navigate('/login');
      return;
    }
    callback(...args);
  };
}

// ============================================
// COMPONENTS
// ============================================

// Login Component
function LoginPage() {
  const container = document.getElementById('app-container');
  container.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🚀 TaskFlow</h1>
          <p>Project Management & Collaboration Platform</p>
        </div>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              class="form-control" 
              placeholder="Enter your email"
              required
            />
            <div class="form-error" id="email-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              class="form-control" 
              placeholder="Enter your password"
              required
            />
            <div class="form-error" id="password-error"></div>
          </div>
          <div class="form-group">
            <div class="checkbox-group">
              <input type="checkbox" id="remember" />
              <label for="remember">Remember me</label>
            </div>
          </div>
          <button type="submit" class="btn btn--primary w-full">Sign In</button>
          <div class="form-error" id="login-error" style="text-align: center; margin-top: 12px;"></div>
        </form>
        <div class="login-links">
          <p>Test credentials: raj@taskflow.com (any password)</p>
          <p><a href="#">Forgot password?</a> | <a href="#">Create account</a></p>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.textContent = '';
    
    if (!email || !password) {
      errorDiv.textContent = 'Please fill in all fields';
      return;
    }
    
    showLoading();
    
    setTimeout(() => {
      const result = stateManager.login(email, password);
      hideLoading();
      
      if (result.success) {
        showToast('Login successful! Welcome back.', 'success');
        router.navigate('/dashboard');
      } else {
        errorDiv.textContent = 'Invalid email or password';
      }
    }, 500);
  });
}

// App Layout Component
function AppLayout(content) {
  const state = stateManager.getState();
  const currentUser = state.currentUser;
  const currentPath = router.getCurrentRoute();
  
  const container = document.getElementById('app-container');
  container.innerHTML = `
    <div class="app-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">🚀 TaskFlow</div>
        </div>
        <nav class="sidebar-nav">
          <a href="#/dashboard" class="nav-item ${currentPath === '/dashboard' ? 'active' : ''}">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#/projects" class="nav-item ${currentPath === '/projects' ? 'active' : ''}">
            <span class="nav-icon">📁</span>
            <span>Projects</span>
          </a>
          <a href="#/tasks" class="nav-item ${currentPath === '/tasks' ? 'active' : ''}">
            <span class="nav-icon">✓</span>
            <span>Tasks</span>
          </a>
          <a href="#/team" class="nav-item ${currentPath === '/team' ? 'active' : ''}">
            <span class="nav-icon">👥</span>
            <span>Team</span>
          </a>
          <a href="#/profile" class="nav-item ${currentPath === '/profile' ? 'active' : ''}">
            <span class="nav-icon">👤</span>
            <span>Profile</span>
          </a>
          <a href="#" class="nav-item" id="logout-btn">
            <span class="nav-icon">🚪</span>
            <span>Logout</span>
          </a>
        </nav>
      </aside>
      
      <div class="main-content">
        <header class="app-header">
          <div class="header-left">
            <button class="menu-toggle" id="menu-toggle">☰</button>
            <div class="search-bar">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search projects, tasks..." id="global-search" />
            </div>
          </div>
          <div class="header-right">
            <button class="icon-button">
              <span>🔔</span>
              <span class="notification-badge">3</span>
            </button>
            <div class="user-menu">
              <div class="user-avatar">${currentUser?.avatar || '👤'}</div>
            </div>
          </div>
        </header>
        
        <div class="content-area" id="content-area">
          ${content}
        </div>
      </div>
    </div>
  `;

  // Menu toggle for mobile
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showConfirmation(
      'Confirm Logout',
      'Are you sure you want to logout?',
      () => {
        stateManager.logout();
        showToast('Logged out successfully', 'success');
        router.navigate('/login');
      }
    );
  });
}

// Dashboard Page
function DashboardPage() {
  const state = stateManager.getState();
  const totalProjects = state.projects.length;
  const activeTasks = state.tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = state.tasks.filter(t => t.status === 'done').length;
  const totalTasks = state.tasks.length;
  
  const recentTasks = state.tasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const content = `
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-description">Welcome back, ${state.currentUser?.name || 'User'}! Here's your project overview.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">📁</div>
        <div class="stat-content">
          <h3>${totalProjects}</h3>
          <p>Total Projects</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">⚡</div>
        <div class="stat-content">
          <h3>${activeTasks}</h3>
          <p>Active Tasks</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✓</div>
        <div class="stat-content">
          <h3>${completedTasks}</h3>
          <p>Completed Tasks</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">📋</div>
        <div class="stat-content">
          <h3>${totalTasks}</h3>
          <p>Total Tasks</p>
        </div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: 1fr;">
      <div class="card">
        <div class="card-body">
          <h2 class="section-title">Recent Activities</h2>
          <div class="activity-list">
            ${recentTasks.map(task => {
              const user = state.users.find(u => task.assignedTo.includes(u.id));
              return `
                <div class="activity-item">
                  <div class="activity-avatar">${user?.avatar || '👤'}</div>
                  <div class="activity-content">
                    <p class="activity-text">
                      <strong>${user?.name || 'Unknown'}</strong> ${task.status === 'done' ? 'completed' : 'is working on'} 
                      <strong>${task.title}</strong>
                    </p>
                    <p class="activity-time">${timeAgo(task.createdAt)}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-2 mt-16">
      <div class="card">
        <div class="card-body">
          <h2 class="section-title">Quick Actions</h2>
          <div class="flex flex-col gap-8">
            <button class="btn btn--primary w-full" onclick="router.navigate('/projects/new')">+ Create New Project</button>
            <button class="btn btn--secondary w-full" onclick="router.navigate('/tasks/new')">+ Add New Task</button>
            <button class="btn btn--secondary w-full" onclick="router.navigate('/team')">View Team Members</button>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-body">
          <h2 class="section-title">Task Summary</h2>
          <div class="flex flex-col gap-12">
            <div>
              <div class="flex justify-between mb-8">
                <span>Todo</span>
                <span class="badge badge--todo">${state.tasks.filter(t => t.status === 'todo').length}</span>
              </div>
              <div class="flex justify-between mb-8">
                <span>In Progress</span>
                <span class="badge badge--in_progress">${activeTasks}</span>
              </div>
              <div class="flex justify-between">
                <span>Completed</span>
                <span class="badge badge--done">${completedTasks}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  AppLayout(content);
}

// Projects Page
function ProjectsPage() {
  const state = stateManager.getState();
  let filteredProjects = [...state.projects];
  
  function renderProjects(projects, searchTerm = '', statusFilter = 'all') {
    let filtered = projects;
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    const grid = document.getElementById('projects-grid');
    
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📁</div>
          <h3 class="empty-state-title">No projects found</h3>
          <p class="empty-state-description">Try adjusting your filters or create a new project.</p>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = filtered.map(project => {
      const memberCount = project.members.length;
      return `
        <div class="project-card" onclick="router.navigate('/project/${project.id}')">
          <div class="project-card-header">
            <div>
              <h3 class="project-card-title">${project.name}</h3>
              <span class="badge badge--${project.status}">${project.status.replace('_', ' ')}</span>
            </div>
          </div>
          <p class="project-card-description">${truncate(project.description, 100)}</p>
          <div class="project-card-meta">
            <div><strong>Budget:</strong> ${formatCurrency(project.budget)}</div>
            <div><strong>Timeline:</strong> ${formatDate(project.startDate)} - ${formatDate(project.endDate)}</div>
          </div>
          <div class="project-card-footer">
            <div class="project-members">
              <span>👥</span>
              <span>${memberCount} member${memberCount !== 1 ? 's' : ''}</span>
            </div>
            <button class="btn btn--sm btn--secondary" onclick="event.stopPropagation(); router.navigate('/project/${project.id}/edit')">
              Edit
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
  
  const content = `
    <div class="page-header">
      <h1 class="page-title">Projects</h1>
      <p class="page-description">Manage and track all your projects</p>
    </div>

    <div class="page-actions">
      <div class="filter-group">
        <input type="text" class="form-control" placeholder="Search projects..." id="search-projects" />
        <select class="form-control" id="filter-status">
          <option value="all">All Status</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <button class="btn btn--primary" onclick="router.navigate('/projects/new')">+ New Project</button>
    </div>

    <div class="grid grid-2" id="projects-grid"></div>
  `;

  AppLayout(content);
  renderProjects(filteredProjects);
  
  document.getElementById('search-projects')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    const statusFilter = document.getElementById('filter-status').value;
    renderProjects(state.projects, searchTerm, statusFilter);
  });
  
  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    const searchTerm = document.getElementById('search-projects').value;
    const statusFilter = e.target.value;
    renderProjects(state.projects, searchTerm, statusFilter);
  });
}

// Project Detail Page
function ProjectDetailPage(params) {
  const projectId = params[0];
  const state = stateManager.getState();
  const project = state.projects.find(p => p.id === projectId);
  
  if (!project) {
    router.navigate('/projects');
    return;
  }
  
  const owner = state.users.find(u => u.id === project.owner);
  const members = project.members.map(id => state.users.find(u => u.id === id)).filter(Boolean);
  const projectTasks = state.tasks.filter(t => t.projectId === projectId);
  
  const content = `
    <div class="detail-container">
      <div class="page-actions" style="margin-bottom: 24px;">
        <button class="btn btn--secondary" onclick="router.navigate('/projects')">← Back to Projects</button>
        <div class="flex gap-8">
          <button class="btn btn--primary" onclick="router.navigate('/project/${project.id}/edit')">Edit Project</button>
          <button class="btn btn--danger" onclick="deleteProject('${project.id}')">Delete Project</button>
        </div>
      </div>

      <div class="detail-header">
        <div class="flex justify-between items-center mb-16">
          <h1 class="detail-title">${project.name}</h1>
          <span class="badge badge--${project.status}">${project.status.replace('_', ' ')}</span>
        </div>
        <p>${project.description}</p>
        <div class="detail-meta">
          <div class="meta-item">
            <span class="meta-label">Budget</span>
            <span class="meta-value">${formatCurrency(project.budget)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Start Date</span>
            <span class="meta-value">${formatDate(project.startDate)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">End Date</span>
            <span class="meta-value">${formatDate(project.endDate)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Owner</span>
            <span class="meta-value">${owner?.name || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h2 class="section-title">Team Members (${members.length})</h2>
        <div class="grid grid-3">
          ${members.map(member => `
            <div class="card">
              <div class="card-body" style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 12px;">${member.avatar}</div>
                <h3 style="margin-bottom: 4px;">${member.name}</h3>
                <p style="color: var(--color-text-secondary); font-size: 14px; margin: 0;">${member.role}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="detail-section">
        <h2 class="section-title">Project Tasks (${projectTasks.length})</h2>
        ${projectTasks.length > 0 ? `
          <div class="grid grid-2">
            ${projectTasks.map(task => `
              <div class="task-card" onclick="router.navigate('/task/${task.id}')">
                <div class="task-card-header">
                  <h3 class="task-card-title">${task.title}</h3>
                  <span class="badge badge--${task.priority}">${task.priority}</span>
                </div>
                <p class="task-card-description">${truncate(task.description, 80)}</p>
                <div class="task-card-footer">
                  <span class="badge badge--${task.status}">${task.status.replace('_', ' ')}</span>
                  <span>Due: ${formatDate(task.dueDate)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">✓</div>
            <p class="empty-state-description">No tasks in this project yet.</p>
          </div>
        `}
      </div>
    </div>
  `;

  AppLayout(content);
}

function deleteProject(projectId) {
  showConfirmation(
    'Delete Project',
    'Are you sure you want to delete this project? All associated tasks will also be deleted.',
    () => {
      stateManager.deleteProject(projectId);
      showToast('Project deleted successfully', 'success');
      router.navigate('/projects');
    }
  );
}

// Tasks Page
function TasksPage() {
  const state = stateManager.getState();
  
  function renderTasks(searchTerm = '', statusFilter = 'all', priorityFilter = 'all') {
    let filtered = state.tasks;
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    
    const todoTasks = filtered.filter(t => t.status === 'todo');
    const inProgressTasks = filtered.filter(t => t.status === 'in_progress');
    const doneTasks = filtered.filter(t => t.status === 'done');
    
    function renderTaskCard(task) {
      const assignee = state.users.find(u => task.assignedTo.includes(u.id));
      return `
        <div class="task-card" onclick="router.navigate('/task/${task.id}')">
          <div class="task-card-header">
            <h3 class="task-card-title">${task.title}</h3>
            <span class="badge badge--${task.priority}">${task.priority}</span>
          </div>
          <p class="task-card-description">${truncate(task.description, 80)}</p>
          <div class="task-card-footer">
            <div class="flex items-center gap-8">
              <span>${assignee?.avatar || '👤'}</span>
              <span style="font-size: 12px;">${assignee?.name || 'Unassigned'}</span>
            </div>
            <span>Due: ${formatDate(task.dueDate)}</span>
          </div>
        </div>
      `;
    }
    
    document.getElementById('todo-column').innerHTML = todoTasks.map(renderTaskCard).join('') || 
      '<div class="empty-state"><p class="empty-state-description">No tasks</p></div>';
    document.getElementById('inprogress-column').innerHTML = inProgressTasks.map(renderTaskCard).join('') || 
      '<div class="empty-state"><p class="empty-state-description">No tasks</p></div>';
    document.getElementById('done-column').innerHTML = doneTasks.map(renderTaskCard).join('') || 
      '<div class="empty-state"><p class="empty-state-description">No tasks</p></div>';
    
    document.getElementById('todo-count').textContent = todoTasks.length;
    document.getElementById('inprogress-count').textContent = inProgressTasks.length;
    document.getElementById('done-count').textContent = doneTasks.length;
  }
  
  const content = `
    <div class="page-header">
      <h1 class="page-title">Tasks</h1>
      <p class="page-description">Manage your tasks with Kanban board</p>
    </div>

    <div class="page-actions">
      <div class="filter-group">
        <input type="text" class="form-control" placeholder="Search tasks..." id="search-tasks" />
        <select class="form-control" id="filter-status">
          <option value="all">All Status</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select class="form-control" id="filter-priority">
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <button class="btn btn--primary" onclick="router.navigate('/tasks/new')">+ New Task</button>
    </div>

    <div class="kanban-board">
      <div class="kanban-column">
        <div class="kanban-header">
          <h3 class="kanban-title">📋 Todo</h3>
          <span class="kanban-count" id="todo-count">0</span>
        </div>
        <div id="todo-column"></div>
      </div>
      
      <div class="kanban-column">
        <div class="kanban-header">
          <h3 class="kanban-title">⚡ In Progress</h3>
          <span class="kanban-count" id="inprogress-count">0</span>
        </div>
        <div id="inprogress-column"></div>
      </div>
      
      <div class="kanban-column">
        <div class="kanban-header">
          <h3 class="kanban-title">✓ Done</h3>
          <span class="kanban-count" id="done-count">0</span>
        </div>
        <div id="done-column"></div>
      </div>
    </div>
  `;

  AppLayout(content);
  renderTasks();
  
  document.getElementById('search-tasks')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    const statusFilter = document.getElementById('filter-status').value;
    const priorityFilter = document.getElementById('filter-priority').value;
    renderTasks(searchTerm, statusFilter, priorityFilter);
  });
  
  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    const searchTerm = document.getElementById('search-tasks').value;
    const statusFilter = e.target.value;
    const priorityFilter = document.getElementById('filter-priority').value;
    renderTasks(searchTerm, statusFilter, priorityFilter);
  });
  
  document.getElementById('filter-priority')?.addEventListener('change', (e) => {
    const searchTerm = document.getElementById('search-tasks').value;
    const statusFilter = document.getElementById('filter-status').value;
    const priorityFilter = e.target.value;
    renderTasks(searchTerm, statusFilter, priorityFilter);
  });
}

// Task Detail Page
function TaskDetailPage(params) {
  const taskId = params[0];
  const state = stateManager.getState();
  const task = state.tasks.find(t => t.id === taskId);
  
  if (!task) {
    router.navigate('/tasks');
    return;
  }
  
  const project = state.projects.find(p => p.id === task.projectId);
  const assignees = task.assignedTo.map(id => state.users.find(u => u.id === id)).filter(Boolean);
  
  const content = `
    <div class="detail-container">
      <div class="page-actions" style="margin-bottom: 24px;">
        <button class="btn btn--secondary" onclick="router.navigate('/tasks')">← Back to Tasks</button>
        <div class="flex gap-8">
          <button class="btn btn--primary" onclick="router.navigate('/task/${task.id}/edit')">Edit Task</button>
          <button class="btn btn--danger" onclick="deleteTask('${task.id}')">Delete Task</button>
        </div>
      </div>

      <div class="detail-header">
        <div class="flex justify-between items-center mb-16">
          <h1 class="detail-title">${task.title}</h1>
          <div class="flex gap-8">
            <span class="badge badge--${task.status}">${task.status.replace('_', ' ')}</span>
            <span class="badge badge--${task.priority}">${task.priority}</span>
          </div>
        </div>
        <p>${task.description}</p>
        <div class="detail-meta">
          <div class="meta-item">
            <span class="meta-label">Project</span>
            <span class="meta-value">${project?.name || 'No Project'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Due Date</span>
            <span class="meta-value">${formatDate(task.dueDate)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Created</span>
            <span class="meta-value">${formatDate(task.createdAt)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Status</span>
            <span class="meta-value">${task.status.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h2 class="section-title">Assigned To</h2>
        <div class="grid grid-3">
          ${assignees.map(assignee => `
            <div class="card">
              <div class="card-body" style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 12px;">${assignee.avatar}</div>
                <h3 style="margin-bottom: 4px;">${assignee.name}</h3>
                <p style="color: var(--color-text-secondary); font-size: 14px; margin: 0;">${assignee.role}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="detail-section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="flex gap-12">
          <button class="btn btn--secondary" onclick="updateTaskStatus('${task.id}', 'todo')">Move to Todo</button>
          <button class="btn btn--secondary" onclick="updateTaskStatus('${task.id}', 'in_progress')">Move to In Progress</button>
          <button class="btn btn--secondary" onclick="updateTaskStatus('${task.id}', 'done')">Mark as Done</button>
        </div>
      </div>
    </div>
  `;

  AppLayout(content);
}

function deleteTask(taskId) {
  showConfirmation(
    'Delete Task',
    'Are you sure you want to delete this task?',
    () => {
      stateManager.deleteTask(taskId);
      showToast('Task deleted successfully', 'success');
      router.navigate('/tasks');
    }
  );
}

function updateTaskStatus(taskId, status) {
  stateManager.updateTask(taskId, { status });
  showToast(`Task status updated to ${status.replace('_', ' ')}`, 'success');
  router.navigate('/task/' + taskId);
}

// Team Page
function TeamPage() {
  const state = stateManager.getState();
  
  const content = `
    <div class="page-header">
      <h1 class="page-title">Team Members</h1>
      <p class="page-description">Meet your amazing team</p>
    </div>

    <div class="grid grid-3">
      ${state.teamMembers.map(member => `
        <div class="team-card">
          <div class="team-avatar">${member.avatar}</div>
          <h3 class="team-name">${member.name}</h3>
          <p class="team-role">${member.role}</p>
          <p class="team-email">${member.email}</p>
          <div class="team-status">
            <span class="badge badge--${member.status}">${member.status}</span>
          </div>
          <p style="margin-top: 12px; font-size: 12px; color: var(--color-text-secondary);">
            Joined ${formatDate(member.joinedAt)}
          </p>
        </div>
      `).join('')}
    </div>
  `;

  AppLayout(content);
}

// Profile Page
function ProfilePage() {
  const state = stateManager.getState();
  const user = state.currentUser;
  
  if (!user) {
    router.navigate('/login');
    return;
  }
  
  const content = `
    <div class="profile-container">
      <div class="page-header">
        <h1 class="page-title">My Profile</h1>
        <p class="page-description">Manage your profile information</p>
      </div>

      <div class="profile-header">
        <div class="profile-avatar-large">${user.avatar}</div>
        <div class="profile-info">
          <h2>${user.name}</h2>
          <p>${user.email}</p>
          <p><span class="badge badge--${user.status}">${user.status}</span></p>
          <p style="color: var(--color-text-secondary); font-size: 14px;">Member since ${formatDate(user.createdAt)}</p>
        </div>
      </div>

      <div class="profile-form">
        <h2 class="section-title mb-24">Edit Profile</h2>
        <form id="profile-form">
          <div class="form-group">
            <label class="form-label" for="name">Full Name</label>
            <input type="text" id="name" class="form-control" value="${user.name}" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input type="email" id="email" class="form-control" value="${user.email}" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="role">Role</label>
            <input type="text" id="role" class="form-control" value="${user.role}" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="avatar">Avatar (emoji)</label>
            <input type="text" id="avatar" class="form-control" value="${user.avatar}" maxlength="2" />
          </div>
          <div class="flex gap-12">
            <button type="submit" class="btn btn--primary">Save Changes</button>
            <button type="button" class="btn btn--secondary" onclick="router.navigate('/dashboard')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  AppLayout(content);
  
  document.getElementById('profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const avatar = document.getElementById('avatar').value;
    
    showLoading();
    
    setTimeout(() => {
      stateManager.updateUser(user.id, { name, email, role, avatar });
      hideLoading();
      showToast('Profile updated successfully!', 'success');
      router.navigate('/profile');
    }, 500);
  });
}

// New Project Form
function NewProjectPage() {
  const state = stateManager.getState();
  
  const content = `
    <div class="detail-container">
      <div class="page-header">
        <h1 class="page-title">Create New Project</h1>
        <p class="page-description">Add a new project to your workspace</p>
      </div>

      <div class="card">
        <div class="card-body">
          <form id="project-form">
            <div class="form-group">
              <label class="form-label" for="project-name">Project Name *</label>
              <input type="text" id="project-name" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="project-description">Description *</label>
              <textarea id="project-description" class="form-control" required></textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="project-status">Status *</label>
              <select id="project-status" class="form-control" required>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="project-budget">Budget ($) *</label>
              <input type="number" id="project-budget" class="form-control" required min="0" />
            </div>
            <div class="form-group">
              <label class="form-label" for="project-start">Start Date *</label>
              <input type="date" id="project-start" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="project-end">End Date *</label>
              <input type="date" id="project-end" class="form-control" required />
            </div>
            <div class="flex gap-12">
              <button type="submit" class="btn btn--primary">Create Project</button>
              <button type="button" class="btn btn--secondary" onclick="router.navigate('/projects')">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  AppLayout(content);
  
  document.getElementById('project-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('project-name').value;
    const description = document.getElementById('project-description').value;
    const status = document.getElementById('project-status').value;
    const budget = parseFloat(document.getElementById('project-budget').value);
    const startDate = document.getElementById('project-start').value;
    const endDate = document.getElementById('project-end').value;
    
    showLoading();
    
    setTimeout(() => {
      const newProject = stateManager.addProject({
        name,
        description,
        status,
        budget,
        startDate,
        endDate,
        owner: state.currentUser.id,
        members: [state.currentUser.id]
      });
      
      hideLoading();
      showToast('Project created successfully!', 'success');
      router.navigate('/project/' + newProject.id);
    }, 500);
  });
}

// New Task Form
function NewTaskPage() {
  const state = stateManager.getState();
  
  const content = `
    <div class="detail-container">
      <div class="page-header">
        <h1 class="page-title">Create New Task</h1>
        <p class="page-description">Add a new task to your project</p>
      </div>

      <div class="card">
        <div class="card-body">
          <form id="task-form">
            <div class="form-group">
              <label class="form-label" for="task-title">Task Title *</label>
              <input type="text" id="task-title" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="task-description">Description *</label>
              <textarea id="task-description" class="form-control" required></textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="task-project">Project *</label>
              <select id="task-project" class="form-control" required>
                <option value="">Select a project</option>
                ${state.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="task-status">Status *</label>
              <select id="task-status" class="form-control" required>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="task-priority">Priority *</label>
              <select id="task-priority" class="form-control" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="task-assignee">Assign To *</label>
              <select id="task-assignee" class="form-control" required>
                ${state.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="task-due">Due Date *</label>
              <input type="date" id="task-due" class="form-control" required />
            </div>
            <div class="flex gap-12">
              <button type="submit" class="btn btn--primary">Create Task</button>
              <button type="button" class="btn btn--secondary" onclick="router.navigate('/tasks')">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  AppLayout(content);
  
  document.getElementById('task-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const projectId = document.getElementById('task-project').value;
    const status = document.getElementById('task-status').value;
    const priority = document.getElementById('task-priority').value;
    const assignedTo = [document.getElementById('task-assignee').value];
    const dueDate = document.getElementById('task-due').value;
    
    if (!projectId) {
      showToast('Please select a project', 'error');
      return;
    }
    
    showLoading();
    
    setTimeout(() => {
      const newTask = stateManager.addTask({
        title,
        description,
        projectId,
        status,
        priority,
        assignedTo,
        dueDate
      });
      
      hideLoading();
      showToast('Task created successfully!', 'success');
      router.navigate('/task/' + newTask.id);
    }, 500);
  });
}

// ============================================
// ROUTE REGISTRATION
// ============================================

router.register('/login', LoginPage);
router.register('/dashboard', requireAuth(DashboardPage));
router.register('/projects', requireAuth(ProjectsPage));
router.register('/projects/new', requireAuth(NewProjectPage));
router.register('/project', requireAuth(ProjectDetailPage));
router.register('/tasks', requireAuth(TasksPage));
router.register('/tasks/new', requireAuth(NewTaskPage));
router.register('/task', requireAuth(TaskDetailPage));
router.register('/team', requireAuth(TeamPage));
router.register('/profile', requireAuth(ProfilePage));

// ============================================
// APPLICATION INITIALIZATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {
  router.handleRoute();
});

// Make functions globally accessible
window.router = router;
window.deleteProject = deleteProject;
window.deleteTask = deleteTask;
window.updateTaskStatus = updateTaskStatus;