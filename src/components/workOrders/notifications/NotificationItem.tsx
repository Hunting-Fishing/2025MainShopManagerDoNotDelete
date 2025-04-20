
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { WorkOrderNotification } from '@/types/notification';
import { Badge } from '@/components/ui/badge';
import { Bell, Info, Clock, Zap } from 'lucide-react';

interface NotificationItemProps {
  notification: WorkOrderNotification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getIcon = () => {
    switch (notification.notificationType) {
      case 'status_update':
        return <Info className="h-4 w-4" />;
      case 'assignment':
        return <Bell className="h-4 w-4" />;
      case 'automation':
        return <Zap className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50">
      <div className="shrink-0 mt-1">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm">{notification.title}</p>
          <Badge className={getStatusColor(notification.status)}>
            {notification.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
