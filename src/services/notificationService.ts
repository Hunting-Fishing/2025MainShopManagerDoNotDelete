
import { Notification } from "@/types/notification";
import { v4 as uuidv4 } from 'uuid';

// Mock WebSocket connection for demo purposes
class MockWebSocket {
  private callbacks: Record<string, Function[]> = {};
  private isConnected = false;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private url: string) {
    this.connect();
  }

  private connect() {
    console.log(`Connecting to WebSocket: ${this.url}`);
    
    // Simulate connection delay
    setTimeout(() => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.trigger('open', {});
      console.log('WebSocket connected');
    }, 500);
  }

  public send(data: any) {
    if (!this.isConnected) {
      console.warn('Cannot send message, WebSocket is not connected');
      return;
    }
    
    console.log('WebSocket message sent:', data);
    
    // For demo: echo back a response for certain message types
    if (typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'subscribe') {
          this.simulateResponse('subscription_success', { channel: parsedData.channel });
        }
      } catch (e) {
        console.error('Error parsing WebSocket message', e);
      }
    }
  }

  public close() {
    this.isConnected = false;
    this.trigger('close', { code: 1000, reason: 'Normal closure' });
    console.log('WebSocket disconnected');
  }

  public on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  private trigger(event: string, data: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // For demo purposes: simulate receiving a message
  public simulateMessage(message: any) {
    this.trigger('message', { data: JSON.stringify(message) });
  }

  private simulateResponse(type: string, data: any) {
    setTimeout(() => {
      this.simulateMessage({ type, data });
    }, 300);
  }

  // Simulate connection issues and reconnection
  public simulateDisconnect() {
    if (this.isConnected) {
      this.isConnected = false;
      this.trigger('close', { code: 1006, reason: 'Connection lost' });
      console.log('WebSocket connection lost, attempting to reconnect...');
      
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }
}

// Sample demo notifications to simulate real-time events
const demoNotifications: Partial<Notification>[] = [
  {
    title: "Work Order Updated",
    message: "Work order #WO-2023-089 has been marked as completed",
    type: "success",
    category: "workOrder",
    link: "/work-orders/89"
  },
  {
    title: "New Team Member",
    message: "Sarah Johnson has joined the maintenance team",
    type: "info",
    category: "team",
    link: "/team"
  },
  {
    title: "Low Inventory Alert",
    message: "Air filters (SKU: AF-2040) are running low",
    type: "warning",
    category: "inventory",
    link: "/inventory"
  },
  {
    title: "Invoice Overdue",
    message: "Invoice #INV-2023-054 is 7 days overdue",
    type: "error",
    category: "invoice",
    link: "/invoices/54"
  },
  {
    title: "Customer Request",
    message: "New service request from Acme Industries",
    type: "info",
    category: "customer",
    link: "/customers/16"
  }
];

export class NotificationService {
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

export const notificationService = NotificationService.getInstance();
