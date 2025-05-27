
import React, { useRef, useState } from 'react';
import { useNotifications } from '@/context/notifications';
import { NotificationItem } from './NotificationItem';
import { NotificationErrorBoundary } from './NotificationErrorBoundary';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { NotificationsDropdownHeader } from './NotificationsDropdownHeader';
import { NotificationsTabNavigation } from './NotificationsTabNavigation';
import { NotificationsEmptyState } from './NotificationsEmptyState';

interface NotificationsDropdownProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function NotificationsDropdown({ children, align = 'end' }: NotificationsDropdownProps) {
  return (
    <NotificationErrorBoundary>
      <NotificationsDropdownContent align={align}>
        {children}
      </NotificationsDropdownContent>
    </NotificationErrorBoundary>
  );
}

function NotificationsDropdownContent({ children, align }: NotificationsDropdownProps) {
  const { 
    notifications, 
    unreadCount, 
    connectionStatus,
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    clearAllNotifications,
    triggerTestNotification
  } = useNotifications();
  
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter notifications based on active tab with error handling
  const filteredNotifications = React.useMemo(() => {
    try {
      return notifications.filter(notification => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !notification.read;
        return notification.category === activeTab;
      });
    } catch (error) {
      console.error('Error filtering notifications:', error);
      return [];
    }
  }, [notifications, activeTab]);

  // Count notifications by category with error handling
  const categoryCounts = React.useMemo(() => {
    try {
      return notifications.reduce((acc, notification) => {
        const category = notification.category || 'system';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Error counting notifications by category:', error);
      return {};
    }
  }, [notifications]);

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleClearAllNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      clearAllNotifications();
      setActiveTab('all');
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const handleTriggerTestNotification = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      triggerTestNotification();
    } catch (error) {
      console.error('Error triggering test notification:', error);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        ref={dropdownRef}
        align={align} 
        className="w-96 p-0 max-h-[calc(100vh-100px)] flex flex-col" 
        sideOffset={8}
      >
        <NotificationErrorBoundary>
          <NotificationsDropdownHeader 
            unreadCount={unreadCount}
            connectionStatus={connectionStatus}
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearAllNotifications={handleClearAllNotifications}
          />
        </NotificationErrorBoundary>
        
        {/* Tab navigation for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <NotificationErrorBoundary>
            <NotificationsTabNavigation 
              activeTab={activeTab}
              notificationsCount={notifications.length}
              unreadCount={unreadCount}
              categoryCounts={categoryCounts}
            />
          </NotificationErrorBoundary>
          
          <TabsContent value={activeTab} className="m-0 overflow-y-auto max-h-[350px]">
            <NotificationErrorBoundary>
              {filteredNotifications.length === 0 ? (
                <NotificationsEmptyState 
                  connectionStatus={connectionStatus}
                  hasNotifications={notifications.length > 0}
                  onTriggerTest={handleTriggerTestNotification}
                />
              ) : (
                filteredNotifications.map(notification => (
                  <NotificationErrorBoundary key={notification.id}>
                    <NotificationItem 
                      notification={notification} 
                      onMarkAsRead={markAsRead}
                      onClear={clearNotification}
                    />
                  </NotificationErrorBoundary>
                ))
              )}
            </NotificationErrorBoundary>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
