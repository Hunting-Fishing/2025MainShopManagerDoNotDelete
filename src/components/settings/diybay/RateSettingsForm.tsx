
import React, { useState } from 'react';
import { RateSettings } from '@/services/diybay/diybayService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface RateSettingsFormProps {
  settings: RateSettings;
  onSettingsChange: (field: keyof RateSettings, value: number | string) => void;
  onSaveSettings: () => Promise<boolean>;
  isSaving: boolean;
}

export const RateSettingsForm: React.FC<RateSettingsFormProps> = ({
  settings,
  onSettingsChange,
  onSaveSettings,
  isSaving
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [localSettings, setLocalSettings] = useState<RateSettings>({
    ...settings,
    daily_hours: settings.daily_hours?.toString() || '',
    daily_discount_percent: settings.daily_discount_percent?.toString() || '',
    weekly_multiplier: settings.weekly_multiplier?.toString() || '',
    monthly_multiplier: settings.monthly_multiplier?.toString() || '',
    hourly_base_rate: settings.hourly_base_rate?.toString() || ''
  });
  
  const handleSettingsChange = (field: keyof RateSettings, value: string) => {
    // Allow empty string for deletion
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Pass the actual value to parent
    onSettingsChange(field, value);
  };

  const handleSaveClick = async () => {
    await onSaveSettings();
    // Collapse the panel after saving
    setIsOpen(false);
  };

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      className="mb-6 border border-gray-200 rounded-lg overflow-hidden"
    >
      <CollapsibleTrigger className="w-full bg-gradient-to-b from-white to-gray-50 px-6 py-4 flex items-center justify-between hover:bg-gray-50">
        <CardTitle className="text-xl font-semibold flex items-center">
          Rate Calculation Settings
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <Card className="border-0 shadow-none">
          <CardContent className="pt-4">
            <p className="text-gray-600 mb-4">
              Configure how DIY bay rates are calculated based on the hourly rate.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Daily Rate Settings */}
              <div className="space-y-2">
                <Label htmlFor="daily-hours" className="text-sm">
                  Daily Hours
                </Label>
                <div className="flex items-center">
                  <Input
                    id="daily-hours"
                    type="text"
                    inputMode="decimal"
                    value={localSettings.daily_hours}
                    onChange={(e) => handleSettingsChange('daily_hours', e.target.value)}
                    placeholder="8"
                    className="w-full"
                  />
                  <span className="ml-2 text-sm text-gray-500">hours</span>
                </div>
                <p className="text-xs text-gray-500">
                  Number of hours included in the daily rate
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="daily-discount" className="text-sm">
                  Daily Discount
                </Label>
                <div className="flex items-center">
                  <Input
                    id="daily-discount"
                    type="text"
                    inputMode="decimal"
                    value={localSettings.daily_discount_percent}
                    onChange={(e) => handleSettingsChange('daily_discount_percent', e.target.value)}
                    placeholder="25"
                    className="w-full"
                  />
                  <span className="ml-2 text-sm text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500">
                  Discount applied to daily rates
                </p>
              </div>
              
              {/* Weekly Rate Settings */}
              <div className="space-y-2">
                <Label htmlFor="weekly-multiplier" className="text-sm">
                  Weekly Rate Multiplier
                </Label>
                <div className="flex items-center">
                  <Input
                    id="weekly-multiplier"
                    type="text"
                    inputMode="decimal"
                    value={localSettings.weekly_multiplier}
                    onChange={(e) => handleSettingsChange('weekly_multiplier', e.target.value)}
                    placeholder="5"
                    className="w-full"
                  />
                  <span className="ml-2 text-sm text-gray-500">days</span>
                </div>
                <p className="text-xs text-gray-500">
                  Daily rates × this value = Weekly rate
                </p>
              </div>
              
              {/* Monthly Rate Settings */}
              <div className="space-y-2">
                <Label htmlFor="monthly-multiplier" className="text-sm">
                  Monthly Rate Multiplier
                </Label>
                <div className="flex items-center">
                  <Input
                    id="monthly-multiplier"
                    type="text"
                    inputMode="decimal"
                    value={localSettings.monthly_multiplier}
                    onChange={(e) => handleSettingsChange('monthly_multiplier', e.target.value)}
                    placeholder="20"
                    className="w-full"
                  />
                  <span className="ml-2 text-sm text-gray-500">days</span>
                </div>
                <p className="text-xs text-gray-500">
                  Daily rates × this value = Monthly rate
                </p>
              </div>
              
              {/* Base Hourly Rate */}
              <div className="space-y-2">
                <Label htmlFor="base-hourly-rate" className="text-sm">
                  Base Hourly Rate
                </Label>
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-500">$</span>
                  <Input
                    id="base-hourly-rate"
                    type="text"
                    inputMode="decimal"
                    value={localSettings.hourly_base_rate}
                    onChange={(e) => handleSettingsChange('hourly_base_rate', e.target.value)}
                    placeholder="65.00"
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Default hourly rate for new bays
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveClick} 
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
