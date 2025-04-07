export interface Sprint {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  storyPoints: number;
  completedPoints: number;
  tasks: SprintTask[];
  status: 'active' | 'completed' | 'planned';
}

export interface SprintTask {
  id: number;
  title: string;
  storyPoints: number;
  assignee: string;
  status: 'todo' | 'in-progress' | 'done';
  dependencies: number[];
  complexity: 'Low' | 'Medium' | 'High';
  prediction: number;
}

export interface ResourceUtilization {
  id: number;
  name: string;
  role: string;
  utilizedHours: number;
  availableHours: number;
  assignments: {
    taskId: number;
    hours: number;
  }[];
}

export interface TaskComment {
  id: number;
  taskId: number;
  userId: string;
  content: string;
  timestamp: Date;
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];
  mentions: string[];
} 