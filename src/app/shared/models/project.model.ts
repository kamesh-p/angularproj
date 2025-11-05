export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed';
  budget: number;
  startDate: string;
  endDate: string;
  owner: string;
  members: string[];
  createdAt: string;
}
