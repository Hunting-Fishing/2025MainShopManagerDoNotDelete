
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
      .channel('work-order-notifications-' + workOrderId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'work_order_notifications',
          filter: `work_order_id=eq.${workOrderId}`
        },
        (payload) => {
          setNotifications(current => [...current, payload.new as WorkOrderNotification]);
          
          toast({
            title: payload.new.title,
            description: payload.new.message,
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
      setNotifications(data || []);
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
