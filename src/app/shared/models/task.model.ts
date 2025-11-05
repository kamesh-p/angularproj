export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string[];
  projectId: string;
  dueDate: string;
  createdAt: string;
}
