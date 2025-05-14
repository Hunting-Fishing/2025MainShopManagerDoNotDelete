
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Percent, Clock, Calendar, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RateSettings } from "@/services/diybay/diybayService";

interface RateSettingsFormProps {
  settings: RateSettings;
  isSaving: boolean;
  onSave: (settings: RateSettings) => void;
}

export function RateSettingsForm({ settings, isSaving, onSave }: RateSettingsFormProps) {
  const [formData, setFormData] = useState<RateSettings>({
    daily_hours: 8,
    daily_discount_percent: 25,
    weekly_multiplier: 20,
    monthly_multiplier: 40,
    hourly_base_rate: 65, // Default hourly rate
    ...settings
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      hourly_base_rate: 65, // Default hourly rate
      ...settings
    });
    setHasChanges(false);
  }, [settings]);

  const handleChange = (field: keyof RateSettings, value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (!isNaN(numericValue) || value === '') {
      setFormData(prev => ({
        ...prev,
        [field]: value === '' ? '' : numericValue
      }));
      setHasChanges(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert any empty string values to numbers before saving
    const dataToSave = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value === '' ? 0 : value])
    ) as RateSettings;
    
    onSave(dataToSave);
    
    toast({
      title: "Settings saved",
      description: "Your rate settings have been updated successfully.",
    });
  };

  return (
    <Card className="shadow-md border-gray-100 rounded-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <CardTitle className="text-blue-700">Rate Calculation Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hourly_base_rate" className="flex items-center gap-2 text-sm font-medium">
                <span className="inline-flex p-1.5 bg-green-100 text-green-700 rounded-full">
                  <Clock className="h-4 w-4" />
                </span>
                Hourly Base Rate ($)
              </Label>
              <Input
                id="hourly_base_rate"
                type="number"
                value={formData.hourly_base_rate}
                onChange={(e) => handleChange('hourly_base_rate', e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="65"
              />
              <p className="text-xs text-gray-500">
                Default hourly rate for all DIY bays
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="daily_hours" className="flex items-center gap-2 text-sm font-medium">
                <span className="inline-flex p-1.5 bg-blue-100 text-blue-700 rounded-full">
                  <Clock className="h-4 w-4" />
                </span>
                Daily Hours
              </Label>
              <Input
                id="daily_hours"
                type="number"
                value={formData.daily_hours}
                onChange={(e) => handleChange('daily_hours', e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="8"
              />
              <p className="text-xs text-gray-500">
                Number of hours included in a daily rate
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="daily_discount_percent" className="flex items-center gap-2 text-sm font-medium">
                <span className="inline-flex p-1.5 bg-purple-100 text-purple-700 rounded-full">
                  <Percent className="h-4 w-4" />
                </span>
                Daily Discount (%)
              </Label>
              <Input
                id="daily_discount_percent"
                type="number"
                value={formData.daily_discount_percent}
                onChange={(e) => handleChange('daily_discount_percent', e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="25"
              />
              <p className="text-xs text-gray-500">
                Discount percentage applied to hourly * daily hours calculation
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weekly_multiplier" className="flex items-center gap-2 text-sm font-medium">
                <span className="inline-flex p-1.5 bg-yellow-100 text-yellow-700 rounded-full">
                  <Calendar className="h-4 w-4" />
                </span>
                Weekly Rate Multiplier
              </Label>
              <Input
                id="weekly_multiplier"
                type="number"
                value={formData.weekly_multiplier}
                onChange={(e) => handleChange('weekly_multiplier', e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="20"
              />
              <p className="text-xs text-gray-500">
                Multiply hourly rate by this value to get weekly rate
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthly_multiplier" className="flex items-center gap-2 text-sm font-medium">
                <span className="inline-flex p-1.5 bg-red-100 text-red-700 rounded-full">
                  <Calendar className="h-4 w-4" />
                </span>
                Monthly Rate Multiplier
              </Label>
              <Input
                id="monthly_multiplier"
                type="number"
                value={formData.monthly_multiplier}
                onChange={(e) => handleChange('monthly_multiplier', e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="40"
              />
              <p className="text-xs text-gray-500">
                Multiply hourly rate by this value to get monthly rate
              </p>
            </div>
          </div>
          
          <div className="flex flex-row-reverse mt-4">
            <Button 
              type="submit" 
              disabled={isSaving || !hasChanges}
              className={`rounded-full px-6 ${hasChanges 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-100 text-gray-400'}`}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {hasChanges ? "Save Changes" : "No Changes"}
                </>
              )}
            </Button>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700 mr-auto flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>These settings affect how daily, weekly, and monthly rates are calculated for all DIY bays.</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
