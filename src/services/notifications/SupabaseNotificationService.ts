import { INotificationService, NotificationServiceEvents } from "./types";
import { Notification } from "@/types/notification";
import { v4 as uuidv4 } from 'uuid';

export class SupabaseNotificationService implements INotificationService {
  private listeners: Record<keyof NotificationServiceEvents, Function[]> = {
    onNotification: [],
    onConnectionStatus: []
  };
  private connected: boolean = false;
  private userId: string | null = null;

  constructor() {
    // Initialize any required state
  }

  connect(userId: string): void {
    this.userId = userId;
    this.connected = true;
    this.notifyConnectionStatus(true);
  }

  disconnect(): void {
    this.userId = null;
    this.connected = false;
    this.notifyConnectionStatus(false);
  }

  onNotification(listener: (notification: Notification) => void): () => void {
    this.listeners.onNotification.push(listener);
    return () => {
      this.listeners.onNotification = this.listeners.onNotification.filter(l => l !== listener);
    };
  }

  onConnectionStatus(listener: (connected: boolean) => void): () => void {
    this.listeners.onConnectionStatus.push(listener);
    return () => {
      this.listeners.onConnectionStatus = this.listeners.onConnectionStatus.filter(l => l !== listener);
    };
  }

  private notifyConnectionStatus(status: boolean): void {
    this.listeners.onConnectionStatus.forEach(listener => {
      listener(status);
    });
  }

  triggerDemoNotification(type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    if (!this.connected) return;
    
    const notification: Notification = {
      id: uuidv4(),
      title: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
      message: `This is a test notification of type "${type}" triggered at ${new Date().toLocaleTimeString()}`,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      priority: type === 'error' ? 'high' : 'medium',
      category: 'system',
      // Include optional fields if needed but match the interface
    };
    
    this.notifyListeners(notification);
  }

  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    if (!this.connected || !this.userId) {
      console.warn('Cannot add notification: not connected or no user ID');
      return;
    }
    
    // Here we would typically send to Supabase but for now just create a local notification
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false,
      // The required fields are already included in the parameter type
    };
    
    // Simulate sending to Supabase then receiving back
    setTimeout(() => {
      this.notifyListeners(newNotification);
    }, 100);
  }

  private notifyListeners(notification: Notification): void {
    this.listeners.onNotification.forEach(listener => {
      listener(notification);
    });
  }

  async markAsRead(id: string): Promise<void> {
    // Implementation would update Supabase
    console.log(`Marking notification ${id} as read`);
  }

  async markAllAsRead(): Promise<void> {
    // Implementation would update Supabase
    console.log('Marking all notifications as read');
  }

  async clearNotification(id: string): Promise<void> {
    // Implementation would update Supabase
    console.log(`Clearing notification ${id}`);
  }

  async clearAllNotifications(): Promise<void> {
    // Implementation would update Supabase
    console.log('Clearing all notifications');
  }
}

// Export a singleton instance
export const supabaseNotificationService = new SupabaseNotificationService();
