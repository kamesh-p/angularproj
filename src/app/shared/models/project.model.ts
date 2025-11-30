export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed';
  budget?: number;
  startDate: string;
  endDate?: string;
}

export interface CreateProjectRequest {
  id: string; // Required by your backend validation
  name: string;
  description: string;
  owner: string;
  status: string;
  budget?: number;
  startDate: string;
  endDate?: string;
}