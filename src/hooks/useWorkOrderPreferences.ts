
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WorkOrderPreferences {
  auto_edit_mode: boolean;
  show_all_tabs: boolean;
  default_status_filter: string;
}

const DEFAULT_PREFERENCES: WorkOrderPreferences = {
  auto_edit_mode: true, // Default to auto-edit for better UX
  show_all_tabs: true,
  default_status_filter: 'all'
};

export const useWorkOrderPreferences = () => {
  const [preferences, setPreferences] = useState<WorkOrderPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences, job_title')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Check if user has work order preferences set
      if (data?.notification_preferences?.work_order_preferences) {
        setPreferences(data.notification_preferences.work_order_preferences);
      } else {
        // Apply role-based defaults
        const roleBasedDefaults = getRoleBasedDefaults(data?.job_title);
        setPreferences({ ...DEFAULT_PREFERENCES, ...roleBasedDefaults });
      }
    } catch (error) {
      console.error('Error loading work order preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBasedDefaults = (jobTitle?: string): Partial<WorkOrderPreferences> => {
    const role = jobTitle?.toLowerCase() || '';
    
    // Technicians and service advisors get auto-edit by default
    if (role.includes('technician') || role.includes('advisor') || role.includes('manager')) {
      return { auto_edit_mode: true };
    }
    
    // Admin and other roles can have it enabled too for better UX
    return { auto_edit_mode: true };
  };

  const shouldAutoEdit = (): boolean => {
    return preferences.auto_edit_mode;
  };

  return {
    preferences,
    loading,
    shouldAutoEdit,
    refreshPreferences: loadPreferences
  };
};
