class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private checkInterval: number | null = null;

  private constructor() {
    this.init();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init(): Promise<void> {
    if (this.isSupported()) {
      this.permission = Notification.permission;
      
      // Set up periodic checking for reminders
      this.startPeriodicChecking();
      
      console.log('NotificationService initialized with permission:', this.permission);
    } else {
      console.warn('Notifications not supported in this browser');
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Cannot show notification: notifications not supported in this browser');
      return;
    }
    
    if (this.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted. Current permission:', this.permission);
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: false,
        silent: false,
        ...options
      });

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      console.log('Notification shown successfully:', title);

    } catch (error) {
      console.error('Error showing notification:', error);
      throw error; // Re-throw to allow calling code to handle
    }
  }

  async showTaskReminder(taskTitle: string, dueDate: string): Promise<void> {
    const dueDateObj = new Date(dueDate);
    const timeUntilDue = dueDateObj.getTime() - Date.now();
    
    let message = `Task "${taskTitle}" is due soon!`;
    
    if (timeUntilDue > 0) {
      const hours = Math.floor(timeUntilDue / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilDue % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        message = `Task "${taskTitle}" is due in ${hours}h ${minutes}m`;
      } else {
        message = `Task "${taskTitle}" is due in ${minutes} minutes`;
      }
    } else {
      message = `Task "${taskTitle}" is overdue!`;
    }

    await this.showNotification('Task Reminder', {
      body: message,
      tag: `task-reminder-${taskTitle}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Task'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  }

  async showRecurringTaskCreated(taskTitle: string, nextDueDate: string): Promise<void> {
    const message = `New recurring task "${taskTitle}" created for ${new Date(nextDueDate).toLocaleDateString()}`;
    
    await this.showNotification('Recurring Task Created', {
      body: message,
      tag: `recurring-task-${taskTitle}`,
      requireInteraction: false
    });
  }

  async showTaskCompleted(taskTitle: string): Promise<void> {
    await this.showNotification('Task Completed! 🎉', {
      body: `Great job! You've completed "${taskTitle}"`,
      tag: `task-completed-${taskTitle}`,
      requireInteraction: false
    });
  }

  async showTaskOverdue(taskTitle: string): Promise<void> {
    await this.showNotification('Task Overdue! ⚠️', {
      body: `The task "${taskTitle}" is overdue. Please update its status.`,
      tag: `task-overdue-${taskTitle}`,
      requireInteraction: true
    });
  }

  private startPeriodicChecking(): void {
    // Check for reminders every 5 minutes
    this.checkInterval = window.setInterval(() => {
      this.checkForReminders();
    }, 5 * 60 * 1000);

    // Also check when the page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForReminders();
      }
    });
  }

  private async checkForReminders(): Promise<void> {
    if (this.permission !== 'granted') {
      return;
    }

    try {
      // Import here to avoid circular dependencies
      const { taskAPI } = await import('./api');
      const { ReminderType } = await import('../types/task');
      const pendingReminders = await taskAPI.getPendingReminders();
      
      for (const reminder of pendingReminders) {
        if (reminder.reminder_type === ReminderType.BROWSER || reminder.reminder_type === ReminderType.BOTH) {
          await this.showTaskReminder(reminder.title, reminder.due_date || '');
          
          // Mark reminder as sent
          await taskAPI.markReminderSent(reminder.id);
        }
      }
    } catch (error) {
      console.error('Error checking for reminders:', error);
    }
  }

  stopPeriodicChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // Method to manually trigger reminder check (for testing)
  async manualCheck(): Promise<void> {
    await this.checkForReminders();
  }

  // Method to check if service is properly initialized
  isInitialized(): boolean {
    return this.isSupported() && this.permission !== 'default';
  }
}

export const notificationService = NotificationService.getInstance();
