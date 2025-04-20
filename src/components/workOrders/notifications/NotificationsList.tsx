
import React from 'react';
import { WorkOrderNotification } from '@/types/notification';
import { NotificationItem } from './NotificationItem';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationsListProps {
  notifications: WorkOrderNotification[];
  loading: boolean;
}

export function NotificationsList({ notifications, loading }: NotificationsListProps) {
  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No notifications yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </ScrollArea>
  );
}
