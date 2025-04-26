
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from './NotificationItem';
import { WorkOrderNotification, NotificationsListProps } from '@/types/notification';

export function NotificationsList({ notifications, onMarkAsRead }: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500">
        No notifications found
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </ScrollArea>
  );
}
