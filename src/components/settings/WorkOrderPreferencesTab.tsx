
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Settings, User, Wrench } from 'lucide-react';

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
  const [userRole, setUserRole] = useState<string>('');
  const { toast } = useToast();

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

      setUserRole(data?.job_title || '');

      // Type guard and safe access to work_order_preferences
      const notificationPrefs = data?.notification_preferences;
      if (notificationPrefs && typeof notificationPrefs === 'object' && notificationPrefs !== null && !Array.isArray(notificationPrefs)) {
        const workOrderPrefs = (notificationPrefs as any).work_order_preferences;
        if (workOrderPrefs && typeof workOrderPrefs === 'object') {
          setPreferences({ ...DEFAULT_PREFERENCES, ...workOrderPrefs });
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
      console.error('Error loading work order preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
      toast({
        title: "Error",
        description: "Failed to load work order preferences",
        variant: "destructive"
      });
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
    
    return { auto_edit_mode: true };
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get current notification preferences
      const { data: currentData } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      // Prepare the preferences object that conforms to Json type
      const currentPrefs = currentData?.notification_preferences || {};
      const updatedPrefs = {
        ...(typeof currentPrefs === 'object' && currentPrefs !== null && !Array.isArray(currentPrefs) ? currentPrefs : {}),
        work_order_preferences: {
          auto_edit_mode: preferences.auto_edit_mode,
          show_all_tabs: preferences.show_all_tabs,
          default_status_filter: preferences.default_status_filter
        }
      };

      const { error } = await supabase
        .from('profiles')
        .update({ 
          notification_preferences: updatedPrefs as any
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work order preferences saved successfully"
      });
    } catch (error) {
      console.error('Error saving work order preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save work order preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (key: keyof WorkOrderPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getRoleBadgeVariant = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('technician')) return 'info';
    if (lowerRole.includes('advisor')) return 'warning';
    if (lowerRole.includes('manager')) return 'success';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-5 w-5" />
        <div>
          <h3 className="text-lg font-medium">Work Order Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Customize how work orders behave for your role and workflow
          </p>
        </div>
      </div>

      {userRole && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <CardTitle className="text-base">Your Role</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={getRoleBadgeVariant(userRole)}>
                {userRole}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Preferences are optimized for your role
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Editing Behavior
          </CardTitle>
          <CardDescription>
            Control how work orders open and behave when you access them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-edit">Auto-edit Mode</Label>
              <p className="text-sm text-muted-foreground">
                Automatically enter edit mode when opening work orders
              </p>
            </div>
            <Switch
              id="auto-edit"
              checked={preferences.auto_edit_mode}
              onCheckedChange={(checked) => handlePreferenceChange('auto_edit_mode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-tabs">Show All Tabs</Label>
              <p className="text-sm text-muted-foreground">
                Display all available tabs in work order details
              </p>
            </div>
            <Switch
              id="show-tabs"
              checked={preferences.show_all_tabs}
              onCheckedChange={(checked) => handlePreferenceChange('show_all_tabs', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Filters</CardTitle>
          <CardDescription>
            Set your preferred default filters for work order lists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="status-filter">Default Status Filter</Label>
            <select
              id="status-filter"
              className="w-full p-2 border rounded"
              value={preferences.default_status_filter}
              onChange={(e) => handlePreferenceChange('default_status_filter', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
