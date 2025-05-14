
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RateSettings } from "@/services/diybay/diybayService";
import { Slider } from "@/components/ui/slider";
import { Save } from "lucide-react";

export interface RateSettingsFormProps {
  settings: RateSettings;
  onSettingsChange: (field: keyof RateSettings, value: number) => void;
  onSaveSettings: () => Promise<boolean | void>; // Accept both boolean or void return types
  isSaving: boolean;
}

export const RateSettingsForm: React.FC<RateSettingsFormProps> = ({
  settings,
  onSettingsChange,
  onSaveSettings,
  isSaving
}) => {
  const handleSliderChange = (value: number[]) => {
    onSettingsChange('daily_discount_percent', value[0]);
  };

  return (
    <Card className="mb-8 border-gray-100 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
        <CardTitle className="text-indigo-700">DIY Bay Rate Settings</CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="hourlyBaseRate" className="block text-sm font-medium mb-2">
              Base Hourly Rate ($/hour)
            </Label>
            <Input
              id="hourlyBaseRate"
              type="number"
              value={settings.hourly_base_rate === undefined ? '' : settings.hourly_base_rate}
              onChange={(e) => onSettingsChange('hourly_base_rate', parseFloat(e.target.value))}
              className="w-full border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">Default hourly rate applied to all bays</p>
          </div>

          <div>
            <Label htmlFor="dailyHours" className="block text-sm font-medium mb-2">
              Hours in Daily Rate
            </Label>
            <Input
              id="dailyHours"
              type="number"
              value={settings.daily_hours}
              onChange={(e) => onSettingsChange('daily_hours', parseInt(e.target.value, 10))}
              className="w-full border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">Number of hours charged for a day rate</p>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="dailyDiscount" className="block text-sm font-medium mb-2">
              Daily Discount ({settings.daily_discount_percent}%)
            </Label>
            <div className="pt-2 px-1">
              <Slider
                id="dailyDiscount"
                defaultValue={[settings.daily_discount_percent]}
                max={50}
                step={1}
                onValueChange={handleSliderChange}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Discount applied to daily rate</p>
          </div>

          <div>
            <Label htmlFor="weeklyMultiplier" className="block text-sm font-medium mb-2">
              Weekly Rate Multiplier
            </Label>
            <Input
              id="weeklyMultiplier"
              type="number"
              value={settings.weekly_multiplier}
              onChange={(e) => onSettingsChange('weekly_multiplier', parseFloat(e.target.value))}
              className="w-full border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">Hourly rate is multiplied by this value for weekly rates</p>
          </div>

          <div>
            <Label htmlFor="monthlyMultiplier" className="block text-sm font-medium mb-2">
              Monthly Rate Multiplier
            </Label>
            <Input
              id="monthlyMultiplier"
              type="number"
              value={settings.monthly_multiplier}
              onChange={(e) => onSettingsChange('monthly_multiplier', parseFloat(e.target.value))}
              className="w-full border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">Hourly rate is multiplied by this value for monthly rates</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={onSaveSettings}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-full flex items-center"
          >
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RateSettingsForm;
