
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkOrderNotification } from '@/types/notification';
import { useToast } from '@/hooks/use-toast';

export function useWorkOrderNotifications(workOrderId?: string) {
  const [notifications, setNotifications] = useState<WorkOrderNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!workOrderId) return;

    // Subscribe to real-time notifications
    const channel = supabase
      .channel(`work-order-notifications-${workOrderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'work_order_notifications',
          filter: `work_order_id=eq.${workOrderId}`
        },
        (payload) => {
          // Convert snake_case database fields to camelCase for our frontend
          const notification: WorkOrderNotification = {
            id: payload.new.id,
            workOrderId: payload.new.work_order_id,
            notificationType: payload.new.notification_type,
            title: payload.new.title,
            message: payload.new.message,
            recipientType: payload.new.recipient_type,
            recipientId: payload.new.recipient_id,
            status: payload.new.status,
            sentAt: payload.new.sent_at,
            errorMessage: payload.new.error_message,
            createdAt: payload.new.created_at,
            updatedAt: payload.new.updated_at
          };
          
          setNotifications(current => [...current, notification]);
          
          // For automation notifications, we use a special visual treatment
          const variant = notification.notificationType === 'automation' ? 'default' : 'default';
          
          toast({
            title: payload.new.title,
            description: payload.new.message,
            variant
          });
        }
      )
      .subscribe();

    // Initial fetch
    fetchNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workOrderId]);

  const fetchNotifications = async () => {
    if (!workOrderId) return;

    try {
      const { data, error } = await supabase
        .from('work_order_notifications')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert snake_case database fields to camelCase for our frontend
      const formattedNotifications: WorkOrderNotification[] = (data || []).map(item => ({
        id: item.id,
        workOrderId: item.work_order_id,
        notificationType: item.notification_type,
        title: item.title,
        message: item.message,
        recipientType: item.recipient_type,
        recipientId: item.recipient_id,
        status: item.status,
        sentAt: item.sent_at,
        errorMessage: item.error_message,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    notifications,
    loading
  };
}
