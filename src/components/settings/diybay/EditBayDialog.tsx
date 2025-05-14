
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bay, RateSettings } from "@/services/diybay/diybayService";
import { formatCurrency } from "@/lib/formatters";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calculator, DollarSign, Settings, BarChart, Tag } from "lucide-react";

interface EditBayDialogProps {
  bay: Bay | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bay: Bay) => void;
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
  const [activeTab, setActiveTab] = useState("basic");
  const [manualRates, setManualRates] = useState(false);
  const [rateMode, setRateMode] = useState<"default" | "custom" | "percentage">("default");
  const [percentageAdjustment, setPercentageAdjustment] = useState(0);
  const [discountType, setDiscountType] = useState<"increase" | "decrease">("increase");

  useEffect(() => {
    if (bay) {
      setEditedBay({ ...bay });
      // Determine if the bay is using manual rates
      const calculatedDaily = calculateRate('daily', bay.hourly_rate || 0);
      const calculatedWeekly = calculateRate('weekly', bay.hourly_rate || 0);
      const calculatedMonthly = calculateRate('monthly', bay.hourly_rate || 0);
      
      const isManual = 
        bay.daily_rate !== calculatedDaily ||
        bay.weekly_rate !== calculatedWeekly ||
        bay.monthly_rate !== calculatedMonthly;
      
      setManualRates(isManual);
      setRateMode(isManual ? "custom" : "default");
    }
  }, [bay, calculateRate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedBay) return;

    const { name, value } = e.target;
    const numValue = name === 'bay_name' || name === 'bay_location' 
      ? value 
      : Number(value) || 0;

    setEditedBay({ ...editedBay, [name]: numValue });
  };

  const handleSave = () => {
    if (!editedBay) return;
    onSave(editedBay);
    onClose();
  };

  const handleRateToggleChange = (checked: boolean) => {
    setManualRates(checked);
    if (!checked && editedBay) {
      // Reset to calculated rates
      updateCalculatedRates(editedBay.hourly_rate || 0);
      setRateMode("default");
    } else {
      setRateMode("custom");
    }
  };

  const updateCalculatedRates = (hourlyRate: number) => {
    if (!editedBay) return;
    
    const daily = calculateRate('daily', hourlyRate);
    const weekly = calculateRate('weekly', hourlyRate);
    const monthly = calculateRate('monthly', hourlyRate);

    setEditedBay({
      ...editedBay,
      hourly_rate: hourlyRate,
      daily_rate: daily,
      weekly_rate: weekly,
      monthly_rate: monthly,
    });
  };

  const applyPercentageAdjustment = () => {
    if (!editedBay) return;
    
    const multiplier = discountType === "increase" 
      ? 1 + (percentageAdjustment / 100) 
      : 1 - (percentageAdjustment / 100);
    
    const baseDaily = calculateRate('daily', editedBay.hourly_rate || 0);
    const baseWeekly = calculateRate('weekly', editedBay.hourly_rate || 0);
    const baseMonthly = calculateRate('monthly', editedBay.hourly_rate || 0);
    
    setEditedBay({
      ...editedBay,
      daily_rate: Number((baseDaily * multiplier).toFixed(2)),
      weekly_rate: Number((baseWeekly * multiplier).toFixed(2)),
      monthly_rate: Number((baseMonthly * multiplier).toFixed(2)),
    });
  };

  const handleRateModeChange = (value: string) => {
    setRateMode(value as "default" | "custom" | "percentage");
    
    if (value === "default" && editedBay) {
      updateCalculatedRates(editedBay.hourly_rate || 0);
      setManualRates(false);
    } else if (value === "percentage") {
      setManualRates(true);
    } else {
      setManualRates(true);
    }
  };

  if (!editedBay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Bay: {bay?.bay_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="rates" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Rates
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bay_name">Bay Name</Label>
                <Input
                  id="bay_name"
                  name="bay_name"
                  value={editedBay.bay_name}
                  onChange={handleInputChange}
                  placeholder="Enter bay name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bay_location">Bay Location</Label>
                <Input
                  id="bay_location"
                  name="bay_location"
                  value={editedBay.bay_location || ""}
                  onChange={handleInputChange}
                  placeholder="Enter bay location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate"
                  name="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedBay.hourly_rate || 0}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (rateMode === "default") {
                      updateCalculatedRates(Number(e.target.value) || 0);
                    }
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rates" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <Label htmlFor="manual-rates" className="font-medium">Rate Management</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Automatic</span>
                <Switch 
                  id="manual-rates" 
                  checked={manualRates} 
                  onCheckedChange={handleRateToggleChange} 
                />
                <span className="text-sm text-muted-foreground">Manual</span>
              </div>
            </div>

            {manualRates && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                <RadioGroup 
                  value={rateMode} 
                  onValueChange={handleRateModeChange} 
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="r-default" />
                    <Label htmlFor="r-default">Use Default Rates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="r-custom" />
                    <Label htmlFor="r-custom">Custom Rates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="r-percentage" />
                    <Label htmlFor="r-percentage">Percentage Adjustment</Label>
                  </div>
                </RadioGroup>

                {rateMode === "percentage" && (
                  <div className="bg-white p-4 rounded-lg space-y-4 border">
                    <Label className="block mb-2">Adjust rates by percentage</Label>
                    <div className="flex items-center gap-4">
                      <ToggleGroup 
                        type="single" 
                        value={discountType} 
                        onValueChange={(value) => value && setDiscountType(value as "increase" | "decrease")}
                        className="justify-start"
                      >
                        <ToggleGroupItem value="increase" className="text-green-600">
                          Increase
                        </ToggleGroupItem>
                        <ToggleGroupItem value="decrease" className="text-red-600">
                          Decrease
                        </ToggleGroupItem>
                      </ToggleGroup>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={percentageAdjustment}
                          onChange={(e) => setPercentageAdjustment(Number(e.target.value) || 0)}
                          className="w-20"
                        />
                        <span>%</span>
                      </div>
                      
                      <Button 
                        onClick={applyPercentageAdjustment}
                        size="sm"
                      >
                        Apply
                      </Button>
                    </div>
                    
                    <div className="bg-muted/30 p-2 rounded text-sm">
                      <p>Base rates calculated from hourly rate: {formatCurrency(editedBay.hourly_rate || 0)}/hr</p>
                      <p>Daily: {formatCurrency(calculateRate('daily', editedBay.hourly_rate || 0))}</p>
                      <p>Weekly: {formatCurrency(calculateRate('weekly', editedBay.hourly_rate || 0))}</p>
                      <p>Monthly: {formatCurrency(calculateRate('monthly', editedBay.hourly_rate || 0))}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="daily_rate">
                  Daily Rate ({settings.daily_hours} hours)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="daily_rate"
                    name="daily_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editedBay.daily_rate || 0}
                    onChange={handleInputChange}
                    disabled={!manualRates || rateMode === "default"}
                    className={manualRates && rateMode !== "default" ? "border-blue-300 focus:border-blue-500" : ""}
                  />
                </div>
                {!manualRates && (
                  <p className="text-xs text-muted-foreground">
                    Calculated from hourly rate using bay settings
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekly_rate">
                  Weekly Rate ({settings.daily_hours * 5} hours)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="weekly_rate"
                    name="weekly_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editedBay.weekly_rate || 0}
                    onChange={handleInputChange}
                    disabled={!manualRates || rateMode === "default"}
                    className={manualRates && rateMode !== "default" ? "border-blue-300 focus:border-blue-500" : ""}
                  />
                </div>
                {!manualRates && (
                  <p className="text-xs text-muted-foreground">
                    Calculated using {settings.weekly_multiplier}x multiplier
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_rate">
                  Monthly Rate ({settings.daily_hours * 20} hours)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="monthly_rate"
                    name="monthly_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editedBay.monthly_rate || 0}
                    onChange={handleInputChange}
                    disabled={!manualRates || rateMode === "default"}
                    className={manualRates && rateMode !== "default" ? "border-blue-300 focus:border-blue-500" : ""}
                  />
                </div>
                {!manualRates && (
                  <p className="text-xs text-muted-foreground">
                    Calculated using {settings.monthly_multiplier}x multiplier
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Bay Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this bay
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={editedBay.is_active}
                  onCheckedChange={(checked) => 
                    setEditedBay({ ...editedBay, is_active: checked })
                  }
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Rate Calculation Preview</h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hourly Rate:</span>
                    <span className="font-medium">{formatCurrency(editedBay.hourly_rate || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Rate ({settings.daily_hours} hours):</span>
                    <span className="font-medium">{formatCurrency(editedBay.daily_rate || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly Rate:</span>
                    <span className="font-medium">{formatCurrency(editedBay.weekly_rate || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Rate:</span>
                    <span className="font-medium">{formatCurrency(editedBay.monthly_rate || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

