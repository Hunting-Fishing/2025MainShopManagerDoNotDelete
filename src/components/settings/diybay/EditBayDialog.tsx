import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Check, X, Info, AlertCircle } from "lucide-react";
import { Bay, RateSettings } from "@/services/diybay/diybayService";
import { BayDetails, RateMode } from "@/types/diybay";
import { 
  calculateDailyRate, 
  calculateWeeklyRate, 
  calculateMonthlyRate, 
  applyPercentageAdjustment,
  formatCurrency
} from "@/utils/rateCalculations";

interface EditBayDialogProps {
  bay: Bay | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bay: Bay) => Promise<boolean>;
  calculateRate: (type: 'daily' | 'weekly' | 'monthly', hourlyRate: number) => number;
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
  const [manualRates, setManualRates] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [rateMode, setRateMode] = useState<Record<string, RateMode>>({
    daily: { type: 'default' },
    weekly: { type: 'default' },
    monthly: { type: 'default' },
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (bay) {
      setEditedBay({ ...bay });
      
      // Determine if rates are manual (different from calculated defaults)
      const calculatedDaily = calculateRate('daily', bay.hourly_rate);
      const calculatedWeekly = calculateRate('weekly', bay.hourly_rate);
      const calculatedMonthly = calculateRate('monthly', bay.hourly_rate);
      
      const isManual = 
        (bay.daily_rate !== null && Math.abs(bay.daily_rate - calculatedDaily) > 0.01) ||
        (bay.weekly_rate !== null && Math.abs(bay.weekly_rate - calculatedWeekly) > 0.01) ||
        (bay.monthly_rate !== null && Math.abs(bay.monthly_rate - calculatedMonthly) > 0.01);
      
      setManualRates(isManual);
      
      // Reset rate modes
      setRateMode({
        daily: { type: 'default' },
        weekly: { type: 'default' },
        monthly: { type: 'default' },
      });
    }
    setHasChanges(false);
    setSaveStatus("idle");
  }, [bay, calculateRate]);

  const handleInputChange = (field: keyof Bay, value: string | number | boolean) => {
    if (!editedBay) return;
    
    setEditedBay({
      ...editedBay,
      [field]: value,
    });
    setHasChanges(true);
  };

  const handleRateChange = (type: 'hourly' | 'daily' | 'weekly' | 'monthly', value: string) => {
    if (!editedBay) return;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setEditedBay({
      ...editedBay,
      [`${type}_rate`]: numValue,
    });
    setHasChanges(true);
  };

  const handleRateModeChange = (type: 'daily' | 'weekly' | 'monthly', mode: RateMode) => {
    setRateMode({
      ...rateMode,
      [type]: mode,
    });
    
    if (!editedBay) return;
    
    // Apply the selected rate mode
    let newRate: number;
    const hourlyRate = editedBay.hourly_rate;
    
    if (mode.type === 'default') {
      newRate = calculateRate(type, hourlyRate);
    } else if (mode.type === 'percentage' && mode.percentage !== undefined) {
      const baseRate = calculateRate(type, hourlyRate);
      newRate = applyPercentageAdjustment(baseRate, mode.percentage);
    } else {
      // Keep current custom rate
      return;
    }
    
    setEditedBay({
      ...editedBay,
      [`${type}_rate`]: newRate,
    });
    setHasChanges(true);
  };

  const handlePercentageChange = (type: 'daily' | 'weekly' | 'monthly', percentage: number) => {
    setRateMode({
      ...rateMode,
      [type]: { type: 'percentage', percentage },
    });
    
    if (!editedBay) return;
    
    // Calculate and update the rate
    const baseRate = calculateRate(type, editedBay.hourly_rate);
    const adjustedRate = applyPercentageAdjustment(baseRate, percentage);
    
    setEditedBay({
      ...editedBay,
      [`${type}_rate`]: adjustedRate,
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!editedBay) return;
    
    setSaveStatus("saving");
    try {
      const result = await onSave(editedBay);
      setSaveStatus(result ? "success" : "error");
      if (result) {
        setTimeout(() => {
          setSaveStatus("idle");
          setHasChanges(false);
          onClose();
        }, 1000);
      }
    } catch (error) {
      setSaveStatus("error");
      console.error("Error saving bay:", error);
    }
  };

  const getCalculatedRates = () => {
    if (!editedBay) return { daily: 0, weekly: 0, monthly: 0 };
    
    return {
      daily: calculateRate('daily', editedBay.hourly_rate),
      weekly: calculateRate('weekly', editedBay.hourly_rate),
      monthly: calculateRate('monthly', editedBay.hourly_rate),
    };
  };

  const calculatedRates = getCalculatedRates();

  if (!isOpen || !editedBay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editedBay.bay_name ? `Edit ${editedBay.bay_name}` : "Edit Bay"}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="rates">Rates</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bay_name">Bay Name</Label>
                <Input
                  id="bay_name"
                  value={editedBay.bay_name}
                  onChange={(e) => handleInputChange("bay_name", e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bay_location">Location</Label>
                <Input
                  id="bay_location"
                  value={editedBay.bay_location || ""}
                  onChange={(e) => handleInputChange("bay_location", e.target.value)}
                  placeholder="Optional location description"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label htmlFor="hourly_rate">Hourly Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-[9px] text-gray-400">$</span>
                    <Input
                      id="hourly_rate"
                      className="pl-7"
                      type="number"
                      value={editedBay.hourly_rate}
                      onChange={(e) => handleRateChange("hourly", e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={editedBay.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Rates Tab */}
          <TabsContent value="rates" className="space-y-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="manual_rates"
                  checked={manualRates}
                  onCheckedChange={(checked) => setManualRates(checked)}
                />
                <Label htmlFor="manual_rates">Manual rate adjustment</Label>
              </div>
              
              {manualRates && (
                <div className="text-xs text-muted-foreground">
                  <AlertCircle className="h-3.5 w-3.5 inline-block mr-1" />
                  Rates won't update automatically when hourly rate changes
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Daily Rate */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily_rate">Daily Rate</Label>
                  {manualRates && (
                    <div className="flex gap-1.5 items-center">
                      <Button
                        size="sm"
                        variant={rateMode.daily.type === 'default' ? "secondary" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => handleRateModeChange('daily', { type: 'default' })}
                      >
                        Default
                      </Button>
                      <Button
                        size="sm"
                        variant={rateMode.daily.type === 'percentage' ? "secondary" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => handleRateModeChange('daily', { 
                          type: 'percentage', 
                          percentage: rateMode.daily.percentage || 0 
                        })}
                      >
                        % Adj
                      </Button>
                      <Button
                        size="sm"
                        variant={rateMode.daily.type === 'custom' ? "secondary" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => handleRateModeChange('daily', { type: 'custom' })}
                      >
                        Custom
                      </Button>
                    </div>
                  )}
                </div>
                
                {manualRates && rateMode.daily.type === 'percentage' ? (
                  <div className="relative">
                    <Input
                      type="number"
                      value={rateMode.daily.percentage || 0}
                      onChange={(e) => handlePercentageChange('daily', parseFloat(e.target.value))}
                      className="pl-7 pr-12"
                      min="-100"
                      step="1"
                    />
                    <span className="absolute left-3 top-[9px] text-gray-400">%</span>
                    <span className="absolute right-3 top-[9px] text-gray-400">
                      {formatCurrency(editedBay.daily_rate || 0)}
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3 top-[9px] text-gray-400">$</span>
                    <Input
                      id="daily_rate"
                      className="pl-7"
                      type="number"
                      value={editedBay.daily_rate || 0}
                      onChange={(e) => handleRateChange("daily", e.target.value)}
                      disabled={!manualRates || rateMode.daily.type === 'default'}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
                
                {!manualRates && (
                  <div className="text-xs text-muted-foreground">
                    Calculated as {settings.daily_hours} hrs minus {settings.daily_discount_percent}% discount
                  </div>
                )}
              </div>
              
              {/* Weekly Rate */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly_rate">Weekly Rate</Label>
                  {manualRates && (
                    <div className="flex gap-1.5 items-center">
                      <Button
                        size="sm"
                        variant={rateMode.weekly.type === 'default' ? "secondary" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => handleRateModeChange('weekly', { type: 'default' })}
                      >
                        Default
                      </Button>
                      <Button
                        size="sm"
                        variant={rateMode.weekly.type === 'percentage' ? "secondary" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => handleRateModeChange('weekly', { 
                          type: 'percentage', 
                          percentage: rateMode.weekly.percentage || 0 
                        })}
                      >
                        % Adj
                      </Button>
                      <Button
                        size="sm"
                        variant={rateMode.weekly.type === 'custom' ? "secondary" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => handleRateModeChange('weekly', { type: 'custom' })}
                      >
                        Custom
                      </Button>
                    </div>
                  )}
                </div>
                
                {manualRates && rateMode.weekly.type === 'percentage' ? (
                  <div className="relative">
                    <Input
                      type="number"
                      value={rateMode.weekly.percentage || 0}
                      onChange={(e) => handlePercentageChange('weekly', parseFloat(e.target.value))}
                      className="pl-7 pr-12"
                      min="-100"
                      step="1"
                    />
                    <span className="absolute left-3 top-[9px] text-gray-400">%</span>
                    <span className="absolute right-3 top-[9px] text-gray-400">
                      {formatCurrency(editedBay.weekly_rate || 0)}
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3 top-[9px] text-gray-400">$</span>
                    <Input
                      id="weekly_rate"
                      className="pl-7"
                      type="number"
                      value={editedBay.weekly_rate || 0}
                      onChange={(e) => handleRateChange("weekly", e.target.value)}
                      disabled={!manualRates || rateMode.weekly.type === 'default'}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
                
                {!manualRates && (
                  <div className="text-xs text-muted-foreground">
                    Calculated as {settings.weekly_multiplier}× hourly rate
                  </div>
                )}
              </div>
              
              {/* Monthly Rate */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monthly_rate">Monthly Rate</Label>
                  {manualRates && (
                    <div className="flex gap-1.5 items-center">
                      <Button
                        size="sm"
                        variant={rateMode.monthly.type === 'default' ? "secondary" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => handleRateModeChange('monthly', { type: 'default' })}
                      >
                        Default
                      </Button>
                      <Button
                        size="sm"
                        variant={rateMode.monthly.type === 'percentage' ? "secondary" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => handleRateModeChange('monthly', { 
                          type: 'percentage', 
                          percentage: rateMode.monthly.percentage || 0 
                        })}
                      >
                        % Adj
                      </Button>
                      <Button
                        size="sm"
                        variant={rateMode.monthly.type === 'custom' ? "secondary" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => handleRateModeChange('monthly', { type: 'custom' })}
                      >
                        Custom
                      </Button>
                    </div>
                  )}
                </div>
                
                {manualRates && rateMode.monthly.type === 'percentage' ? (
                  <div className="relative">
                    <Input
                      type="number"
                      value={rateMode.monthly.percentage || 0}
                      onChange={(e) => handlePercentageChange('monthly', parseFloat(e.target.value))}
                      className="pl-7 pr-12"
                      min="-100"
                      step="1"
                    />
                    <span className="absolute left-3 top-[9px] text-gray-400">%</span>
                    <span className="absolute right-3 top-[9px] text-gray-400">
                      {formatCurrency(editedBay.monthly_rate || 0)}
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3 top-[9px] text-gray-400">$</span>
                    <Input
                      id="monthly_rate"
                      className="pl-7"
                      type="number"
                      value={editedBay.monthly_rate || 0}
                      onChange={(e) => handleRateChange("monthly", e.target.value)}
                      disabled={!manualRates || rateMode.monthly.type === 'default'}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
                
                {!manualRates && (
                  <div className="text-xs text-muted-foreground">
                    Calculated as {settings.monthly_multiplier}× hourly rate
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Advanced settings coming soon</span>
              </div>
              
              <div className="p-4 border rounded-md bg-muted/20">
                <h3 className="text-sm font-medium mb-2">Default Rate Calculations</h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Daily Rate:</span>
                    <span>{formatCurrency(calculatedRates.daily)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Weekly Rate:</span>
                    <span>{formatCurrency(calculatedRates.weekly)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Monthly Rate:</span>
                    <span>{formatCurrency(calculatedRates.monthly)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex-1">
            {saveStatus === "success" && (
              <div className="flex items-center text-green-600 text-sm">
                <Check className="h-4 w-4 mr-1" />
                Saved successfully
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center text-red-600 text-sm">
                <X className="h-4 w-4 mr-1" />
                Error saving changes
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saveStatus === "saving"}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || saveStatus === "saving"}
              className="min-w-[80px]"
            >
              {saveStatus === "saving" ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
