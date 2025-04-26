
import React from 'react';
import { WorkOrderNotification } from '@/types/notification';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface NotificationItemProps {
  notification: WorkOrderNotification;
  onMarkAsRead?: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <Card className={`mb-3 ${notification.read ? 'bg-slate-50' : 'bg-white border-l-4 border-l-blue-500'}`}>
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="mr-3 mt-1">{getIcon()}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              <span className="text-xs text-slate-500">{getTimeAgo(notification.timestamp)}</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
            {notification.workOrderId && (
              <div className="mt-2 text-xs text-slate-500">
                Work Order: {notification.workOrderId}
              </div>
            )}
            {notification.status && (
              <div className="mt-1 text-xs">
                Status: <span className="font-medium">{notification.status}</span>
              </div>
            )}
            {!notification.read && (
              <button
                onClick={handleMarkAsRead}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
