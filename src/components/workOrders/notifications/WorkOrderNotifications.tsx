
import React from 'react';
import { useWorkOrderNotifications } from '@/hooks/workOrders/useWorkOrderNotifications';
import { AlertCircle, Bell, CheckCircle, Clock, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WorkOrderNotificationsProps {
  workOrderId: string;
}

export function WorkOrderNotifications({ workOrderId }: WorkOrderNotificationsProps) {
  const { notifications, loading } = useWorkOrderNotifications(workOrderId);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_update':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completion':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancellation':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'assignment':
        return <Info className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'status_update':
        return "bg-blue-50 border-blue-200";
      case 'completion':
        return "bg-green-50 border-green-200";
      case 'cancellation':
        return "bg-red-50 border-red-200";
      case 'assignment':
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading notifications...</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    getNotificationStyles(notification.notificationType),
                    notification.status === 'error' && "border-red-200 bg-red-50"
                  )}
                >
                  {getNotificationIcon(notification.notificationType)}
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    {notification.status === 'error' && notification.errorMessage && (
                      <p className="text-xs text-red-500 mt-1">
                        Error: {notification.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
