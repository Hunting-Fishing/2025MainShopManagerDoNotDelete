
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkOrderNotifications } from '@/hooks/useWorkOrderNotifications';

interface WorkOrderNotificationsProps {
  customerId: string;
}

export const WorkOrderNotifications: React.FC<WorkOrderNotificationsProps> = ({ customerId }) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    processPendingNotifications 
  } = useWorkOrderNotifications(customerId);

  // Process pending notifications on initial load
  useEffect(() => {
    if (!loading) {
      processPendingNotifications();
    }
  }, [loading, processPendingNotifications]);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-fuchsia-50">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 border-purple-300">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-purple-700 hover:text-purple-900 hover:bg-purple-50"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {notifications.length === 0 ? (
          <p className="text-center py-4 text-slate-500">No notifications yet</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 rounded-lg border ${notification.status === 'pending' ? 'bg-purple-50 border-purple-200' : 'border-slate-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {format(new Date(notification.created_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  {notification.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="ml-2 h-8 px-2"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
