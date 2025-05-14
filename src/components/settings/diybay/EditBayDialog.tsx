
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check, X, Info, AlertCircle } from 'lucide-react';
import { Bay } from '@/services/diybay/diybayService';
import { BayDetails, RateMode } from '@/types/diybay';
import { formatCurrency } from '@/utils/rateCalculations';
import { useToast } from '@/hooks/use-toast';

interface EditBayDialogProps {
  bay: Bay | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bay: BayDetails) => Promise<void>;
  calculateRate: (type: 'daily' | 'weekly' | 'monthly', hourlyRate: number) => number;
  settings: {
    id: string;
    daily_hours: number;
    daily_discount_percent: number;
    weekly_multiplier: number;
    monthly_multiplier: number;
  };
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
  const { toast } = useToast();
  const [editedBay, setEditedBay] = useState<BayDetails | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [rateModes, setRateModes] = useState({
    daily: 'default' as RateMode['type'],
    weekly: 'default' as RateMode['type'],
    monthly: 'default' as RateMode['type'],
  });

  // Reset the form state when the dialog opens with a new bay
  useEffect(() => {
    if (bay) {
      setEditedBay({
        ...bay,
      });
      
      // Determine rate modes based on bay rates
      const hourlyRate = bay.hourly_rate || 0;
      const calculatedDaily = calculateRate('daily', hourlyRate);
      const calculatedWeekly = calculateRate('weekly', hourlyRate);
      const calculatedMonthly = calculateRate('monthly', hourlyRate);
      
      setRateModes({
        daily: bay.daily_rate !== calculatedDaily ? 'custom' : 'default',
        weekly: bay.weekly_rate !== calculatedWeekly ? 'custom' : 'default',
        monthly: bay.monthly_rate !== calculatedMonthly ? 'custom' : 'default',
      });
    } else {
      setEditedBay(null);
    }
    setSaveStatus('idle');
  }, [bay, calculateRate]);

  if (!editedBay) return null;

  const handleInputChange = (field: keyof Bay, value: string | number | boolean) => {
    setEditedBay((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    
    // Reset the save status when changes are made
    setSaveStatus('idle');
  };

  const handleHourlyRateChange = (value: string) => {
    // Allow empty string or valid number
    const numericValue = value === '' ? '' : parseFloat(value);
    
    setEditedBay((prev) => {
      if (!prev) return null;

      // Update the hourly rate
      const updatedBay = { ...prev, hourly_rate: numericValue === '' ? 0 : numericValue };

      // Only update other rates if they're in 'default' mode
      if (rateModes.daily === 'default' && numericValue !== '') {
        updatedBay.daily_rate = calculateRate('daily', numericValue as number);
      }
      if (rateModes.weekly === 'default' && numericValue !== '') {
        updatedBay.weekly_rate = calculateRate('weekly', numericValue as number);
      }
      if (rateModes.monthly === 'default' && numericValue !== '') {
        updatedBay.monthly_rate = calculateRate('monthly', numericValue as number);
      }

      return updatedBay;
    });
    
    setSaveStatus('idle');
  };

  const handleRateChange = (field: 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: string) => {
    const rateType = field.split('_')[0] as 'daily' | 'weekly' | 'monthly';
    const numericValue = value === '' ? 0 : parseFloat(value);

    // Update the rate mode when manually changing a rate
    setRateModes(prev => ({
      ...prev,
      [rateType]: value === '' ? 'default' : 'custom'
    }));

    setEditedBay(prev => {
      if (!prev) return null;
      return { ...prev, [field]: numericValue };
    });
    
    setSaveStatus('idle');
  };

  const resetRateToCalculated = (field: 'daily_rate' | 'weekly_rate' | 'monthly_rate') => {
    if (!editedBay || editedBay.hourly_rate === null) return;
    
    const rateType = field.split('_')[0] as 'daily' | 'weekly' | 'monthly';
    const calculatedValue = calculateRate(rateType, editedBay.hourly_rate);
    
    setRateModes(prev => ({
      ...prev,
      [rateType]: 'default'
    }));
    
    setEditedBay(prev => {
      if (!prev) return null;
      return { ...prev, [field]: calculatedValue };
    });
    
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (!editedBay) return;
    
    // Validate the bay data before saving
    if (!editedBay.bay_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Bay name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure hourly rate is at least 0
    const hourlyRate = editedBay.hourly_rate ?? 0;
    if (hourlyRate < 0) {
      toast({
        title: "Validation Error",
        description: "Hourly rate cannot be negative",
        variant: "destructive",
      });
      return;
    }
    
    // Save with validated hourly rate
    const bayToSave = {
      ...editedBay,
      hourly_rate: hourlyRate,
    };
    
    setSaveStatus('saving');
    try {
      await onSave(bayToSave);
      setSaveStatus('success');
      setTimeout(() => {
        onClose();
      }, 1000); // Close the dialog after a short delay
    } catch (error) {
      console.error("Error saving bay:", error);
      setSaveStatus('error');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bay Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bay-name">Bay Name</Label>
            <Input
              id="bay-name"
              value={editedBay.bay_name}
              onChange={(e) => handleInputChange('bay_name', e.target.value)}
              placeholder="Enter bay name"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="bay-location">Location (Optional)</Label>
            <Input
              id="bay-location"
              value={editedBay.bay_location || ''}
              onChange={(e) => handleInputChange('bay_location', e.target.value)}
              placeholder="Enter bay location"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
            <Input
              id="hourly-rate"
              type="text"
              value={editedBay.hourly_rate === 0 && rateModes.daily === 'default' ? '' : editedBay.hourly_rate}
              onChange={(e) => handleHourlyRateChange(e.target.value)}
              placeholder="Enter hourly rate"
              className="pl-7"
            />
            <div className="text-sm text-muted-foreground">
              Base rate per hour
            </div>
          </div>
          
          <div className="pt-2">
            <Label className="mb-2 block">Additional Rate Options</Label>
            
            <div className="space-y-4 bg-muted/30 rounded-lg p-4 border border-muted">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Daily Rate</div>
                  <div className="text-sm text-muted-foreground">
                    {settings.daily_hours} hours with {settings.daily_discount_percent}% discount
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {rateModes.daily === 'custom' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => resetRateToCalculated('daily_rate')}
                      title="Reset to calculated value"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  )}
                  <Input
                    value={editedBay.daily_rate || 0}
                    onChange={(e) => handleRateChange('daily_rate', e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Weekly Rate</div>
                  <div className="text-sm text-muted-foreground">
                    {settings.weekly_multiplier}x hourly rate
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {rateModes.weekly === 'custom' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => resetRateToCalculated('weekly_rate')}
                      title="Reset to calculated value"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  )}
                  <Input
                    value={editedBay.weekly_rate || 0}
                    onChange={(e) => handleRateChange('weekly_rate', e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Monthly Rate</div>
                  <div className="text-sm text-muted-foreground">
                    {settings.monthly_multiplier}x hourly rate
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {rateModes.monthly === 'custom' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => resetRateToCalculated('monthly_rate')}
                      title="Reset to calculated value"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  )}
                  <Input
                    value={editedBay.monthly_rate || 0}
                    onChange={(e) => handleRateChange('monthly_rate', e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="active-status"
              checked={editedBay.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="active-status">Active</Label>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {saveStatus === 'success' && (
              <span className="text-green-600 flex items-center text-sm">
                <Check className="h-4 w-4 mr-1" /> Saved successfully
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600 flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-1" /> Error saving
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving || saveStatus === 'saving'}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || saveStatus === 'saving'}
              className={saveStatus === 'saving' ? 'opacity-80' : ''}
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
