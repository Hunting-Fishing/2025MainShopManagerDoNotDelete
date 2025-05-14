
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bay, RateSettings } from "@/services/diybay/diybayService";
import { formatCurrency } from "@/lib/formatters";

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
  const [activeTab, setActiveTab] = useState("basic");
  const [useDefaultRates, setUseDefaultRates] = useState(true);

  useEffect(() => {
    if (bay) {
      setEditedBay({ ...bay });
      // Check if bay uses custom rates
      const hourlyRate = bay.hourly_rate;
      const calculatedDaily = calculateRate('daily', hourlyRate);
      const calculatedWeekly = calculateRate('weekly', hourlyRate);
      const calculatedMonthly = calculateRate('monthly', hourlyRate);
      
      // If any rate differs from the calculated value, it's using custom rates
      const usingCustomRates = 
        bay.daily_rate !== calculatedDaily ||
        bay.weekly_rate !== calculatedWeekly ||
        bay.monthly_rate !== calculatedMonthly;
      
      setUseDefaultRates(!usingCustomRates);
    } else {
      setEditedBay(null);
    }
    
    setActiveTab("basic");
  }, [bay, calculateRate]);

  const updateHourlyRate = (hourlyRate: number) => {
    if (!editedBay) return;
    
    let updatedBay = { ...editedBay, hourly_rate: hourlyRate };
    
    // If using default rates, recalculate other rates
    if (useDefaultRates) {
      updatedBay = {
        ...updatedBay,
        daily_rate: calculateRate('daily', hourlyRate),
        weekly_rate: calculateRate('weekly', hourlyRate),
        monthly_rate: calculateRate('monthly', hourlyRate)
      };
    }
    
    setEditedBay(updatedBay);
  };

  const toggleUseDefaultRates = (checked: boolean) => {
    setUseDefaultRates(checked);
    
    if (checked && editedBay) {
      // Reset to calculated rates
      const hourlyRate = editedBay.hourly_rate;
      setEditedBay({
        ...editedBay,
        daily_rate: calculateRate('daily', hourlyRate),
        weekly_rate: calculateRate('weekly', hourlyRate),
        monthly_rate: calculateRate('monthly', hourlyRate)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedBay) return;
    
    const success = await onSave(editedBay);
    if (success) {
      onClose();
    }
  };

  // Guard against null bay
  if (!editedBay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bay?.id ? 'Edit' : 'Add'} Bay</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="rates">Rate Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="bay_name">Bay Name</Label>
                <Input
                  id="bay_name"
                  value={editedBay.bay_name}
                  onChange={(e) =>
                    setEditedBay({ ...editedBay, bay_name: e.target.value })
                  }
                  placeholder="Enter bay name"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bay_location">Location (Optional)</Label>
                <Input
                  id="bay_location"
                  value={editedBay.bay_location || ''}
                  onChange={(e) =>
                    setEditedBay({ ...editedBay, bay_location: e.target.value })
                  }
                  placeholder="E.g., North Wing, Building A"
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="is_active">Bay Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={editedBay.is_active}
                    onCheckedChange={(checked) =>
                      setEditedBay({ ...editedBay, is_active: checked })
                    }
                  />
                  <span>{editedBay.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rates" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedBay.hourly_rate}
                  onChange={(e) =>
                    updateHourlyRate(parseFloat(e.target.value) || 0)
                  }
                  className="w-full"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="use_default_rates">Use Default Rate Calculations</Label>
                <Switch
                  id="use_default_rates"
                  checked={useDefaultRates}
                  onCheckedChange={toggleUseDefaultRates}
                />
              </div>
              
              {useDefaultRates ? (
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="border rounded p-3 bg-gray-50">
                    <Label className="text-xs text-gray-500">Daily Rate</Label>
                    <div className="text-lg font-medium mt-1">
                      {formatCurrency(editedBay.daily_rate || 0)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {settings.daily_hours} hours with {settings.daily_discount_percent}% discount
                    </div>
                  </div>
                  <div className="border rounded p-3 bg-gray-50">
                    <Label className="text-xs text-gray-500">Weekly Rate</Label>
                    <div className="text-lg font-medium mt-1">
                      {formatCurrency(editedBay.weekly_rate || 0)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {settings.weekly_multiplier}x daily rate
                    </div>
                  </div>
                  <div className="border rounded p-3 bg-gray-50">
                    <Label className="text-xs text-gray-500">Monthly Rate</Label>
                    <div className="text-lg font-medium mt-1">
                      {formatCurrency(editedBay.monthly_rate || 0)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {settings.monthly_multiplier}x daily rate
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 border rounded p-4 bg-white">
                  <p className="text-sm text-gray-500">Custom rates - override the calculated values:</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="daily_rate">Daily Rate ($)</Label>
                      <Input
                        id="daily_rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editedBay.daily_rate || 0}
                        onChange={(e) =>
                          setEditedBay({ ...editedBay, daily_rate: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weekly_rate">Weekly Rate ($)</Label>
                      <Input
                        id="weekly_rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editedBay.weekly_rate || 0}
                        onChange={(e) =>
                          setEditedBay({ ...editedBay, weekly_rate: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthly_rate">Monthly Rate ($)</Label>
                      <Input
                        id="monthly_rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editedBay.monthly_rate || 0}
                        onChange={(e) =>
                          setEditedBay({ ...editedBay, monthly_rate: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Bay'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
