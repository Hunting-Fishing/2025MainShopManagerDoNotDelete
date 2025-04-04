
import { supabase } from "@/lib/supabase";
import { Notification } from "@/types/notification";
import { NotificationDB } from "@/types/database.types";
import { v4 as uuidv4 } from 'uuid';
import { INotificationService } from "./types";

export class SupabaseNotificationService implements INotificationService {
  private static instance: SupabaseNotificationService;
  private notificationListeners: ((notification: Notification) => void)[] = [];
  private connectionStatusListeners: ((connected: boolean) => void)[] = [];
  private isConnected = false;
  private userId: string | null = null;
  private realtimeChannel: any = null;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): SupabaseNotificationService {
    if (!SupabaseNotificationService.instance) {
      SupabaseNotificationService.instance = new SupabaseNotificationService();
    }
    return SupabaseNotificationService.instance;
  }

  public async connect(userId: string): Promise<void> {
    this.userId = userId;
    if (!userId) {
      console.error("Cannot connect notification service: No user ID provided");
      this.updateConnectionStatus(false);
      return;
    }

    try {
      // Subscribe to realtime notifications
      this.realtimeChannel = supabase
        .channel('notifications_channel')
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          }, 
          (payload: any) => {
            const notification = this.mapDatabaseNotification(payload.new);
            this.handleNotification(notification);
          }
        )
        .subscribe((status: string) => {
          const isConnected = status === 'SUBSCRIBED';
          this.isConnected = isConnected;
          this.updateConnectionStatus(isConnected);
          console.log(`Notification channel status: ${status}`);
        });

      // Fetch existing notifications using REST API to avoid TypeScript errors
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/notifications?user_id=eq.${userId}&order=timestamp.desc`,
        {
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json() as NotificationDB[];

      // Process existing notifications
      if (data && data.length > 0) {
        data.forEach((item) => {
          const notification = this.mapDatabaseNotification(item);
          // Use direct notification listener call to avoid duplicating toast notifications
          this.notificationListeners.forEach(listener => listener(notification));
        });
      }

    } catch (error) {
      console.error("Error connecting to notification service:", error);
      this.updateConnectionStatus(false);
    }
  }

  public disconnect(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
    this.isConnected = false;
    this.updateConnectionStatus(false);
  }

  public onNotification(listener: (notification: Notification) => void): () => void {
    this.notificationListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    };
  }

  public onConnectionStatus(listener: (connected: boolean) => void): () => void {
    this.connectionStatusListeners.push(listener);
    listener(this.isConnected);
    
    // Return unsubscribe function
    return () => {
      this.connectionStatusListeners = this.connectionStatusListeners.filter(l => l !== listener);
    };
  }

  // Add a new notification to the database using direct fetch API
  public async addNotification(notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    if (!this.userId) {
      console.error("Cannot add notification: No user ID available");
      return;
    }

    try {
      const payload = {
        user_id: this.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        link: notificationData.link,
        sender: notificationData.sender,
        recipient: notificationData.recipient,
        category: notificationData.category || 'system',
        priority: notificationData.priority || 'medium'
      };

      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/notifications`,
        {
          method: 'POST',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add notification');
      }
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  }

  // Mark a notification as read in the database
  public async markAsRead(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/notifications?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ read: true })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  // Mark all notifications as read in the database
  public async markAllAsRead(): Promise<void> {
    if (!this.userId) return;

    try {
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/notifications?user_id=eq.${this.userId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ read: true })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  // Clear a notification from the database
  public async clearNotification(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/notifications?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to clear notification');
      }
    } catch (error) {
      console.error("Error clearing notification:", error);
    }
  }

  // Clear all notifications for the current user
  public async clearAllNotifications(): Promise<void> {
    if (!this.userId) return;

    try {
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/notifications?user_id=eq.${this.userId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to clear all notifications');
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  }

  // Test notification function for demo purposes
  public async triggerDemoNotification(): Promise<void> {
    await this.addNotification({
      title: 'Test Notification',
      message: 'This is a test notification from Supabase.',
      type: 'info',
      category: 'system',
      priority: 'medium'
    });
  }

  private updateConnectionStatus(connected: boolean): void {
    this.connectionStatusListeners.forEach(listener => listener(connected));
  }

  private handleNotification(notification: Notification): void {
    this.notificationListeners.forEach(listener => listener(notification));
  }

  private mapDatabaseNotification(dbNotification: any): Notification {
    return {
      id: dbNotification.id,
      title: dbNotification.title,
      message: dbNotification.message,
      read: dbNotification.read,
      timestamp: dbNotification.timestamp,
      type: dbNotification.type,
      link: dbNotification.link,
      sender: dbNotification.sender,
      recipient: dbNotification.recipient,
      category: dbNotification.category,
      priority: dbNotification.priority,
      expiresAt: dbNotification.expires_at
    };
  }
}

// Export singleton instance
export const supabaseNotificationService = SupabaseNotificationService.getInstance();
