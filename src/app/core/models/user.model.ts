export interface User {
  id: number;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  displayName: string;
}

export type Role = User['role'];

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}
