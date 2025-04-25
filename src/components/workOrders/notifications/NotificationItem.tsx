
import React from 'react';
import { WorkOrderNotification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: WorkOrderNotification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <div className={`p-3 border-b ${notification.read ? 'bg-white' : 'bg-blue-50'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{notification.title}</h3>
          <p className="text-sm text-gray-600">{notification.message}</p>
        </div>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
        </span>
      </div>
      {notification.action && (
        <div className="mt-2">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            {notification.action}
          </button>
        </div>
      )}
    </div>
  );
}
