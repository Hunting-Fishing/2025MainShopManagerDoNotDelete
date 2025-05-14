
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Check, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RateSettings } from "@/services/diybay/diybayService";
import { formatCurrency } from "@/utils/rateCalculations";

interface RateSettingsFormProps {
  settings: RateSettings;
  onSettingsChange: (field: keyof RateSettings, value: number) => void;
  onSaveSettings: () => Promise<boolean>;
  isSaving: boolean;
}

export function RateSettingsForm({
  settings,
  onSettingsChange,
  onSaveSettings,
  isSaving,
}: RateSettingsFormProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [hasChanges, setHasChanges] = useState(false);

  // Track if settings have changed from their initial values
  useEffect(() => {
    setSaveStatus("idle");
  }, [settings]);

  const handleChange = (field: keyof RateSettings, value: number) => {
    onSettingsChange(field, value);
    setHasChanges(true);
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    try {
      const result = await onSaveSettings();
      setSaveStatus(result ? "saved" : "error");
      if (result) {
        setHasChanges(false);
      }
    } catch (error) {
      setSaveStatus("error");
      console.error("Error saving settings:", error);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Rate Calculation Settings</CardTitle>
        <CardDescription>
          Configure how DIY bay rental rates are calculated based on the hourly rate
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8">
        <div className="grid gap-6">
          {/* Daily Rate Settings */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="daily_hours" className="text-base">Daily Rate Hours</Label>
              <span className="font-mono text-sm">{settings.daily_hours} hours</span>
            </div>
            <Slider
              id="daily_hours"
              min={1}
              max={24}
              step={0.5}
              value={[settings.daily_hours]}
              onValueChange={(value) => handleChange("daily_hours", value[0])}
              className="mb-1"
            />
            <div className="text-sm text-muted-foreground">
              <Info className="h-4 w-4 inline mr-1 mb-1" />
              Number of hours to bill for a full day rental
            </div>
          </div>

          {/* Daily Discount Settings */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="daily_discount_percent" className="text-base">Daily Rate Discount</Label>
              <span className="font-mono text-sm">{settings.daily_discount_percent}%</span>
            </div>
            <Slider
              id="daily_discount_percent"
              min={0}
              max={100}
              step={1}
              value={[settings.daily_discount_percent]}
              onValueChange={(value) => handleChange("daily_discount_percent", value[0])}
              className="mb-1"
            />
            <div className="text-sm text-muted-foreground">
              <Info className="h-4 w-4 inline mr-1 mb-1" />
              Discount applied to daily rates (% off hourly rate × hours)
            </div>
          </div>

          {/* Weekly Rate Settings */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="weekly_multiplier" className="text-base">Weekly Rate Multiplier</Label>
              <span className="font-mono text-sm">{settings.weekly_multiplier}×</span>
            </div>
            <Slider
              id="weekly_multiplier"
              min={1}
              max={168} // 24 hours * 7 days
              step={1}
              value={[settings.weekly_multiplier]}
              onValueChange={(value) => handleChange("weekly_multiplier", value[0])}
              className="mb-1"
            />
            <div className="text-sm text-muted-foreground">
              <Info className="h-4 w-4 inline mr-1 mb-1" />
              Multiply hourly rate by this value to calculate weekly rate
            </div>
          </div>

          {/* Monthly Rate Settings */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="monthly_multiplier" className="text-base">Monthly Rate Multiplier</Label>
              <span className="font-mono text-sm">{settings.monthly_multiplier}×</span>
            </div>
            <Slider
              id="monthly_multiplier"
              min={1}
              max={720} // 24 hours * 30 days
              step={1}
              value={[settings.monthly_multiplier]}
              onValueChange={(value) => handleChange("monthly_multiplier", value[0])}
              className="mb-1"
            />
            <div className="text-sm text-muted-foreground">
              <Info className="h-4 w-4 inline mr-1 mb-1" />
              Multiply hourly rate by this value to calculate monthly rate
            </div>
          </div>
        </div>

        {/* Example Calculations */}
        <Card className="bg-muted/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Rate Preview</CardTitle>
            <CardDescription>
              Example calculations using $50/hr base rate
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Hourly</div>
                <div className="text-lg">{formatCurrency(50)}</div>
              </div>
              <div>
                <div className="font-medium">Daily</div>
                <div className="text-lg">{formatCurrency(50 * settings.daily_hours * (1 - settings.daily_discount_percent/100))}</div>
              </div>
              <div>
                <div className="font-medium">Weekly</div>
                <div className="text-lg">{formatCurrency(50 * settings.weekly_multiplier)}</div>
              </div>
              <div>
                <div className="font-medium">Monthly</div>
                <div className="text-lg">{formatCurrency(50 * settings.monthly_multiplier)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>

      <CardFooter className="flex justify-between">
        {saveStatus === "saved" && (
          <div className="flex items-center text-green-600 text-sm">
            <Check className="h-4 w-4 mr-1" />
            Settings saved successfully
          </div>
        )}
        {saveStatus === "error" && (
          <div className="flex items-center">
            <Alert variant="destructive" className="p-2 h-auto">
              <AlertCircle className="h-4 w-4 mr-1" />
              <AlertDescription>Error saving settings</AlertDescription>
            </Alert>
          </div>
        )}
        <div className="ml-auto">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasChanges}
            className="min-w-[120px]"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
