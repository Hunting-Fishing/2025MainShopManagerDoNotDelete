
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { RateSettings } from "@/services/diybay/diybayService";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  isSaving,
}) => {
  // Local state to track form values
  const [localSettings, setLocalSettings] = useState<{
    [key in keyof RateSettings]?: string | number;
  }>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local settings from props
  useEffect(() => {
    setLocalSettings({
      daily_hours: settings.daily_hours.toString(),
      daily_discount_percent: settings.daily_discount_percent.toString(),
      weekly_multiplier: settings.weekly_multiplier.toString(),
      monthly_multiplier: settings.monthly_multiplier.toString(),
      hourly_base_rate: settings.hourly_base_rate.toString(),
    });
  }, [settings]);

  // Check if there are changes
  useEffect(() => {
    const hasAnyChanges =
      localSettings.daily_hours?.toString() !== settings.daily_hours?.toString() ||
      localSettings.daily_discount_percent?.toString() !== settings.daily_discount_percent?.toString() ||
      localSettings.weekly_multiplier?.toString() !== settings.weekly_multiplier?.toString() ||
      localSettings.monthly_multiplier?.toString() !== settings.monthly_multiplier?.toString() ||
      localSettings.hourly_base_rate?.toString() !== settings.hourly_base_rate?.toString();

    setHasChanges(hasAnyChanges);
  }, [localSettings, settings]);

  // Handle local input changes
  const handleLocalChange = (field: keyof RateSettings, value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save changes to parent component
  const handleSave = async () => {
    // Convert all form values to numbers before saving
    if (localSettings.daily_hours !== undefined) {
      onSettingsChange("daily_hours", localSettings.daily_hours === "" ? 0 : Number(localSettings.daily_hours));
    }
    if (localSettings.daily_discount_percent !== undefined) {
      onSettingsChange("daily_discount_percent", localSettings.daily_discount_percent === "" ? 0 : Number(localSettings.daily_discount_percent));
    }
    if (localSettings.weekly_multiplier !== undefined) {
      onSettingsChange("weekly_multiplier", localSettings.weekly_multiplier === "" ? 0 : Number(localSettings.weekly_multiplier));
    }
    if (localSettings.monthly_multiplier !== undefined) {
      onSettingsChange("monthly_multiplier", localSettings.monthly_multiplier === "" ? 0 : Number(localSettings.monthly_multiplier));
    }
    if (localSettings.hourly_base_rate !== undefined) {
      onSettingsChange("hourly_base_rate", localSettings.hourly_base_rate === "" ? 0 : Number(localSettings.hourly_base_rate));
    }

    const success = await onSaveSettings();
    if (success) {
      setHasChanges(false);
    }
    return success;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100">
            <h3 className="text-lg font-medium">Rate Calculation Settings</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="daily_hours" className="text-sm font-medium">
                    Daily Hours
                  </label>
                  <Input
                    id="daily_hours"
                    type="text"
                    value={localSettings.daily_hours || ""}
                    onChange={(e) => handleLocalChange("daily_hours", e.target.value)}
                    placeholder="8"
                    className="max-w-xs"
                  />
                  <p className="text-xs text-gray-500">
                    Number of hours included in a daily rate
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="daily_discount" className="text-sm font-medium">
                    Daily Discount (%)
                  </label>
                  <Input
                    id="daily_discount"
                    type="text"
                    value={localSettings.daily_discount_percent || ""}
                    onChange={(e) => handleLocalChange("daily_discount_percent", e.target.value)}
                    placeholder="25"
                    className="max-w-xs"
                  />
                  <p className="text-xs text-gray-500">
                    Percentage discount applied to daily rate
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="weekly_multiplier" className="text-sm font-medium">
                    Weekly Rate Multiplier
                  </label>
                  <Input
                    id="weekly_multiplier"
                    type="text"
                    value={localSettings.weekly_multiplier || ""}
                    onChange={(e) => handleLocalChange("weekly_multiplier", e.target.value)}
                    placeholder="20"
                    className="max-w-xs"
                  />
                  <p className="text-xs text-gray-500">
                    Multiplier for calculating weekly rate from hourly rate
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="monthly_multiplier" className="text-sm font-medium">
                    Monthly Rate Multiplier
                  </label>
                  <Input
                    id="monthly_multiplier"
                    type="text"
                    value={localSettings.monthly_multiplier || ""}
                    onChange={(e) => handleLocalChange("monthly_multiplier", e.target.value)}
                    placeholder="40"
                    className="max-w-xs"
                  />
                  <p className="text-xs text-gray-500">
                    Multiplier for calculating monthly rate from hourly rate
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="base_rate" className="text-sm font-medium">
                    Base Hourly Rate
                  </label>
                  <Input
                    id="base_rate"
                    type="text"
                    value={localSettings.hourly_base_rate || ""}
                    onChange={(e) => handleLocalChange("hourly_base_rate", e.target.value)}
                    placeholder="65"
                    className="max-w-xs"
                  />
                  <p className="text-xs text-gray-500">
                    Default hourly rate for new bays
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className={`px-4 flex items-center space-x-2 ${!hasChanges ? "opacity-50" : ""}`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{hasChanges ? "Save Changes" : "No Changes"}</span>
                  )}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
