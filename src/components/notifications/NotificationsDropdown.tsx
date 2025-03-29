
import React, { useRef } from 'react';
import { useNotifications } from '@/context/NotificationsContext';
import { NotificationItem } from './NotificationItem';
import { Check, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NotificationsDropdownProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function NotificationsDropdown({ children, align = 'end' }: NotificationsDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        ref={dropdownRef}
        align={align} 
        className="w-80 p-0 max-h-[calc(100vh-100px)] flex flex-col" 
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <BellOff className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-500">No notifications</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            notifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onMarkAsRead={markAsRead}
                onClear={clearNotification}
              />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
