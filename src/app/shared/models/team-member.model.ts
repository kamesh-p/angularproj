export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'online' | 'offline';
  joinedAt: string;
}
