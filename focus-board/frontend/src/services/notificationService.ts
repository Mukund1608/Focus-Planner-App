class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private checkInterval: number | null = null;
  private isInitialized: boolean = false;
  private notificationQueue: Array<{title: string, options?: NotificationOptions}> = [];
  private maxQueueSize: number = 10;

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
      this.isInitialized = true;
      
      // Set up periodic checking for reminders
      this.startPeriodicChecking();
      
      // Process any queued notifications if permission was granted
      if (this.permission === 'granted') {
        this.processNotificationQueue();
      }
      
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
      
      if (permission === 'granted') {
        this.processNotificationQueue();
        this.startPeriodicChecking();
      }
      
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
      // Queue the notification for later if permission is not granted
      this.queueNotification(title, options);
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

      // Auto-close after 8 seconds (reduced from 10 for better UX)
      setTimeout(() => {
        notification.close();
      }, 8000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Handle notification close
      notification.onclose = () => {
        console.log('Notification closed:', title);
      };

      console.log('Notification shown successfully:', title);

    } catch (error) {
      console.error('Error showing notification:', error);
      throw error;
    }
  }

  private queueNotification(title: string, options?: NotificationOptions): void {
    if (this.notificationQueue.length >= this.maxQueueSize) {
      this.notificationQueue.shift(); // Remove oldest notification
    }
    this.notificationQueue.push({ title, options });
  }

  private processNotificationQueue(): void {
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (notification) {
        this.showNotification(notification.title, notification.options);
      }
    }
  }



  async showTaskReminder(taskTitle: string, dueDate: string, taskId?: number): Promise<void> {
    const dueDateObj = new Date(dueDate);
    const timeUntilDue = dueDateObj.getTime() - Date.now();
    
    let message = `Task "${taskTitle}" is due soon!`;
    let icon = '⏰';
    
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
      icon = '⚠️';
    }

    await this.showNotification(`${icon} Task Reminder`, {
      body: message,
      tag: `task-reminder-${taskId || taskTitle}`,
      requireInteraction: true,
      data: { taskId }
    });
  }

  async showRecurringTaskCreated(taskTitle: string, nextDueDate: string): Promise<void> {
    const message = `New recurring task "${taskTitle}" created for ${new Date(nextDueDate).toLocaleDateString()}`;
    
    await this.showNotification('🔄 Recurring Task Created', {
      body: message,
      tag: `recurring-task-${taskTitle}`,
      requireInteraction: false
    });
  }

  async showTaskCompleted(taskTitle: string): Promise<void> {
    await this.showNotification('🎉 Task Completed!', {
      body: `Great job! You've completed "${taskTitle}"`,
      tag: `task-completed-${taskTitle}`,
      requireInteraction: false
    });
  }

  async showTaskOverdue(taskTitle: string, taskId?: number): Promise<void> {
    await this.showNotification('⚠️ Task Overdue!', {
      body: `The task "${taskTitle}" is overdue. Please update its status.`,
      tag: `task-overdue-${taskId || taskTitle}`,
      requireInteraction: true,
      data: { taskId }
    });
  }

  async showHabitReminder(habitTitle: string, streak: number): Promise<void> {
    const message = streak > 0 
      ? `Keep your ${streak}-day streak going! Complete "${habitTitle}" today.`
      : `Time to start building a streak! Complete "${habitTitle}" today.`;
    
    await this.showNotification('🔥 Habit Reminder', {
      body: message,
      tag: `habit-reminder-${habitTitle}`,
      requireInteraction: false
    });
  }

  async showStreakMilestone(habitTitle: string, streak: number): Promise<void> {
    const milestones = [7, 30, 100, 365];
    if (milestones.includes(streak)) {
      await this.showNotification('🏆 Streak Milestone!', {
        body: `Congratulations! You've maintained "${habitTitle}" for ${streak} days!`,
        tag: `streak-milestone-${habitTitle}`,
        requireInteraction: false
      });
    }
  }

  private startPeriodicChecking(): void {
    // Stop any existing interval
    this.stopPeriodicChecking();
    
    // Check for reminders every 2 minutes (more frequent for better UX)
    this.checkInterval = window.setInterval(() => {
      this.checkForReminders();
    }, 2 * 60 * 1000);

    // Also check when the page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForReminders();
      }
    });

    // Check immediately on start
    this.checkForReminders();
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
          await this.showTaskReminder(reminder.title, reminder.due_date || '', reminder.id);
          
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
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  // Method to get notification queue status
  getQueueStatus(): { length: number; maxSize: number } {
    return {
      length: this.notificationQueue.length,
      maxSize: this.maxQueueSize
    };
  }

  // Method to clear notification queue
  clearQueue(): void {
    this.notificationQueue = [];
  }

  // Method to test notification with custom settings
  async testNotification(message: string = 'Test notification'): Promise<void> {
    await this.showNotification('🧪 Test Notification', {
      body: message,
      tag: 'test-notification',
      requireInteraction: false
    });
  }
}

export const notificationService = NotificationService.getInstance();
