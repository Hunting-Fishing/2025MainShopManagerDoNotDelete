
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function useWorkOrderNotifications(customerId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications when customer ID changes
  useEffect(() => {
    if (!customerId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Fetch work order notifications for this customer
        const { data, error } = await supabase
          .from('work_order_notifications')
          .select('*')
          .eq('recipient_type', 'customer')
          .eq('recipient_id', customerId)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setNotifications(data);
          setUnreadCount(data.filter(n => n.status === 'pending').length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notifications',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`customer-notifications-${customerId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'work_order_notifications',
          filter: `recipient_id=eq.${customerId}`,
        },
        (payload) => {
          // Add new notification to the list
          const newNotification = payload.new;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('work_order_notifications')
        .update({ status: 'read' })
        .eq('id', notificationId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification',
        variant: 'destructive',
      });
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!customerId) return;
    
    try {
      const { error } = await supabase
        .from('work_order_notifications')
        .update({ status: 'read' })
        .eq('recipient_id', customerId)
        .eq('status', 'pending');
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.status === 'pending' ? { ...n, status: 'read' } : n)
      );
      setUnreadCount(0);
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notifications',
        variant: 'destructive',
      });
    }
  }, [customerId]);

  // Process pending notifications (e.g., send emails/SMS)
  const processPendingNotifications = useCallback(async () => {
    if (!customerId) return;

    const pendingNotifications = notifications.filter(n => n.status === 'pending');
    if (pendingNotifications.length === 0) return;

    // In a real application, this would call a serverless function to send notifications
    // For now, we'll just mark them as sent
    try {
      const notificationIds = pendingNotifications.map(n => n.id);
      
      const { error } = await supabase
        .from('work_order_notifications')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .in('id', notificationIds);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => notificationIds.includes(n.id) 
          ? { ...n, status: 'sent', sent_at: new Date().toISOString() } 
          : n
        )
      );
      
      console.log('Processed notifications:', notificationIds);
    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  }, [customerId, notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    processPendingNotifications
  };
}
