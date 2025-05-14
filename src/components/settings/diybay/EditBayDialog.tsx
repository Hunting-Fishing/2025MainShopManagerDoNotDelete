
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bay, RateSettings } from "@/services/diybay/diybayService";
import { Switch } from "@/components/ui/switch";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Check, Save, X, AlertCircle } from "lucide-react";

interface EditBayDialogProps {
  bay: Bay | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bay: Bay) => Promise<boolean>;
  calculateRate: (type: 'daily' | 'weekly' | 'monthly', hourlyRate: number) => number;
  settings: RateSettings;
  isSaving: boolean;
}

type RateMode = 'default' | 'custom' | 'percentage';

export const EditBayDialog: React.FC<EditBayDialogProps> = ({
  bay,
  isOpen,
  onClose,
  onSave,
  calculateRate,
  settings,
  isSaving,
}) => {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [editedBay, setEditedBay] = useState<Bay | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [manualRates, setManualRates] = useState<boolean>(false);
  const [rateMode, setRateMode] = useState<Record<string, RateMode>>({
    daily: 'default',
    weekly: 'default',
    monthly: 'default'
  });
  const [percentAdjustment, setPercentAdjustment] = useState<Record<string, number>>({
    daily: 0,
    weekly: 0,
    monthly: 0
  });

  useEffect(() => {
    if (bay) {
      setEditedBay({ ...bay });
      
      // Determine if manual rates are being used
      const defaultDaily = calculateRate('daily', bay.hourly_rate);
      const defaultWeekly = calculateRate('weekly', bay.hourly_rate);
      const defaultMonthly = calculateRate('monthly', bay.hourly_rate);
      
      const hasCustomRates = 
        bay.daily_rate !== defaultDaily || 
        bay.weekly_rate !== defaultWeekly || 
        bay.monthly_rate !== defaultMonthly;
      
      setManualRates(hasCustomRates);

      // Determine rate modes based on current values
      const modes: Record<string, RateMode> = {
        daily: bay.daily_rate !== defaultDaily ? 'custom' : 'default',
        weekly: bay.weekly_rate !== defaultWeekly ? 'custom' : 'default',
        monthly: bay.monthly_rate !== defaultMonthly ? 'custom' : 'default'
      };
      setRateMode(modes);

      // Calculate percentage adjustments if any
      setPercentAdjustment({
        daily: defaultDaily > 0 ? (((bay.daily_rate || 0) / defaultDaily) - 1) * 100 : 0,
        weekly: defaultWeekly > 0 ? (((bay.weekly_rate || 0) / defaultWeekly) - 1) * 100 : 0,
        monthly: defaultMonthly > 0 ? (((bay.monthly_rate || 0) / defaultMonthly) - 1) * 100 : 0
      });
    }
  }, [bay, calculateRate]);

  const handleInputChange = (field: keyof Bay, value: string | number | boolean) => {
    if (!editedBay) return;
    
    const newEditedBay = { ...editedBay, [field]: value };
    
    // If hourly rate changes and not using manual rates, update all dependent rates
    if (field === 'hourly_rate' && !manualRates) {
      newEditedBay.daily_rate = calculateRate('daily', value as number);
      newEditedBay.weekly_rate = calculateRate('weekly', value as number);
      newEditedBay.monthly_rate = calculateRate('monthly', value as number);
    }
    
    setEditedBay(newEditedBay);
  };

  const handleRateModeChange = (type: 'daily' | 'weekly' | 'monthly', mode: RateMode) => {
    if (!editedBay) return;

    const newModes = { ...rateMode, [type]: mode };
    setRateMode(newModes);

    // Update the rate based on the selected mode
    if (mode === 'default') {
      handleInputChange(`${type}_rate` as keyof Bay, calculateRate(type, editedBay.hourly_rate));
    } else if (mode === 'percentage') {
      const baseRate = calculateRate(type, editedBay.hourly_rate);
      const adjustmentFactor = 1 + (percentAdjustment[type] / 100);
      handleInputChange(`${type}_rate` as keyof Bay, baseRate * adjustmentFactor);
    }
  };

  const handlePercentChange = (type: 'daily' | 'weekly' | 'monthly', percent: number) => {
    if (!editedBay) return;

    const newPercents = { ...percentAdjustment, [type]: percent };
    setPercentAdjustment(newPercents);

    // Update the rate based on the percentage
    const baseRate = calculateRate(type, editedBay.hourly_rate);
    const adjustmentFactor = 1 + (percent / 100);
    handleInputChange(`${type}_rate` as keyof Bay, baseRate * adjustmentFactor);
  };

  const handleSave = async () => {
    if (!editedBay) return;
    
    setSaveStatus("saving");
    try {
      const success = await onSave(editedBay);
      if (success) {
        setSaveStatus("success");
        setTimeout(() => {
          onClose();
          setSaveStatus("idle");
        }, 1500);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error saving bay:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleManualRatesToggle = (enabled: boolean) => {
    setManualRates(enabled);
    
    if (!enabled && editedBay) {
      // Reset to default rates when disabling manual rates
      const newBay = { ...editedBay };
      newBay.daily_rate = calculateRate('daily', editedBay.hourly_rate);
      newBay.weekly_rate = calculateRate('weekly', editedBay.hourly_rate);
      newBay.monthly_rate = calculateRate('monthly', editedBay.hourly_rate);
      setEditedBay(newBay);
      
      // Reset rate modes
      setRateMode({
        daily: 'default',
        weekly: 'default',
        monthly: 'default'
      });
    }
  };

  const renderRateOptions = (type: 'daily' | 'weekly' | 'monthly', label: string) => {
    if (!editedBay) return null;
    
    const baseRate = calculateRate(type, editedBay.hourly_rate);
    
    return (
      <div className="space-y-3 bg-gray-50 p-3 rounded-md border border-gray-100">
        <h4 className="font-medium text-sm">{label} Rate Options</h4>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id={`${type}-default`}
              checked={rateMode[type] === 'default'}
              onChange={() => handleRateModeChange(type, 'default')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`${type}-default`} className="text-sm">
              Use default calculation: {formatCurrency(baseRate)}
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id={`${type}-custom`} 
              checked={rateMode[type] === 'custom'}
              onChange={() => handleRateModeChange(type, 'custom')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`${type}-custom`} className="text-sm">Custom rate</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={editedBay[`${type}_rate`] || 0}
              onChange={(e) => handleInputChange(`${type}_rate` as keyof Bay, parseFloat(e.target.value) || 0)}
              disabled={rateMode[type] !== 'custom'}
              className="ml-2 w-24 h-8"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id={`${type}-percentage`} 
              checked={rateMode[type] === 'percentage'}
              onChange={() => handleRateModeChange(type, 'percentage')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`${type}-percentage`} className="text-sm">Adjust by percentage</label>
            <div className="flex">
              <Input
                type="number"
                min="-50"
                max="100"
                value={percentAdjustment[type]}
                onChange={(e) => handlePercentChange(type, parseFloat(e.target.value) || 0)}
                disabled={rateMode[type] !== 'percentage'}
                className="w-16 h-8 text-right"
              />
              <div className="flex items-center bg-gray-100 px-2 rounded-r-md border border-l-0 border-gray-300">
                %
              </div>
            </div>
            <span className="text-sm text-gray-500">
              = {formatCurrency(editedBay[`${type}_rate`] || 0)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (!editedBay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Bay: {editedBay.bay_name}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="basic" className="text-center">Basic Info</TabsTrigger>
            <TabsTrigger value="rates" className="text-center">Rate Options</TabsTrigger>
            <TabsTrigger value="advanced" className="text-center">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="bay_name">Bay Name</Label>
              <Input
                id="bay_name"
                value={editedBay.bay_name}
                onChange={(e) => handleInputChange('bay_name', e.target.value)}
                placeholder="Enter bay name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bay_location">Bay Location (Optional)</Label>
              <Input
                id="bay_location"
                value={editedBay.bay_location || ''}
                onChange={(e) => handleInputChange('bay_location', e.target.value)}
                placeholder="Enter bay location"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                value={editedBay.hourly_rate}
                onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                placeholder="Enter hourly rate"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="rates" className="space-y-5 py-2">
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
              <div className="flex items-center gap-2">
                <InfoCircledIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Manual Rate Controls
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-blue-700">Auto</span>
                <Switch 
                  checked={manualRates} 
                  onCheckedChange={handleManualRatesToggle}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className="text-sm text-blue-700">Manual</span>
              </div>
            </div>
            
            <div className={`space-y-4 ${!manualRates ? 'opacity-50' : ''}`}>
              {renderRateOptions('daily', 'Daily')}
              {renderRateOptions('weekly', 'Weekly')}
              {renderRateOptions('monthly', 'Monthly')}
            </div>
            
            {!manualRates && (
              <div className="text-sm text-gray-500 italic">
                Enable manual rates to customize individual rate calculations.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="is_active" className="flex items-center justify-between">
                <span>Bay Status</span>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_active" 
                    checked={editedBay.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <span className={editedBay.is_active ? 'text-green-600' : 'text-red-600'}>
                    {editedBay.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Inactive bays won't appear in rental options for customers
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6">
              <h4 className="text-sm font-medium text-amber-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Advanced Settings
              </h4>
              <p className="text-sm text-amber-700 mt-2">
                Additional settings like equipment availability, scheduling restrictions, or 
                special pricing rules can be configured by your administrator.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between mt-6">
          <div>
            {saveStatus === "error" && (
              <div className="flex items-center text-red-600 text-sm">
                <X className="h-4 w-4 mr-1" /> Error saving changes
              </div>
            )}
            {saveStatus === "success" && (
              <div className="flex items-center text-green-600 text-sm">
                <Check className="h-4 w-4 mr-1" /> Changes saved successfully
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || saveStatus === "saving" || saveStatus === "success"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saveStatus === "saving" ? (
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
