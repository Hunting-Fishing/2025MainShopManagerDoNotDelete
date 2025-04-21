import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notification';
import { INotificationService, NotificationServiceEvents } from './types';

export class SupabaseNotificationService implements INotificationService {
  private userId: string | null = null;
  private listeners: NotificationServiceEvents = {
    onNotification: [],
    onConnectionStatus: []
  };
  private connected: boolean = false;
  private channel: any = null;

  constructor() {
    // Initialize connection status
    this.setConnectionStatus(false);
  }

  // Connect to Supabase real-time notifications
  connect(userId: string): void {
    this.userId = userId;

    // Subscribe to the notifications channel
    this.channel = supabase
      .channel('notifications-channel-' + userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = this.mapDatabaseNotificationToModel(payload.new);
          this.notifyListeners(notification);
        }
      )
      .subscribe((status: any) => {
        const isConnected = status === 'SUBSCRIBED';
        this.setConnectionStatus(isConnected);
        console.log('Notification service connection status:', isConnected);
      });
  }

  // Disconnect from Supabase real-time
  disconnect(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.userId = null;
    this.setConnectionStatus(false);
  }

  // Register notification listener
  onNotification(listener: (notification: Notification) => void): () => void {
    this.listeners.onNotification.push(listener);
    return () => {
      this.listeners.onNotification = this.listeners.onNotification.filter(l => l !== listener);
    };
  }

  // Register connection status listener
  onConnectionStatus(listener: (connected: boolean) => void): () => void {
    this.listeners.onConnectionStatus.push(listener);
    // Immediately notify with current status
    listener(this.connected);
    return () => {
      this.listeners.onConnectionStatus = this.listeners.onConnectionStatus.filter(l => l !== listener);
    };
  }

  // Create a demo notification for testing
  triggerDemoNotification(type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const demoTypes = {
      info: { title: 'Information', message: 'This is a test information notification.' },
      success: { title: 'Success', message: 'Your action was completed successfully!' },
      warning: { title: 'Warning', message: 'Please be aware of this important notice.' },
      error: { title: 'Error', message: 'Something went wrong. Please try again.' }
    };
    
    const { title, message } = demoTypes[type];
    
    const notification: Notification = {
      id: uuidv4(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      category: 'system',
      priority: type === 'error' ? 'high' : 'medium'
    };
    
    // Notify all listeners
    this.notifyListeners(notification);
    
    // Also save to database if connected
    if (this.userId) {
      this.saveNotificationToDatabase(notification);
    }
  }

  // Add a notification
  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    if (!this.userId) {
      console.error('Cannot add notification: Not connected');
      return;
    }

    const fullNotification: Notification = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false
    };

    // Save to database and notify listeners
    await this.saveNotificationToDatabase(fullNotification);
    this.notifyListeners(fullNotification);
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<void> {
    if (!this.userId) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', this.userId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    if (!this.userId) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', this.userId)
        .is('read', false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Clear a notification
  async clearNotification(id: string): Promise<void> {
    if (!this.userId) return;

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', this.userId);
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    if (!this.userId) return;

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', this.userId);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }

  // Private helper methods
  private setConnectionStatus(connected: boolean): void {
    if (this.connected === connected) return;
    
    this.connected = connected;
    this.listeners.onConnectionStatus.forEach(listener => {
      try {
        listener(connected);
      } catch (e) {
        console.error('Error in connection status listener:', e);
      }
    });
  }

  private notifyListeners(notification: Notification): void {
    this.listeners.onNotification.forEach(listener => {
      try {
        listener(notification);
      } catch (e) {
        console.error('Error in notification listener:', e);
      }
    });
  }

  private async saveNotificationToDatabase(notification: Notification): Promise<void> {
    if (!this.userId) return;

    try {
      const dbNotification = {
        id: notification.id,
        user_id: this.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: notification.timestamp,
        read: notification.read,
        link: notification.link,
        category: notification.category,
        priority: notification.priority,
        sender: notification.sender,
        recipient: notification.recipient,
        expires_at: notification.expires_at // Using expires_at to match schema
      };

      await supabase
        .from('notifications')
        .insert(dbNotification);
    } catch (error) {
      console.error('Error saving notification to database:', error);
    }
  }

  private mapDatabaseNotificationToModel(dbNotification: any): Notification {
    return {
      id: dbNotification.id,
      title: dbNotification.title,
      message: dbNotification.message,
      type: dbNotification.type,
      timestamp: dbNotification.timestamp,
      read: dbNotification.read,
      link: dbNotification.link,
      category: dbNotification.category,
      priority: dbNotification.priority,
      sender: dbNotification.sender,
      recipient: dbNotification.recipient,
      expires_at: dbNotification.expires_at // Using expires_at to match schema
    };
  }
}

// Create a singleton instance
export const supabaseNotificationService = new SupabaseNotificationService();
