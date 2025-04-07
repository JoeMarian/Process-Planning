import { Sprint, SprintTask, ResourceUtilization, TaskComment } from '../types/sprint';

class SprintService {
  private sprints: Sprint[] = [];
  private resources: ResourceUtilization[] = [];
  private comments: TaskComment[] = [];
  private subscribers: (() => void)[] = [];

  constructor() {
    // Initialize with mock data
    this.sprints = [
      {
        id: 1,
        name: 'Sprint 1',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        storyPoints: 100,
        completedPoints: 65,
        status: 'active',
        tasks: [
          {
            id: 1,
            title: 'API Integration',
            storyPoints: 8,
            assignee: 'Joe',
            status: 'in-progress',
            dependencies: [],
            complexity: 'High',
            prediction: 85,
          },
          // Add more mock tasks
        ],
      },
    ];

    this.resources = [
      {
        id: 1,
        name: 'Frontend Team',
        role: 'Development',
        utilizedHours: 34,
        availableHours: 40,
        assignments: [{ taskId: 1, hours: 34 }],
      },
      // Add more mock resources
    ];
  }

  // Sprint Management
  getAllSprints(): Sprint[] {
    return this.sprints;
  }

  getActiveSprint(): Sprint | undefined {
    return this.sprints.find(sprint => sprint.status === 'active');
  }

  addSprint(sprint: Omit<Sprint, 'id'>): Sprint {
    const newSprint = {
      ...sprint,
      id: this.sprints.length + 1,
    };
    this.sprints.push(newSprint);
    this.notifySubscribers();
    return newSprint;
  }

  updateSprintStatus(sprintId: number, status: Sprint['status']): void {
    const sprint = this.sprints.find(s => s.id === sprintId);
    if (sprint) {
      sprint.status = status;
      this.notifySubscribers();
    }
  }

  // Resource Management
  getResourceUtilization(): ResourceUtilization[] {
    return this.resources;
  }

  updateResourceAssignment(resourceId: number, taskId: number, hours: number): void {
    const resource = this.resources.find(r => r.id === resourceId);
    if (resource) {
      const existingAssignment = resource.assignments.find(a => a.taskId === taskId);
      if (existingAssignment) {
        existingAssignment.hours = hours;
      } else {
        resource.assignments.push({ taskId, hours });
      }
      resource.utilizedHours = resource.assignments.reduce((sum, a) => sum + a.hours, 0);
      this.notifySubscribers();
    }
  }

  // Task Analytics
  getTaskPredictions(): { taskId: number; prediction: number }[] {
    return this.sprints
      .flatMap(sprint => sprint.tasks)
      .map(task => ({
        taskId: task.id,
        prediction: task.prediction,
      }));
  }

  // Comments and Discussions
  addComment(comment: Omit<TaskComment, 'id'>): TaskComment {
    const newComment = {
      ...comment,
      id: this.comments.length + 1,
    };
    this.comments.push(newComment);
    this.notifySubscribers();
    return newComment;
  }

  getTaskComments(taskId: number): TaskComment[] {
    return this.comments.filter(comment => comment.taskId === taskId);
  }

  // Subscription Management
  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }
}

export const sprintService = new SprintService(); 