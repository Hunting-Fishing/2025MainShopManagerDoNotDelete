
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
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
  isSaving?: boolean;
}

export const RateSettingsForm: React.FC<RateSettingsFormProps> = ({
  settings,
  onSettingsChange,
  onSaveSettings,
  isSaving = false,
}) => {
  const [localSettings, setLocalSettings] = useState<RateSettings>({...settings});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Handle input changes locally without triggering parent state updates
  const handleInputChange = (field: keyof RateSettings, value: string) => {
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      setLocalSettings(prev => ({
        ...prev,
        [field]: numValue
      }));
      setHasChanges(true);
    }
  };
  
  // Only apply changes to parent state when save button is clicked
  const handleSaveClick = async () => {
    // Update parent state with local settings
    Object.keys(localSettings).forEach(key => {
      const field = key as keyof RateSettings;
      if (localSettings[field] !== settings[field]) {
        onSettingsChange(field, Number(localSettings[field]));
      }
    });
    
    // Save settings to database
    const success = await onSaveSettings();
    
    // Reset the changes flag if saved successfully
    if (success) {
      setHasChanges(false);
    }
  };

  return (
    <Card className="shadow-sm mb-8 border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <CardTitle className="text-blue-700 flex items-center justify-between">
          <span>Bay Rate Calculator Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="single" collapsible defaultValue="settings">
          <AccordionItem value="settings" className="border-0">
            <AccordionTrigger className="px-5 py-3 hover:bg-gray-50 font-medium">
              Rate Calculation Settings
            </AccordionTrigger>
            <AccordionContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }} className="p-5 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hourly_base_rate" className="text-sm font-medium">
                      Base Hourly Rate ($)
                    </Label>
                    <Input
                      id="hourly_base_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={localSettings.hourly_base_rate}
                      onChange={(e) => handleInputChange('hourly_base_rate', e.target.value)}
                      className="w-full border-gray-200 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      The default hourly rate for new bays
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="daily_hours" className="text-sm font-medium">
                      Daily Hours
                    </Label>
                    <Input
                      id="daily_hours"
                      type="number"
                      min="1"
                      step="1"
                      value={localSettings.daily_hours}
                      onChange={(e) => handleInputChange('daily_hours', e.target.value)}
                      className="w-full border-gray-200 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      Number of hours in a day rental
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="daily_discount_percent" className="text-sm font-medium">
                      Daily Discount (%)
                    </Label>
                    <Input
                      id="daily_discount_percent"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={localSettings.daily_discount_percent}
                      onChange={(e) => handleInputChange('daily_discount_percent', e.target.value)}
                      className="w-full border-gray-200 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      Discount applied to daily rate (% off hourly rate × daily hours)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weekly_multiplier" className="text-sm font-medium">
                      Weekly Rate Multiplier
                    </Label>
                    <Input
                      id="weekly_multiplier"
                      type="number"
                      min="0"
                      step="0.1"
                      value={localSettings.weekly_multiplier}
                      onChange={(e) => handleInputChange('weekly_multiplier', e.target.value)}
                      className="w-full border-gray-200 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      Multiplier to calculate weekly rate (hourly rate × multiplier)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="monthly_multiplier" className="text-sm font-medium">
                      Monthly Rate Multiplier
                    </Label>
                    <Input
                      id="monthly_multiplier"
                      type="number"
                      min="0"
                      step="0.1"
                      value={localSettings.monthly_multiplier}
                      onChange={(e) => handleInputChange('monthly_multiplier', e.target.value)}
                      className="w-full border-gray-200 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      Multiplier to calculate monthly rate (hourly rate × multiplier)
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    type="submit"
                    disabled={isSaving || !hasChanges}
                    className={`rounded-full px-6 ${hasChanges 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 text-gray-400'}`}
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {hasChanges ? "Save Changes" : "No Changes"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default RateSettingsForm;
