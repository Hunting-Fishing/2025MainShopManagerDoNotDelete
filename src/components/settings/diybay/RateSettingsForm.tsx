
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RateSettings } from "@/services/diybay/diybayService";
import { Save, Check, Info } from "lucide-react";

interface RateSettingsFormProps {
  settings: RateSettings;
  onSettingsChange: (field: keyof RateSettings, value: number) => void;
  onSaveSettings: () => Promise<void>;
  isSaving: boolean;
}

export const RateSettingsForm: React.FC<RateSettingsFormProps> = ({
  settings,
  onSettingsChange,
  onSaveSettings,
  isSaving,
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [hasChanges, setHasChanges] = useState(false);

  // Update local settings when prop changes (initial load)
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleInputChange = (field: keyof RateSettings, value: number) => {
    setLocalSettings({ ...localSettings, [field]: value });
    onSettingsChange(field, value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await onSaveSettings();
      setSaveStatus("success");
      setHasChanges(false);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  return (
    <Card className="mt-6 mb-8 border-blue-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <CardTitle className="text-blue-800">Rate Calculation Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">How rates are calculated</h4>
              <p className="text-sm text-blue-700">
                These settings determine how daily, weekly, and monthly rates are calculated 
                from your hourly rates. Changes will apply to all bays using default pricing.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="daily_hours" className="font-medium">
              Daily Hours
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="daily_hours"
                type="number"
                min="1"
                max="24"
                value={localSettings.daily_hours}
                onChange={(e) => handleInputChange('daily_hours', parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-500">hours per day</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Number of hours used for daily rate calculation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily_discount_percent" className="font-medium">
              Daily Discount
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="daily_discount_percent"
                type="number"
                min="0"
                max="100"
                value={localSettings.daily_discount_percent}
                onChange={(e) => handleInputChange('daily_discount_percent', parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-500">% off daily total</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Percentage discount applied to (hourly rate × daily hours)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekly_multiplier" className="font-medium">
              Weekly Rate Multiplier
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="weekly_multiplier"
                type="number"
                min="1"
                value={localSettings.weekly_multiplier}
                onChange={(e) => handleInputChange('weekly_multiplier', parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-500">× hourly rate</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Multiplier applied to hourly rate for weekly pricing
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_multiplier" className="font-medium">
              Monthly Rate Multiplier
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="monthly_multiplier"
                type="number"
                min="1"
                value={localSettings.monthly_multiplier}
                onChange={(e) => handleInputChange('monthly_multiplier', parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-500">× hourly rate</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Multiplier applied to hourly rate for monthly pricing
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <div className="flex items-center gap-3">
            {saveStatus === "success" && (
              <span className="text-sm text-green-600 flex items-center">
                <Check className="h-4 w-4 mr-1" /> Settings saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-sm text-red-600">Error saving settings</span>
            )}
            <Button 
              onClick={handleSave} 
              disabled={isSaving || saveStatus === "saving" || !hasChanges}
              className={`rounded-md px-4 ${hasChanges 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-100 text-gray-400'}`}
            >
              {saveStatus === "saving" || isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {hasChanges ? "Save Settings" : "No Changes"}
                </>
              )}
            </Button>
          </div>
        </div>

        {hasChanges && (
          <div className="mt-3 text-sm text-amber-600 flex justify-end">
            <span>You have unsaved changes</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
