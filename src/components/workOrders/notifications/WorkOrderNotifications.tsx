
import React, { useEffect } from 'react';
import { useWorkOrderNotifications } from '@/hooks/workOrders/useWorkOrderNotifications';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function WorkOrderNotifications({ workOrderId }: { workOrderId: string }) {
  const { notifications, loading } = useWorkOrderNotifications(workOrderId);

  useEffect(() => {
    const processPendingNotifications = async () => {
      const pendingNotifications = notifications.filter(n => n.status === 'pending')
      
      if (pendingNotifications.length === 0) return

      try {
        const response = await supabase.functions.invoke('process-notifications', {
          body: { notification_ids: pendingNotifications.map(n => n.id) }
        })

        if (!response.data?.success) {
          throw new Error('Failed to process notifications')
        }
      } catch (error) {
        console.error('Notification processing error:', error)
        toast({
          title: 'Notification Error',
          description: 'Failed to send notifications',
          variant: 'destructive'
        })
      }
    }

    processPendingNotifications()
  }, [notifications]);

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div>No notifications</div>
          ) : (
            notifications.map(notification => (
              <div key={notification.id} className="border-b py-2">
                <div className="font-semibold">{notification.title}</div>
                <div className="text-sm text-muted-foreground">{notification.message}</div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
