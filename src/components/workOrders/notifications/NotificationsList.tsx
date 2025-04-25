
import React from 'react';
import { NotificationItem } from './NotificationItem';
import { WorkOrderNotification } from '@/types/notification';

interface NotificationsListProps {
  notifications: WorkOrderNotification[];
  emptyMessage?: string;
}

export function NotificationsList({ 
  notifications, 
  emptyMessage = "No notifications" 
}: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
        />
      ))}
    </div>
  );
}
