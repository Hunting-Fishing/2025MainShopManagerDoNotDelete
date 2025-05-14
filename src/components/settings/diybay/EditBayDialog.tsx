
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info, Save, Check } from "lucide-react";
import { BayDetails, RateType, RateModeType } from "@/types/diybay";
import { calculateRates } from "@/utils/rateCalculations";

interface EditBayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bay: BayDetails | null;
  onSave: (bay: BayDetails) => Promise<void>;
  defaultRateSettings: any;
}

export const EditBayDialog: React.FC<EditBayDialogProps> = ({
  isOpen,
  onClose,
  bay,
  onSave,
  defaultRateSettings,
}) => {
  const [editedBay, setEditedBay] = useState<BayDetails | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isManualRates, setIsManualRates] = useState(false);
  const [rateMode, setRateMode] = useState<RateModeType>("default");
  const [percentAdjustment, setPercentAdjustment] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Update state when bay changes
  React.useEffect(() => {
    if (bay) {
      setEditedBay({ ...bay });
      setIsManualRates(bay.rateType === "custom");
      setRateMode(bay.rateMode || "default");
      setPercentAdjustment(bay.percentAdjustment || 0);
    }
  }, [bay]);

  if (!editedBay) return null;

  const handleBasicInfoChange = (field: keyof BayDetails, value: string | number | boolean) => {
    setEditedBay((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleRateChange = (rateField: keyof BayDetails["rates"], value: number) => {
    if (!editedBay) return;

    setEditedBay({
      ...editedBay,
      rates: {
        ...editedBay.rates,
        [rateField]: value
      }
    });
  };

  const toggleManualRates = (enabled: boolean) => {
    setIsManualRates(enabled);
    if (enabled) {
      setRateMode("custom");
      handleBasicInfoChange("rateType", "custom");
    } else {
      setRateMode("default");
      handleBasicInfoChange("rateType", "default");
      
      // Reset rates to default calculated values
      if (editedBay && defaultRateSettings) {
        const calculatedRates = calculateRates(editedBay.rates.hourly, defaultRateSettings);
        setEditedBay({
          ...editedBay,
          rates: {
            ...editedBay.rates,
            ...calculatedRates
          }
        });
      }
    }
  };

  const handleRateModeChange = (mode: RateModeType) => {
    setRateMode(mode);
    handleBasicInfoChange("rateMode", mode);
    
    if (mode === "default") {
      handleBasicInfoChange("rateType", "default");
      setIsManualRates(false);
      
      // Reset rates to default
      if (editedBay && defaultRateSettings) {
        const calculatedRates = calculateRates(editedBay.rates.hourly, defaultRateSettings);
        setEditedBay({
          ...editedBay,
          rates: {
            ...editedBay.rates,
            ...calculatedRates
          }
        });
      }
    } 
    else if (mode === "percent") {
      handleBasicInfoChange("percentAdjustment", percentAdjustment);
    }
    else {
      handleBasicInfoChange("rateType", "custom");
      setIsManualRates(true);
    }
  };

  const handlePercentChange = (percent: number) => {
    setPercentAdjustment(percent);
    handleBasicInfoChange("percentAdjustment", percent);
    
    // Adjust rates based on percentage
    if (editedBay && defaultRateSettings) {
      const baseRates = calculateRates(editedBay.rates.hourly, defaultRateSettings);
      const adjustedRates = {
        hourly: editedBay.rates.hourly,
        daily: baseRates.daily * (1 + percent/100),
        weekly: baseRates.weekly * (1 + percent/100),
        monthly: baseRates.monthly * (1 + percent/100)
      };
      
      setEditedBay({
        ...editedBay,
        rates: adjustedRates
      });
    }
  };

  const handleSubmit = async () => {
    if (!editedBay) return;
    
    setIsSaving(true);
    setSaveStatus("saving");
    
    try {
      await onSave(editedBay);
      setSaveStatus("success");
      setTimeout(() => {
        setSaveStatus("idle");
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error saving bay:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate preview rates based on the current mode and settings
  const getPreviewRates = () => {
    if (!editedBay || !defaultRateSettings) return { daily: 0, weekly: 0, monthly: 0 };
    
    if (rateMode === "default") {
      return calculateRates(editedBay.rates.hourly, defaultRateSettings);
    }
    else if (rateMode === "percent") {
      const baseRates = calculateRates(editedBay.rates.hourly, defaultRateSettings);
      return {
        daily: baseRates.daily * (1 + percentAdjustment/100),
        weekly: baseRates.weekly * (1 + percentAdjustment/100),
        monthly: baseRates.monthly * (1 + percentAdjustment/100)
      };
    }
    else {
      return {
        daily: editedBay.rates.daily,
        weekly: editedBay.rates.weekly,
        monthly: editedBay.rates.monthly
      };
    }
  };

  const previewRates = getPreviewRates();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Bay: {editedBay.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="rates">Rates</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Bay Name</Label>
                <Input
                  id="name"
                  value={editedBay.name}
                  onChange={(e) => handleBasicInfoChange("name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editedBay.description || ""}
                  onChange={(e) => handleBasicInfoChange("description", e.target.value)}
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Inactive bays cannot be booked by customers
                  </p>
                </div>
                <Switch
                  checked={editedBay.active}
                  onCheckedChange={(checked) => handleBasicInfoChange("active", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Bay Rates</h3>
                <p className="text-sm text-gray-500">Set hourly, daily, weekly, and monthly rates</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Manual Rates</span>
                <Switch 
                  checked={isManualRates} 
                  onCheckedChange={toggleManualRates} 
                />
              </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <div className="space-y-2">
                <Label htmlFor="rateMode" className="text-sm">Rate Calculation Mode</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    type="button"
                    variant={rateMode === "default" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRateModeChange("default")}
                  >
                    Default Rates
                  </Button>
                  <Button 
                    type="button"
                    variant={rateMode === "percent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRateModeChange("percent")}
                  >
                    Percentage Adjustment
                  </Button>
                  <Button 
                    type="button"
                    variant={rateMode === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRateModeChange("custom")}
                  >
                    Custom Rates
                  </Button>
                </div>
              </div>

              {rateMode === "percent" && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="percentAdjustment">Price Adjustment (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="percentAdjustment"
                      type="number"
                      value={percentAdjustment}
                      onChange={(e) => handlePercentChange(parseFloat(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500">% adjustment from default rates</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Positive values increase prices, negative values decrease prices
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedBay.rates.hourly}
                  onChange={(e) => handleRateChange("hourly", parseFloat(e.target.value))}
                  className={isManualRates ? "border-blue-300" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyRate">
                  Daily Rate ($)
                  {!isManualRates && <span className="ml-2 text-xs text-gray-500">(Calculated)</span>}
                </Label>
                <Input
                  id="dailyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={isManualRates ? editedBay.rates.daily : previewRates.daily.toFixed(2)}
                  onChange={(e) => handleRateChange("daily", parseFloat(e.target.value))}
                  disabled={!isManualRates}
                  className={isManualRates ? "border-blue-300" : "bg-gray-50"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeklyRate">
                  Weekly Rate ($)
                  {!isManualRates && <span className="ml-2 text-xs text-gray-500">(Calculated)</span>}
                </Label>
                <Input
                  id="weeklyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={isManualRates ? editedBay.rates.weekly : previewRates.weekly.toFixed(2)}
                  onChange={(e) => handleRateChange("weekly", parseFloat(e.target.value))}
                  disabled={!isManualRates}
                  className={isManualRates ? "border-blue-300" : "bg-gray-50"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyRate">
                  Monthly Rate ($)
                  {!isManualRates && <span className="ml-2 text-xs text-gray-500">(Calculated)</span>}
                </Label>
                <Input
                  id="monthlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={isManualRates ? editedBay.rates.monthly : previewRates.monthly.toFixed(2)}
                  onChange={(e) => handleRateChange("monthly", parseFloat(e.target.value))}
                  disabled={!isManualRates}
                  className={isManualRates ? "border-blue-300" : "bg-gray-50"}
                />
              </div>
            </div>

            {!isManualRates && rateMode !== "custom" && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded text-sm border border-blue-100">
                <Info className="h-4 w-4 text-blue-600" />
                <span>
                  Daily, weekly, and monthly rates are automatically calculated based on your global rate settings.
                </span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Maximum Capacity</Label>
              <Input
                id="maxCapacity"
                type="number"
                min="1"
                value={editedBay.maxCapacity || 1}
                onChange={(e) => handleBasicInfoChange("maxCapacity", parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Maximum number of vehicles this bay can accommodate
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Bay Location</Label>
              <Input
                id="location"
                value={editedBay.location || ""}
                onChange={(e) => handleBasicInfoChange("location", e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Physical location identifier (e.g., "Building A, North Corner")
              </p>
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Featured Bay</Label>
                <p className="text-sm text-muted-foreground">
                  Featured bays appear at the top of booking listings
                </p>
              </div>
              <Switch
                checked={editedBay.featured || false}
                onCheckedChange={(checked) => handleBasicInfoChange("featured", checked)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center">
            {saveStatus === "success" && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" /> Saved successfully
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-sm text-red-600">Error saving changes</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
