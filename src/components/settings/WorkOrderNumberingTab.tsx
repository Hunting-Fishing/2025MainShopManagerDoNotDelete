
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useShopId } from '@/hooks/useShopId';

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

const defaultSettings: WorkOrderNumberingSettings = {
  prefix: 'WO',
  separator: '-',
  number_format: 'sequential',
  current_number: 1000,
  number_length: 4,
  include_year: false,
  include_month: false,
  custom_format: '{prefix}{separator}{number}'
};

export function WorkOrderNumberingTab() {
  const [settings, setSettings] = useState<WorkOrderNumberingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const shopId = useShopId();

  useEffect(() => {
    if (shopId) {
      loadSettings();
    }
  }, [shopId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('settings_value')
        .eq('shop_id', shopId)
        .eq('settings_key', 'work_order_numbering')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.settings_value) {
        // Type assertion since we know the structure from our SQL migration
        const loadedSettings = data.settings_value as unknown as WorkOrderNumberingSettings;
        setSettings({ ...defaultSettings, ...loadedSettings });
      }
    } catch (error) {
      console.error('Error loading work order numbering settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!shopId) {
      toast.error('Shop ID not found');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert({
          shop_id: shopId,
          settings_key: 'work_order_numbering',
          settings_value: settings as any // Type assertion for Json compatibility
        });

      if (error) throw error;

      toast.success('Work order numbering settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
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
    
    const numberPart = (settings.current_number + 1).toString().padStart(settings.number_length, '0');
    preview = preview.replace('{number}', numberPart);
    
    return preview;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Work Order Numbering</h2>
        <p className="text-muted-foreground">
          Configure how work order numbers are generated for your shop
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Number Format Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Next Work Order Number Preview</Label>
            <div className="mt-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {generatePreview()}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Basic Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prefix">Prefix</Label>
              <Input
                id="prefix"
                value={settings.prefix}
                onChange={(e) => setSettings(prev => ({ ...prev, prefix: e.target.value }))}
                placeholder="WO"
              />
            </div>
            <div>
              <Label htmlFor="separator">Separator</Label>
              <Input
                id="separator"
                value={settings.separator}
                onChange={(e) => setSettings(prev => ({ ...prev, separator: e.target.value }))}
                placeholder="-"
              />
            </div>
          </div>

          {/* Number Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current_number">Current Number</Label>
              <Input
                id="current_number"
                type="number"
                value={settings.current_number}
                onChange={(e) => setSettings(prev => ({ ...prev, current_number: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Next work order will use {settings.current_number + 1}
              </p>
            </div>
            <div>
              <Label htmlFor="number_length">Number Length (with zeros)</Label>
              <Input
                id="number_length"
                type="number"
                min="1"
                max="10"
                value={settings.number_length}
                onChange={(e) => setSettings(prev => ({ ...prev, number_length: parseInt(e.target.value) || 4 }))}
              />
            </div>
          </div>

          {/* Date Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Date Components</Label>
            <div className="flex items-center justify-between">
              <div>
                <Label>Include Year</Label>
                <p className="text-sm text-muted-foreground">Add current year to work order number</p>
              </div>
              <Switch
                checked={settings.include_year}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, include_year: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Include Month</Label>
                <p className="text-sm text-muted-foreground">Add current month to work order number</p>
              </div>
              <Switch
                checked={settings.include_month}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, include_month: checked }))}
              />
            </div>
          </div>

          {/* Custom Format */}
          <div>
            <Label htmlFor="custom_format">Custom Format</Label>
            <Input
              id="custom_format"
              value={settings.custom_format}
              onChange={(e) => setSettings(prev => ({ ...prev, custom_format: e.target.value }))}
              placeholder="{prefix}{separator}{number}"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Available variables: {'{prefix}'}, {'{separator}'}, {'{year}'}, {'{month}'}, {'{number}'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
