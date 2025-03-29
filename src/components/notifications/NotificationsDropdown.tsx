
import React, { useRef, useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationsContext';
import { NotificationItem } from './NotificationItem';
import { Check, BellOff, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center">
            <h3 className="font-medium">Notifications</h3>
            <div className="ml-2 flex items-center">
              {connectionStatus ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs border-green-200 flex items-center gap-1 py-0 h-5">
                  <Wifi className="h-3 w-3" />
                  <span>Connected</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs border-amber-200 flex items-center gap-1 py-0 h-5">
                  <WifiOff className="h-3 w-3" />
                  <span>Offline</span>
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAllNotifications}
                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>
        
        {/* Tab navigation for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 py-2 border-b border-slate-100">
            <TabsList className="grid grid-cols-4 h-8">
              <TabsTrigger value="all" className="text-xs h-7">
                All
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 py-0 h-4 min-w-4">{notifications.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs h-7">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 py-0 h-4 min-w-4">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="workOrder" className="text-xs h-7">
                Work Orders
                {categoryCounts.workOrder && (
                  <Badge variant="secondary" className="ml-1 px-1 py-0 h-4 min-w-4">{categoryCounts.workOrder}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="inventory" className="text-xs h-7">
                Inventory
                {categoryCounts.inventory && (
                  <Badge variant="secondary" className="ml-1 px-1 py-0 h-4 min-w-4">{categoryCounts.inventory}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="m-0 overflow-y-auto max-h-[350px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <BellOff className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-500">No notifications</p>
                <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                {!connectionStatus && (
                  <p className="text-xs text-amber-500 mt-3 max-w-xs">
                    You are currently offline. Notifications will sync when connection is restored.
                  </p>
                )}
                {notifications.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={(e) => {
                      e.preventDefault();
                      triggerTestNotification();
                    }}
                  >
                    Trigger test notification
                  </Button>
                )}
              </div>
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
