
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, FileText, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkOrderPreferences {
  auto_edit_mode: boolean;
  show_all_tabs: boolean;
  default_status_filter: string;
}

export function WorkOrderPreferencesTab() {
  const [preferences, setPreferences] = useState<WorkOrderPreferences>({
    auto_edit_mode: true, // Default to auto-edit for better UX
    show_all_tabs: true,
    default_status_filter: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.notification_preferences?.work_order_preferences) {
        setPreferences(data.notification_preferences.work_order_preferences);
      }
    } catch (error) {
      console.error('Error loading work order preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current notification preferences
      const { data: currentData } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      const updatedPreferences = {
        ...currentData?.notification_preferences,
        work_order_preferences: preferences
      };

      const { error } = await supabase
        .from('profiles')
        .update({ 
          notification_preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
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
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof WorkOrderPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Work Order Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Configure how work orders behave and display for your workflow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Editing Behavior
          </CardTitle>
          <CardDescription>
            Control how work orders open and display
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-edit">Auto-edit mode</Label>
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
              <Label htmlFor="show-tabs">Show all tabs</Label>
              <p className="text-sm text-muted-foreground">
                Display all tabs in work order details view
              </p>
            </div>
            <Switch
              id="show-tabs"
              checked={preferences.show_all_tabs}
              onCheckedChange={(checked) => updatePreference('show_all_tabs', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Display Options
          </CardTitle>
          <CardDescription>
            Customize default views and filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default status filter</Label>
            <select
              className="w-full p-2 border border-input rounded-md bg-background"
              value={preferences.default_status_filter}
              onChange={(e) => updatePreference('default_status_filter', e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
