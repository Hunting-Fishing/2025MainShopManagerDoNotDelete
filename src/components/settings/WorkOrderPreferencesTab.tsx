
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface WorkOrderPreferences {
  auto_edit_mode: boolean;
  show_all_tabs: boolean;
  default_status_filter: string;
}

const DEFAULT_PREFERENCES: WorkOrderPreferences = {
  auto_edit_mode: true,
  show_all_tabs: true,
  default_status_filter: 'all'
};

export function WorkOrderPreferencesTab() {
  const [preferences, setPreferences] = useState<WorkOrderPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences, job_title')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const notificationPrefs = data?.notification_preferences;
      if (notificationPrefs && typeof notificationPrefs === 'object' && notificationPrefs !== null) {
        const workOrderPrefs = (notificationPrefs as any).work_order_preferences;
        if (workOrderPrefs && typeof workOrderPrefs === 'object') {
          setPreferences(workOrderPrefs as WorkOrderPreferences);
        } else {
          // Apply role-based defaults
          const roleBasedDefaults = getRoleBasedDefaults(data?.job_title);
          setPreferences({ ...DEFAULT_PREFERENCES, ...roleBasedDefaults });
        }
      } else {
        // Apply role-based defaults
        const roleBasedDefaults = getRoleBasedDefaults(data?.job_title);
        setPreferences({ ...DEFAULT_PREFERENCES, ...roleBasedDefaults });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load work order preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBasedDefaults = (jobTitle?: string): Partial<WorkOrderPreferences> => {
    const role = jobTitle?.toLowerCase() || '';
    
    if (role.includes('technician') || role.includes('advisor') || role.includes('manager')) {
      return { auto_edit_mode: true };
    }
    
    return { auto_edit_mode: true };
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current notification preferences
      const { data: currentData } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      const currentNotificationPrefs = currentData?.notification_preferences || {};
      const updatedNotificationPrefs = {
        ...(typeof currentNotificationPrefs === 'object' && currentNotificationPrefs !== null ? currentNotificationPrefs : {}),
        work_order_preferences: preferences
      };

      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: updatedNotificationPrefs })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work order preferences saved successfully",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error", 
        description: "Failed to save work order preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof WorkOrderPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Work Order Preferences</CardTitle>
          <CardDescription>
            Configure how work orders behave when you open them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-edit">Auto-Edit Mode</Label>
              <p className="text-sm text-muted-foreground">
                Automatically enter edit mode when opening work orders
              </p>
            </div>
            <Switch
              id="auto-edit"
              checked={preferences.auto_edit_mode}
              onCheckedChange={(checked) => updatePreference('auto_edit_mode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-tabs">Show All Tabs</Label>
              <p className="text-sm text-muted-foreground">
                Display all work order tabs by default
              </p>
            </div>
            <Switch
              id="show-tabs"
              checked={preferences.show_all_tabs}
              onCheckedChange={(checked) => updatePreference('show_all_tabs', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter">Default Status Filter</Label>
            <Select
              value={preferences.default_status_filter}
              onValueChange={(value) => updatePreference('default_status_filter', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default status filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
