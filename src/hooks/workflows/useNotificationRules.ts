import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationRule {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: any;
  target_audience: string;
  channels: string[];
  template_id: string | null;
  is_active: boolean;
  priority: number;
  delay_minutes: number;
  conditions: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useNotificationRules() {
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotificationRules = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notification_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotificationRules(data || []);
    } catch (error) {
      console.error('Error fetching notification rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification rules',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNotificationRule = async (ruleData: Partial<NotificationRule>) => {
    try {
      const { data, error } = await supabase
        .from('notification_rules')
        .insert([{
          ...ruleData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          shop_id: ruleData.shop_id || ((await supabase.from('profiles').select('shop_id').single()).data?.shop_id)
        }])
        .select()
        .single();

      if (error) throw error;

      setNotificationRules(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Notification rule created successfully'
      });
      return data;
    } catch (error) {
      console.error('Error creating notification rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create notification rule',
        variant: 'destructive'
      });
    }
  };

  const updateNotificationRule = async (id: string, updates: Partial<NotificationRule>) => {
    try {
      const { data, error } = await supabase
        .from('notification_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNotificationRules(prev => 
        prev.map(rule => rule.id === id ? { ...rule, ...data } : rule)
      );

      toast({
        title: 'Success',
        description: 'Notification rule updated successfully'
      });
      return data;
    } catch (error) {
      console.error('Error updating notification rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification rule',
        variant: 'destructive'
      });
    }
  };

  const toggleRule = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('notification_rules')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setNotificationRules(prev => 
        prev.map(rule => 
          rule.id === id ? { ...rule, is_active: isActive } : rule
        )
      );

      toast({
        title: 'Success',
        description: `Notification rule ${isActive ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error('Error toggling notification rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification rule status',
        variant: 'destructive'
      });
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notification_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotificationRules(prev => prev.filter(rule => rule.id !== id));

      toast({
        title: 'Success',
        description: 'Notification rule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting notification rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification rule',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchNotificationRules();
  }, []);

  return {
    notificationRules,
    isLoading,
    createNotificationRule,
    updateNotificationRule,
    toggleRule,
    deleteRule,
    refetch: fetchNotificationRules
  };
}