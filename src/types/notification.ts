
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
}
