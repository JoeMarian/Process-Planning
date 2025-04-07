export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  assignedTo: string;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
  };
}

export const TASK_COLORS = {
  low: '#4caf50',    // Green
  medium: '#ff9800', // Yellow/Orange
  high: '#f44336',   // Red
}; 