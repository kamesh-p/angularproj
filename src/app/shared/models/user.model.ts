export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'online' | 'offline';
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}
