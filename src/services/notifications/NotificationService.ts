
import { Notification } from "@/types/notification";
import { v4 as uuidv4 } from 'uuid';
import { MockWebSocket } from "../websocket/MockWebSocket";
import { demoNotifications } from "./demoNotifications";
import { INotificationService } from "./types";

export class NotificationService implements INotificationService {
  private static instance: NotificationService;
  private socket: MockWebSocket | null = null;
  private notificationListeners: ((notification: Notification) => void)[] = [];
  private connectionStatusListeners: ((connected: boolean) => void)[] = [];
  private isConnected = false;
  private userId: string | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public connect(userId: string): void {
    this.userId = userId;
    
    // In a real app, this would connect to a real WebSocket server
    // For demo purposes, we're using a mock WebSocket
    this.socket = new MockWebSocket('wss://api.example.com/notifications');
    
    this.socket.on('open', () => {
      console.log('Notification service connected');
      this.isConnected = true;
      this.updateConnectionStatus(true);
      
      // Subscribe to user-specific channel
      this.socket.send(JSON.stringify({
        type: 'subscribe',
        channel: `user:${userId}`
      }));
    });
    
    this.socket.on('close', () => {
      console.log('Notification service disconnected');
      this.isConnected = false;
      this.updateConnectionStatus(false);
    });
    
    this.socket.on('message', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          this.handleNotification(data.notification);
        }
      } catch (e) {
        console.error('Error handling notification message', e);
      }
    });

    // For demo: start sending random notifications periodically
    this.startDemoNotifications();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
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

  private updateConnectionStatus(connected: boolean): void {
    this.connectionStatusListeners.forEach(listener => listener(connected));
  }

  private handleNotification(notification: Notification): void {
    this.notificationListeners.forEach(listener => listener(notification));
  }

  // DEMO ONLY: Methods to simulate real-time notifications
  private startDemoNotifications(): void {
    // Send a notification after 10 seconds to simulate real-time behavior
    setTimeout(() => {
      this.sendDemoNotification();
      
      // Then send one randomly every 30-120 seconds
      setInterval(() => {
        this.sendDemoNotification();
      }, Math.random() * 90000 + 30000);
      
      // Simulate disconnections occasionally
      setInterval(() => {
        if (Math.random() < 0.3 && this.socket) {
          this.socket.simulateDisconnect();
        }
      }, 180000); // Every 3 minutes there's a 30% chance
      
    }, 10000);
  }

  private sendDemoNotification(): void {
    if (this.socket && this.isConnected) {
      // Select a random demo notification
      const template = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
      
      // Create a full notification object
      const notification: Notification = {
        id: uuidv4(),
        title: template.title!,
        message: template.message!,
        read: false,
        timestamp: new Date().toISOString(),
        type: template.type!,
        link: template.link,
        category: template.category as any,
        recipient: this.userId!,
        priority: Math.random() > 0.7 ? 'high' : 'medium',
      };
      
      // Send via WebSocket
      this.socket.simulateMessage({
        type: 'notification',
        notification
      });
    }
  }

  // Method to manually trigger a demo notification (for testing)
  public triggerDemoNotification(): void {
    this.sendDemoNotification();
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
