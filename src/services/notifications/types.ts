
import { Notification } from "@/types/notification";

export interface NotificationServiceEvents {
  onNotification: (notification: Notification) => void;
  onConnectionStatus: (connected: boolean) => void;
}

export interface INotificationService {
  connect(userId: string): void;
  disconnect(): void;
  onNotification(listener: (notification: Notification) => void): () => void;
  onConnectionStatus(listener: (connected: boolean) => void): () => void;
  triggerDemoNotification(): void;
}
