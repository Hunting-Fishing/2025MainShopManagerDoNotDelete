import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DashboardWidget {
  id: string;
  name: string;
  enabled: boolean;
  position: number;
  [key: string]: any;
}

export interface DashboardPreferences {
  layout: 'compact' | 'detailed' | 'executive';
  refreshInterval: number; // in seconds
  widgets: DashboardWidget[];
  defaultView: 'default' | 'nonprofit';
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'statsCards', name: 'Key Statistics', enabled: true, position: 0 },
  { id: 'revenueChart', name: 'Revenue Chart', enabled: true, position: 1 },
  { id: 'serviceDistribution', name: 'Service Distribution', enabled: true, position: 2 },
  { id: 'technicianPerformance', name: 'Technician Performance', enabled: true, position: 3 },
  { id: 'workOrderProgress', name: 'Work Order Progress', enabled: true, position: 4 },
  { id: 'todaySchedule', name: 'Today\'s Schedule', enabled: true, position: 5 },
  { id: 'equipmentRecommendations', name: 'Equipment Recommendations', enabled: true, position: 6 },
  { id: 'dashboardAlerts', name: 'Alerts & Notifications', enabled: true, position: 7 },
];

const DEFAULT_PREFERENCES: DashboardPreferences = {
  layout: 'detailed',
  refreshInterval: 30,
  widgets: DEFAULT_WIDGETS,
  defaultView: 'default',
};

export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .eq('category', 'dashboard')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data?.preferences) {
        setPreferences({ 
          ...DEFAULT_PREFERENCES, 
          ...(data.preferences as unknown as DashboardPreferences)
        });
      }
    } catch (error) {
      console.error('Error loading dashboard preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<DashboardPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          category: 'dashboard',
          preferences: updatedPreferences as any,
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Preferences saved',
        description: 'Your dashboard preferences have been updated.',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save dashboard preferences.',
        variant: 'destructive',
      });
    }
  };

  const toggleWidget = (widgetId: string) => {
    const updatedWidgets = preferences.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget
    );
    savePreferences({ widgets: updatedWidgets });
  };

  const reorderWidgets = (widgets: DashboardWidget[]) => {
    const updatedWidgets = widgets.map((widget, index) => ({
      ...widget,
      position: index,
    }));
    savePreferences({ widgets: updatedWidgets });
  };

  const getEnabledWidgets = () => {
    return preferences.widgets
      .filter(widget => widget.enabled)
      .sort((a, b) => a.position - b.position);
  };

  return {
    preferences,
    isLoading,
    savePreferences,
    toggleWidget,
    reorderWidgets,
    getEnabledWidgets,
  };
}