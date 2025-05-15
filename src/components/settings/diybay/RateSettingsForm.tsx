
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { formatCurrency } from "@/utils/rateCalculations";
import { RateSettings } from "@/services/diybay/diybayService";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RateSettingsFormProps {
  settings: RateSettings;
  onSettingsChange: (field: keyof RateSettings, value: number) => void;
  onSaveSettings: () => Promise<boolean>;
  isSaving: boolean;
}

export const RateSettingsForm: React.FC<RateSettingsFormProps> = ({
  settings,
  onSettingsChange,
  onSaveSettings,
  isSaving,
}) => {
  const [localSettings, setLocalSettings] = useState<RateSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (field: keyof RateSettings, value: string) => {
    // Allow empty string or valid numbers
    const processedValue = value === '' ? '' : Number(value);
    
    // Only update if it's a valid number or empty string
    if (value === '' || !isNaN(Number(value))) {
      const updatedSettings = {
        ...localSettings,
        [field]: processedValue
      };
      
      setLocalSettings(updatedSettings);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    // Convert any empty strings to 0 before saving
    const settingsToSave = { ...localSettings };
    Object.keys(settingsToSave).forEach(key => {
      const field = key as keyof RateSettings;
      if (settingsToSave[field] === '') {
        settingsToSave[field] = 0;
      }
    });

    // Update parent component settings
    Object.keys(settingsToSave).forEach(key => {
      const field = key as keyof RateSettings;
      if (field !== 'id') {
        onSettingsChange(field, Number(settingsToSave[field]));
      }
    });

    // Trigger save
    const success = await onSaveSettings();
    if (success) {
      setHasChanges(false);
    }
  };

  // Determine if there are actual changes by comparing with original settings
  const hasActualChanges = () => {
    return Object.keys(settings).some(key => {
      const field = key as keyof RateSettings;
      const currentValue = localSettings[field];
      const originalValue = settings[field];
      
      // Compare empty string with 0 as equivalent
      if ((currentValue === '' && originalValue === 0) || 
          (currentValue === 0 && originalValue === '')) {
        return false;
      }
      
      return currentValue !== originalValue;
    });
  };

  return (
    <Accordion type="single" collapsible defaultValue="item-1" className="mb-6">
      <AccordionItem value="item-1">
        <AccordionTrigger className="py-4 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border border-gray-100">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-medium text-blue-700">Rate Calculation Settings</h3>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Card className="border-t-0 rounded-t-none shadow-md">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Daily Hours</label>
                  <Input
                    type="text"
                    value={localSettings.daily_hours === 0 && localSettings.daily_hours !== '' ? '' : localSettings.daily_hours}
                    onChange={(e) => handleSettingChange('daily_hours', e.target.value)}
                    className="border-gray-200"
                  />
                  <p className="text-xs text-gray-500">
                    Number of hours included in a daily rate
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Daily Discount (%)</label>
                  <Input
                    type="text"
                    value={localSettings.daily_discount_percent === 0 && localSettings.daily_discount_percent !== '' ? '' : localSettings.daily_discount_percent}
                    onChange={(e) => handleSettingChange('daily_discount_percent', e.target.value)}
                    className="border-gray-200"
                  />
                  <p className="text-xs text-gray-500">
                    Percentage discount applied to daily rates
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hourly Base Rate ($)</label>
                  <Input
                    type="text"
                    value={localSettings.hourly_base_rate === 0 && localSettings.hourly_base_rate !== '' ? '' : localSettings.hourly_base_rate}
                    onChange={(e) => handleSettingChange('hourly_base_rate', e.target.value)}
                    className="border-gray-200"
                  />
                  <p className="text-xs text-gray-500">
                    Default hourly rate for new bays
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Weekly Multiplier</label>
                  <Input
                    type="text"
                    value={localSettings.weekly_multiplier === 0 && localSettings.weekly_multiplier !== '' ? '' : localSettings.weekly_multiplier}
                    onChange={(e) => handleSettingChange('weekly_multiplier', e.target.value)}
                    className="border-gray-200"
                  />
                  <p className="text-xs text-gray-500">
                    Multiplied by hourly rate to calculate weekly rate
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Multiplier</label>
                  <Input
                    type="text"
                    value={localSettings.monthly_multiplier === 0 && localSettings.monthly_multiplier !== '' ? '' : localSettings.monthly_multiplier}
                    onChange={(e) => handleSettingChange('monthly_multiplier', e.target.value)}
                    className="border-gray-200"
                  />
                  <p className="text-xs text-gray-500">
                    Multiplied by hourly rate to calculate monthly rate
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <div className="pt-5">
                    <div className="text-sm font-medium mb-2">Daily Rate Calculation:</div>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm">
                      <p>Hourly Rate × {localSettings.daily_hours || '0'} hours</p>
                      <p>- {localSettings.daily_discount_percent || '0'}% discount</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasActualChanges()}
                  className={`rounded-full ${
                    hasActualChanges()
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {hasActualChanges() ? "Save Changes" : "No Changes"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
