
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Edit } from "lucide-react";
import { Bay, RateSettings } from "@/services/diybay/diybayService";
import { formatCurrency } from "@/utils/rateCalculations";

interface EditBayDialogProps {
  bay: Bay | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bay: Bay) => Promise<boolean>;
  calculateRate: (type: "daily" | "weekly" | "monthly", hourlyRate: number) => number;
  settings: RateSettings;
  isSaving: boolean;
}

export const EditBayDialog: React.FC<EditBayDialogProps> = ({
  bay,
  isOpen,
  onClose,
  onSave,
  calculateRate,
  settings,
  isSaving,
}) => {
  const [editedBay, setEditedBay] = useState<Bay | null>(null);
  const [calculatedRates, setCalculatedRates] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });
  const [useCustomRates, setUseCustomRates] = useState({
    daily: false,
    weekly: false,
    monthly: false,
  });

  // Reset state when dialog opens with new bay
  useEffect(() => {
    if (bay) {
      setEditedBay({ ...bay });
      
      // Calculate rates from hourly rate
      const hourlyRate = bay.hourly_rate;
      const daily = calculateRate("daily", hourlyRate);
      const weekly = calculateRate("weekly", hourlyRate);
      const monthly = calculateRate("monthly", hourlyRate);
      
      setCalculatedRates({
        daily,
        weekly,
        monthly,
      });
      
      // Check if bay has custom rates
      setUseCustomRates({
        daily: bay.daily_rate !== null && bay.daily_rate !== daily,
        weekly: bay.weekly_rate !== null && bay.weekly_rate !== weekly,
        monthly: bay.monthly_rate !== null && bay.monthly_rate !== monthly,
      });
    }
  }, [bay, calculateRate]);

  const handleInputChange = (field: keyof Bay, value: string | number | boolean) => {
    if (!editedBay) return;

    let parsedValue = value;
    if (typeof value === "string" && ["hourly_rate", "daily_rate", "weekly_rate", "monthly_rate"].includes(field)) {
      // Allow empty string for rate fields
      parsedValue = value === "" ? 0 : parseFloat(value);
    }

    const updatedBay = { ...editedBay, [field]: parsedValue };
    setEditedBay(updatedBay);

    // Recalculate rates when hourly rate changes
    if (field === "hourly_rate") {
      const hourlyRate = parsedValue as number;
      setCalculatedRates({
        daily: calculateRate("daily", hourlyRate),
        weekly: calculateRate("weekly", hourlyRate),
        monthly: calculateRate("monthly", hourlyRate),
      });
    }
  };

  const toggleCustomRate = (type: "daily" | "weekly" | "monthly") => {
    if (!editedBay) return;

    const newUseCustom = !useCustomRates[type];
    setUseCustomRates({ ...useCustomRates, [type]: newUseCustom });

    // Reset to calculated rate if turning off custom
    if (!newUseCustom) {
      const updatedBay = {
        ...editedBay,
        [`${type}_rate`]: calculatedRates[type],
      };
      setEditedBay(updatedBay);
    }
  };

  const handleSubmit = async () => {
    if (!editedBay) return;
    
    // Apply calculated rates for non-custom fields
    const finalBay = { ...editedBay };
    if (!useCustomRates.daily) {
      finalBay.daily_rate = calculatedRates.daily;
    }
    if (!useCustomRates.weekly) {
      finalBay.weekly_rate = calculatedRates.weekly;
    }
    if (!useCustomRates.monthly) {
      finalBay.monthly_rate = calculatedRates.monthly;
    }
    
    const success = await onSave(finalBay);
    if (success) {
      onClose();
    }
  };

  if (!editedBay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Bay Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bay-name">Bay Name</Label>
              <Input
                id="bay-name"
                value={editedBay.bay_name || ""}
                onChange={(e) => handleInputChange("bay_name", e.target.value)}
                placeholder="e.g. Bay 1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bay-location">Location (Optional)</Label>
              <Input
                id="bay-location"
                value={editedBay.bay_location || ""}
                onChange={(e) => handleInputChange("bay_location", e.target.value)}
                placeholder="e.g. Main Building"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
            <Input
              id="hourly-rate"
              type="number"
              min="0"
              step="0.01"
              value={editedBay.hourly_rate || ""}
              onChange={(e) => handleInputChange("hourly_rate", e.target.value)}
              className="bg-white"
            />
            <p className="text-sm text-muted-foreground">
              Base hourly rate for this bay
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <h3 className="font-medium">Extended Rental Rates</h3>
          
          {/* Daily Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="daily-rate" className="flex items-center">
                Daily Rate
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 w-6 p-0"
                  onClick={() => toggleCustomRate("daily")}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">
                    {useCustomRates.daily ? "Use calculated rate" : "Set custom rate"}
                  </span>
                </Button>
              </Label>
              <span className="text-sm text-muted-foreground">
                Default: {formatCurrency(calculatedRates.daily)}
              </span>
            </div>
            
            <Input
              id="daily-rate"
              type="number"
              min="0"
              step="0.01"
              value={
                useCustomRates.daily
                  ? editedBay.daily_rate || ""
                  : calculatedRates.daily || ""
              }
              onChange={(e) => handleInputChange("daily_rate", e.target.value)}
              disabled={!useCustomRates.daily}
              className={!useCustomRates.daily ? "bg-slate-50" : "bg-white"}
            />
          </div>
          
          {/* Weekly Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="weekly-rate" className="flex items-center">
                Weekly Rate
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 w-6 p-0"
                  onClick={() => toggleCustomRate("weekly")}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">
                    {useCustomRates.weekly ? "Use calculated rate" : "Set custom rate"}
                  </span>
                </Button>
              </Label>
              <span className="text-sm text-muted-foreground">
                Default: {formatCurrency(calculatedRates.weekly)}
              </span>
            </div>
            
            <Input
              id="weekly-rate"
              type="number"
              min="0"
              step="0.01"
              value={
                useCustomRates.weekly
                  ? editedBay.weekly_rate || ""
                  : calculatedRates.weekly || ""
              }
              onChange={(e) => handleInputChange("weekly_rate", e.target.value)}
              disabled={!useCustomRates.weekly}
              className={!useCustomRates.weekly ? "bg-slate-50" : "bg-white"}
            />
          </div>
          
          {/* Monthly Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="monthly-rate" className="flex items-center">
                Monthly Rate
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 w-6 p-0"
                  onClick={() => toggleCustomRate("monthly")}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">
                    {useCustomRates.monthly ? "Use calculated rate" : "Set custom rate"}
                  </span>
                </Button>
              </Label>
              <span className="text-sm text-muted-foreground">
                Default: {formatCurrency(calculatedRates.monthly)}
              </span>
            </div>
            
            <Input
              id="monthly-rate"
              type="number"
              min="0"
              step="0.01"
              value={
                useCustomRates.monthly
                  ? editedBay.monthly_rate || ""
                  : calculatedRates.monthly || ""
              }
              onChange={(e) => handleInputChange("monthly_rate", e.target.value)}
              disabled={!useCustomRates.monthly}
              className={!useCustomRates.monthly ? "bg-slate-50" : "bg-white"}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
