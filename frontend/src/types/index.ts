export type TaskStatus = 'PENDING' | 'COMPLETED';

export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  userId: number;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
}
