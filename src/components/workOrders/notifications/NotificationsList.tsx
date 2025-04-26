
import React from 'react';
import { format } from 'date-fns';
import { WorkOrderNotification } from '@/types/notification';
import { Bell, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface NotificationsListProps {
  notifications: WorkOrderNotification[];
  loading: boolean;
}

export function NotificationsList({ notifications, loading }: NotificationsListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-500 border-t-transparent"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        <p>No notifications yet</p>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_update':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completion':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'assignment':
        return <Bell className="h-4 w-4 text-purple-500" />;
      case 'schedule_update':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, h:mm a');
    } catch (e) {
      return 'Unknown time';
    }
  };

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
        >
          <div className="rounded-full bg-white p-1.5 border border-slate-200">
            {getNotificationIcon(notification.notification_type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{notification.title}</p>
            <p className="text-sm text-slate-600 mt-0.5">{notification.message}</p>
            <p className="text-xs text-slate-500 mt-1">
              {formatNotificationTime(notification.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
