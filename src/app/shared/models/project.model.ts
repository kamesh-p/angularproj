export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'; // Match your form values
  budget?: number;
  startDate: string;
  endDate?: string;
  owner: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}