import { Task, TaskStats, TaskStatus } from '../types/task';

// Mock users for the demo
export const USERS = ['Joe', 'Jabin', 'Saran'];

type Subscriber = () => void;

class TaskService {
  private tasks: Task[] = [];
  private subscribers: Subscriber[] = [];

  constructor() {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(subscriber => subscriber());
    // Save to localStorage
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  getAllTasks(): Task[] {
    return [...this.tasks];
  }

  getTasksForDate(date: Date): Task[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return this.tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === targetDate.getTime();
    });
  }

  addTask(task: Omit<Task, 'id'>): Task {
    const newTask: Task = {
      ...task,
      id: Date.now(),
    };
    this.tasks.push(newTask);
    this.notifySubscribers();
    return newTask;
  }

  updateTask(taskId: number, updates: Partial<Task>): Task {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
    };

    this.notifySubscribers();
    return this.tasks[taskIndex];
  }

  deleteTask(taskId: number): void {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.notifySubscribers();
  }

  toggleTaskStatus(taskId: number): Task {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const newStatus: TaskStatus = this.tasks[taskIndex].status === 'pending' ? 'completed' : 'pending';
    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      status: newStatus,
    };

    this.notifySubscribers();
    return this.tasks[taskIndex];
  }

  getTaskStats(): TaskStats {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;

    const tasksByPriority = {
      high: this.tasks.filter(t => t.priority === 'high' && t.status === 'pending').length,
      medium: this.tasks.filter(t => t.priority === 'medium' && t.status === 'pending').length,
      low: this.tasks.filter(t => t.priority === 'low' && t.status === 'pending').length,
    };

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      tasksByPriority,
    };
  }
}

export const taskService = new TaskService(); 