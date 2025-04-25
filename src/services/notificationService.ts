
import { Notification } from '@/types/notification';

type NotificationListener = (notification: Notification) => void;
type ConnectionStatusListener = (status: boolean) => void;

class SupabaseNotificationService {
  private connectionStatus = false;
  private notificationListeners: NotificationListener[] = [];
  private statusListeners: ConnectionStatusListener[] = [];
  private userId: string | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  connect(userId: string): void {
    this.userId = userId;
    this.connectionStatus = true;
    
    // Notify listeners of connection status
    this.statusListeners.forEach(listener => listener(true));
    
    // Set up a simulated notification interval for demo
    this.intervalId = setInterval(() => {
      // This would be replaced with real-time subscription logic
    }, 60000); // Check for new notifications every minute
  }

  disconnect(): void {
    this.userId = null;
    this.connectionStatus = false;
    
    // Clear interval
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Notify listeners of disconnection
    this.statusListeners.forEach(listener => listener(false));
  }

  onNotification(listener: NotificationListener): () => void {
    this.notificationListeners.push(listener);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    };
  }

  onConnectionStatus(listener: ConnectionStatusListener): () => void {
    this.statusListeners.push(listener);
    // Send current status immediately
    listener(this.connectionStatus);
    
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  triggerDemoNotification(type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    if (!this.userId) {
      console.warn('Cannot trigger notification: Not connected');
      return;
    }

    const notification: Notification = {
      id: `demo-${Date.now()}`,
      title: 'Test Notification',
      message: `This is a ${type} test notification triggered at ${new Date().toLocaleTimeString()}`,
      type,
      read: false,
      timestamp: new Date().toISOString(),
      category: 'system'
    };

    this.notificationListeners.forEach(listener => listener(notification));
  }

  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    // In a real implementation, this would save to the database
    // For now, just broadcast to current session
    const fullNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notificationListeners.forEach(listener => listener(fullNotification));
  }

  async markAsRead(id: string): Promise<void> {
    // In a real implementation, update the database
    console.log(`Marked notification ${id} as read`);
  }

  async markAllAsRead(): Promise<void> {
    // In a real implementation, update the database
    console.log('Marked all notifications as read');
  }

  async clearNotification(id: string): Promise<void> {
    // In a real implementation, delete from database
    console.log(`Cleared notification ${id}`);
  }

  async clearAllNotifications(): Promise<void> {
    // In a real implementation, delete all from database
    console.log('Cleared all notifications');
  }
}

// Export a singleton instance
export const supabaseNotificationService = new SupabaseNotificationService();
export type { SupabaseNotificationService };
export type INotificationService = SupabaseNotificationService;

export { supabaseNotificationService as notificationService };
