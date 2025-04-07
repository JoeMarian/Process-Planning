import { TaskComment } from '../types/sprint';

export interface EmailNotification {
  to: string[];
  subject: string;
  content: string;
  attachments?: File[];
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  taskAssignments: boolean;
  taskComments: boolean;
  sprintUpdates: boolean;
  dailyDigest: boolean;
}

class NotificationService {
  private subscribers: (() => void)[] = [];
  private userPreferences: Map<string, NotificationPreferences> = new Map();

  constructor() {
    // Initialize with mock preferences
    this.userPreferences.set('user1', {
      userId: 'user1',
      emailNotifications: true,
      taskAssignments: true,
      taskComments: true,
      sprintUpdates: true,
      dailyDigest: false,
    });
  }

  // Email Notifications
  async sendEmailNotification(notification: EmailNotification): Promise<boolean> {
    // In a real application, this would integrate with an email service
    console.log('Sending email notification:', notification);
    return true;
  }

  // Task Assignment Notifications
  async notifyTaskAssignment(taskId: number, assigneeId: string): Promise<void> {
    const userPrefs = this.userPreferences.get(assigneeId);
    if (userPrefs?.taskAssignments) {
      await this.sendEmailNotification({
        to: [assigneeId],
        subject: `New Task Assignment - Task #${taskId}`,
        content: `You have been assigned to task #${taskId}. Please review and update the status accordingly.`,
      });
    }
  }

  // Comment Notifications
  async notifyNewComment(comment: TaskComment): Promise<void> {
    const mentionedUsers = comment.mentions;
    const notifications = mentionedUsers
      .filter(userId => this.userPreferences.get(userId)?.taskComments)
      .map(userId =>
        this.sendEmailNotification({
          to: [userId],
          subject: `New Comment on Task #${comment.taskId}`,
          content: `${comment.userId} mentioned you in a comment: "${comment.content}"`,
          attachments: comment.attachments.map(att => new File([], att.name)),
        })
      );

    await Promise.all(notifications);
  }

  // Sprint Update Notifications
  async notifySprintUpdate(sprintId: number, updateType: 'start' | 'end' | 'update'): Promise<void> {
    const usersToNotify = Array.from(this.userPreferences.entries())
      .filter(([_, prefs]) => prefs.sprintUpdates)
      .map(([userId]) => userId);

    if (usersToNotify.length > 0) {
      await this.sendEmailNotification({
        to: usersToNotify,
        subject: `Sprint ${sprintId} ${updateType}`,
        content: `Sprint ${sprintId} has been ${updateType}ed. Please review the sprint dashboard for details.`,
      });
    }
  }

  // File Attachment Handling
  async uploadAttachment(file: File): Promise<string> {
    // In a real application, this would upload to a storage service
    console.log('Uploading file:', file.name);
    return `https://example.com/files/${file.name}`;
  }

  // User Preferences
  getUserPreferences(userId: string): NotificationPreferences | undefined {
    return this.userPreferences.get(userId);
  }

  updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const currentPrefs = this.userPreferences.get(userId) || {
      userId,
      emailNotifications: false,
      taskAssignments: false,
      taskComments: false,
      sprintUpdates: false,
      dailyDigest: false,
    };

    this.userPreferences.set(userId, {
      ...currentPrefs,
      ...preferences,
    });

    this.notifySubscribers();
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

export const notificationService = new NotificationService(); 