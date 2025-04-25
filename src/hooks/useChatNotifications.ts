
import { useCallback } from 'react';
import { Notification } from '@/types/notification';
import { useNotifications } from '@/context/notifications';
import { playNotificationSound } from '@/utils/notificationSounds';

export function useChatNotifications() {
  const { notifications: existingNotifications } = useNotifications();

  const addChatNotification = useCallback((
    title: string,
    message: string,
    chatId?: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    // Create a notification
    const notification: Notification = {
      id: `chat-${Date.now()}`,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString(),
      link: chatId ? `/chats/${chatId}` : undefined,
      type,
      source: 'chat',
      category: 'communication' // This property is allowed in our updated Notification type
    };

    // Play notification sound based on type
    switch (type) {
      case 'info':
        playNotificationSound('default');
        break;
      case 'success':
        playNotificationSound('soft');
        break;
      case 'warning':
      case 'error':
        playNotificationSound('bell');
        break;
    }

    return notification;
  }, []);

  return { addChatNotification };
}
