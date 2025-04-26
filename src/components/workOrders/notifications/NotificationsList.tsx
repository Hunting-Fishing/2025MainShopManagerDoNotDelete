
import React from 'react';
import { NotificationItem } from './NotificationItem';
import { WorkOrderNotification, NotificationsListProps } from '@/types/notification';

export function NotificationsList({ 
  notifications, 
  loading = false,
  emptyMessage = "No notifications" 
}: NotificationsListProps) {
  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="animate-pulse flex justify-center">
          <div className="h-4 w-4 bg-blue-200 rounded-full mx-1"></div>
          <div className="h-4 w-4 bg-blue-300 rounded-full mx-1 animate-pulse delay-150"></div>
          <div className="h-4 w-4 bg-blue-400 rounded-full mx-1 animate-pulse delay-300"></div>
        </div>
        <p className="text-gray-500 mt-2">Loading notifications...</p>
      </div>
    );
  }

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
