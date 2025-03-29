
import React, { useRef, useState } from 'react';
import { useNotifications } from '@/context/NotificationsContext';
import { NotificationItem } from './NotificationItem';
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

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.category === activeTab;
  });

  // Count notifications by category
  const categoryCounts = notifications.reduce((acc, notification) => {
    const category = notification.category || 'system';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const handleClearAllNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAllNotifications();
    setActiveTab('all');
  };

  const handleTriggerTestNotification = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerTestNotification();
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
        <NotificationsDropdownHeader 
          unreadCount={unreadCount}
          connectionStatus={connectionStatus}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClearAllNotifications={handleClearAllNotifications}
        />
        
        {/* Tab navigation for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <NotificationsTabNavigation 
            activeTab={activeTab}
            notificationsCount={notifications.length}
            unreadCount={unreadCount}
            categoryCounts={categoryCounts}
          />
          
          <TabsContent value={activeTab} className="m-0 overflow-y-auto max-h-[350px]">
            {filteredNotifications.length === 0 ? (
              <NotificationsEmptyState 
                connectionStatus={connectionStatus}
                hasNotifications={notifications.length > 0}
                onTriggerTest={handleTriggerTestNotification}
              />
            ) : (
              filteredNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onMarkAsRead={markAsRead}
                  onClear={clearNotification}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
