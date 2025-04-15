
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LoyaltySettings } from "@/types/loyalty";

interface ProgramSettingsCardProps {
  settings: LoyaltySettings;
  isSaving: boolean;
  onSettingsChange: (field: string, value: any) => void;
  onToggleLoyalty: (enabled: boolean) => Promise<void>;
  onSaveSettings: () => Promise<void>;
}

export function ProgramSettingsCard({
  settings,
  isSaving,
  onSettingsChange,
  onToggleLoyalty,
  onSaveSettings
}: ProgramSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loyalty Program Settings</CardTitle>
        <CardDescription>
          Configure your shop's loyalty program settings and parameters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="loyaltyEnabled">Enable Loyalty Program</Label>
            <p className="text-sm text-muted-foreground">
              Turn on to allow customers to earn and redeem loyalty points
            </p>
          </div>
          <Switch
            id="loyaltyEnabled"
            checked={settings.is_enabled}
            onCheckedChange={onToggleLoyalty}
            disabled={isSaving}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="points_per_dollar">Points Per Dollar</Label>
          <Input
            id="points_per_dollar"
            name="points_per_dollar"
            type="number"
            min="0.1"
            step="0.1"
            value={settings.points_per_dollar}
            onChange={(e) => onSettingsChange('points_per_dollar', e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            How many loyalty points customers earn per dollar spent
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="points_expiration_days">Points Expiration (Days)</Label>
          <Input
            id="points_expiration_days"
            name="points_expiration_days"
            type="number"
            min="0"
            value={settings.points_expiration_days}
            onChange={(e) => onSettingsChange('points_expiration_days', e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Number of days until points expire (0 for no expiration)
          </p>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={onSaveSettings}
            disabled={isSaving}
            className="bg-esm-blue-600 hover:bg-esm-blue-700"
          >
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
