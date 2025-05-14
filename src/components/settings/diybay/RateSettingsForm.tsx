
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RateSettings } from "@/services/diybay/diybayService";

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
  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle>Rate Calculation Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Daily Hours
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={settings.daily_hours}
                onChange={(e) =>
                  onSettingsChange("daily_hours", parseInt(e.target.value, 10))
                }
                className="w-24 px-3 py-2 border rounded-md"
                min="1"
                max="24"
              />
              <span className="ml-2 text-sm text-muted-foreground">
                hours per day
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Hours counted for a full day rate.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Daily Discount
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={settings.daily_discount_percent}
                onChange={(e) =>
                  onSettingsChange(
                    "daily_discount_percent",
                    parseInt(e.target.value, 10)
                  )
                }
                className="w-24 px-3 py-2 border rounded-md"
                min="0"
                max="100"
              />
              <span className="ml-2 text-sm text-muted-foreground">%</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Discount applied to the daily rate.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Weekly Rate Multiplier
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={settings.weekly_multiplier}
                onChange={(e) =>
                  onSettingsChange(
                    "weekly_multiplier",
                    parseFloat(e.target.value)
                  )
                }
                className="w-24 px-3 py-2 border rounded-md"
                min="1"
                step="0.5"
              />
              <span className="ml-2 text-sm text-muted-foreground">
                × hourly rate
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Weekly rate is calculated as hourly rate × this multiplier.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Monthly Rate Multiplier
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={settings.monthly_multiplier}
                onChange={(e) =>
                  onSettingsChange(
                    "monthly_multiplier",
                    parseFloat(e.target.value)
                  )
                }
                className="w-24 px-3 py-2 border rounded-md"
                min="1"
                step="1"
              />
              <span className="ml-2 text-sm text-muted-foreground">
                × hourly rate
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Monthly rate is calculated as hourly rate × this multiplier.
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
