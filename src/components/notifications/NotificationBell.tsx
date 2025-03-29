
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/NotificationsContext';
import { NotificationsDropdown } from './NotificationsDropdown';

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <NotificationsDropdown>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500">
            {unreadCount > 9 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </span>
        )}
      </Button>
    </NotificationsDropdown>
  );
}
