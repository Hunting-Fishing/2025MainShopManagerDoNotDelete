
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Settings, Hash } from 'lucide-react';

interface WorkOrderNumberingSettings {
  prefix: string;
  separator: string;
  number_format: string;
  current_number: number;
  number_length: number;
  include_year: boolean;
  include_month: boolean;
  custom_format: string;
}

export function WorkOrderNumberingTab() {
  const [settings, setSettings] = useState<WorkOrderNumberingSettings>({
    prefix: 'WO',
    separator: '-',
    number_format: 'sequential',
    current_number: 1000,
    number_length: 4,
    include_year: false,
    include_month: false,
    custom_format: '{prefix}{separator}{number}'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Get the user's shop_id from their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .single();

      if (!profile?.shop_id) {
        toast.error('No shop found for user');
        return;
      }

      setShopId(profile.shop_id);

      // Load work order numbering settings
      const { data, error } = await supabase
        .from('company_settings')
        .select('settings_value')
        .eq('shop_id', profile.shop_id)
        .eq('settings_key', 'work_order_numbering')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.settings_value) {
        setSettings(data.settings_value as WorkOrderNumberingSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load work order numbering settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!shopId) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          shop_id: shopId,
          settings_key: 'work_order_numbering',
          settings_value: settings
        });

      if (error) throw error;

      toast.success('Work order numbering settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save work order numbering settings');
    } finally {
      setSaving(false);
    }
  };

  const generatePreview = () => {
    let preview = settings.custom_format;
    preview = preview.replace('{prefix}', settings.prefix);
    preview = preview.replace('{separator}', settings.separator);
    
    if (settings.include_year) {
      preview = preview.replace('{year}', new Date().getFullYear().toString());
    } else {
      preview = preview.replace('{year}', '');
    }
    
    if (settings.include_month) {
      preview = preview.replace('{month}', (new Date().getMonth() + 1).toString().padStart(2, '0'));
    } else {
      preview = preview.replace('{month}', '');
    }
    
    const nextNumber = (settings.current_number + 1).toString().padStart(settings.number_length, '0');
    preview = preview.replace('{number}', nextNumber);
    
    return preview;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Work Order Numbering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="prefix">Prefix</Label>
                <Input
                  id="prefix"
                  value={settings.prefix}
                  onChange={(e) => setSettings(prev => ({ ...prev, prefix: e.target.value }))}
                  placeholder="WO, SERVICE, REPAIR, etc."
                />
              </div>

              <div>
                <Label htmlFor="separator">Separator</Label>
                <Select
                  value={settings.separator}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, separator: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">Dash (-)</SelectItem>
                    <SelectItem value="_">Underscore (_)</SelectItem>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value=".">Period (.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="number_length">Number Length</Label>
                <Input
                  id="number_length"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.number_length}
                  onChange={(e) => setSettings(prev => ({ ...prev, number_length: parseInt(e.target.value) || 4 }))}
                />
              </div>

              <div>
                <Label htmlFor="current_number">Current Number</Label>
                <Input
                  id="current_number"
                  type="number"
                  min="1"
                  value={settings.current_number}
                  onChange={(e) => setSettings(prev => ({ ...prev, current_number: parseInt(e.target.value) || 1000 }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include_year"
                  checked={settings.include_year}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, include_year: checked }))}
                />
                <Label htmlFor="include_year">Include Year</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include_month"
                  checked={settings.include_month}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, include_month: checked }))}
                />
                <Label htmlFor="include_month">Include Month</Label>
              </div>

              <div>
                <Label htmlFor="custom_format">Custom Format</Label>
                <Input
                  id="custom_format"
                  value={settings.custom_format}
                  onChange={(e) => setSettings(prev => ({ ...prev, custom_format: e.target.value }))}
                  placeholder="{prefix}{separator}{number}"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available placeholders: {'{prefix}'}, {'{separator}'}, {'{number}'}, {'{year}'}, {'{month}'}
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="text-lg font-mono mt-1">{generatePreview()}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
