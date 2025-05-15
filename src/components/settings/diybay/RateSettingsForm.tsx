
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { RateSettings } from "@/services/diybay/diybayService";
import { ChevronDown, ChevronUp, Save } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface RateSettingsFormProps {
  settings: RateSettings;
  onSettingsChange: (field: keyof RateSettings, value: string | number) => void;
  onSaveSettings: () => Promise<boolean>;
  isSaving: boolean;
}

export const RateSettingsForm: React.FC<RateSettingsFormProps> = ({
  settings,
  onSettingsChange,
  onSaveSettings,
  isSaving,
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Changed to false so it's collapsed by default
  const [localSettings, setLocalSettings] = useState<RateSettings>({
    daily_hours: settings.daily_hours.toString(),
    daily_discount_percent: settings.daily_discount_percent.toString(),
    weekly_multiplier: settings.weekly_multiplier.toString(),
    monthly_multiplier: settings.monthly_multiplier.toString(),
    hourly_base_rate: settings.hourly_base_rate.toString()
  });

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings({
      daily_hours: settings.daily_hours.toString(),
      daily_discount_percent: settings.daily_discount_percent.toString(),
      weekly_multiplier: settings.weekly_multiplier.toString(),
      monthly_multiplier: settings.monthly_multiplier.toString(),
      hourly_base_rate: settings.hourly_base_rate.toString()
    });
  }, [settings]);

  // Handle local form input changes
  const handleInputChange = (field: keyof RateSettings, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save changes
  const handleSave = async () => {
    // Convert all string values to numbers for the parent component
    Object.keys(localSettings).forEach(key => {
      const field = key as keyof RateSettings;
      onSettingsChange(field, localSettings[field]);
    });
    
    const success = await onSaveSettings();
    return success;
  };

  return (
    <div className="mb-8">
      <Collapsible 
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="border rounded-md bg-white shadow-sm overflow-hidden"
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-slate-50 transition-colors">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold">Rate Calculation Settings</h3>
            <span className="ml-2 text-sm text-gray-500">
              Configure how rates are calculated for different rental periods
            </span>
          </div>
          {isExpanded ? 
            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
            <ChevronDown className="h-5 w-5 text-gray-500" />
          }
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 space-y-6 border-t">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Daily Hours Setting */}
              <FormField
                label="Daily Hours"
                description="Number of hours counted in a daily rate"
                type="text"
                value={localSettings.daily_hours}
                onChange={(e) => handleInputChange("daily_hours", e.target.value)}
                className="w-full"
              />
              
              {/* Daily Discount Setting */}
              <FormField
                label="Daily Discount (%)"
                description="Discount applied to daily rates"
                type="text"
                value={localSettings.daily_discount_percent}
                onChange={(e) => handleInputChange("daily_discount_percent", e.target.value)}
                className="w-full"
              />
              
              {/* Weekly Multiplier Setting */}
              <FormField
                label="Weekly Multiplier"
                description="Multiplier used for weekly rates (hourly × this value)"
                type="text"
                value={localSettings.weekly_multiplier}
                onChange={(e) => handleInputChange("weekly_multiplier", e.target.value)}
                className="w-full"
              />
              
              {/* Monthly Multiplier Setting */}
              <FormField
                label="Monthly Multiplier"
                description="Multiplier used for monthly rates (hourly × this value)"
                type="text"
                value={localSettings.monthly_multiplier}
                onChange={(e) => handleInputChange("monthly_multiplier", e.target.value)}
                className="w-full"
              />
              
              {/* Hourly Base Rate Setting */}
              <FormField
                label="Default Hourly Rate"
                description="Base hourly rate for new bays"
                type="text"
                value={localSettings.hourly_base_rate}
                onChange={(e) => handleInputChange("hourly_base_rate", e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? "Saving..." : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
