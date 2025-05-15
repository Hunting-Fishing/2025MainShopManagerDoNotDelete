
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronsUp, ChevronsDown, Save } from "lucide-react";
import { RateSettings } from "@/services/diybay/diybayService";

interface RateSettingsFormProps {
  settings: RateSettings;
  onSettingsChange: (field: keyof RateSettings, value: number) => void;
  onSaveSettings: () => Promise<boolean>;
  isSaving: boolean;
}

export const RateSettingsForm: React.FC<RateSettingsFormProps> = ({
  settings,
  onSettingsChange,
  onSaveSettings,
  isSaving
}) => {
  const [expanded, setExpanded] = useState<string | undefined>("bay-settings");
  
  const handleAccordionChange = (value: string) => {
    setExpanded(value === expanded ? undefined : value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings();
  };

  return (
    <Accordion 
      type="single" 
      collapsible 
      value={expanded} 
      onValueChange={handleAccordionChange}
      className="mb-8 border-gray-100 shadow-md rounded-xl overflow-hidden"
    >
      <AccordionItem value="bay-settings" className="border-0">
        <AccordionTrigger className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Rate Settings</h3>
              <p className="text-sm text-gray-600">Configure base rate calculation parameters for DIY bays</p>
            </div>
            {expanded === "bay-settings" ? (
              <ChevronsUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronsDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          <form onSubmit={handleSubmit} className="p-5 bg-white">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="baseRate" className="text-sm font-medium text-gray-700">
                    Base Hourly Rate ($)
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="baseRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.hourly_base_rate || ''}
                      onChange={(e) => onSettingsChange('hourly_base_rate', Number(e.target.value))}
                      className="pl-8 mt-1"
                    />
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      $
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Default hourly rate for all DIY bays
                  </p>
                </div>
                <div>
                  <Label htmlFor="dailyHours" className="text-sm font-medium text-gray-700">
                    Hours in Daily Rate
                  </Label>
                  <Input
                    id="dailyHours"
                    type="number"
                    min="1"
                    max="24"
                    value={settings.daily_hours || ''}
                    onChange={(e) => onSettingsChange('daily_hours', Number(e.target.value))}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Number of hours considered for a daily rate
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dailyDiscount" className="text-sm font-medium text-gray-700">
                    Daily Discount (%)
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="dailyDiscount"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.daily_discount_percent || ''}
                      onChange={(e) => onSettingsChange('daily_discount_percent', Number(e.target.value))}
                      className="pr-8 mt-1"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                      %
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Discount applied for daily rentals vs hourly rate
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="weeklyMultiplier" className="text-sm font-medium text-gray-700">
                      Weekly Multiplier
                    </Label>
                    <Input
                      id="weeklyMultiplier"
                      type="number"
                      min="1"
                      step="0.1"
                      value={settings.weekly_multiplier || ''}
                      onChange={(e) => onSettingsChange('weekly_multiplier', Number(e.target.value))}
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Daily rate × This = Weekly
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="monthlyMultiplier" className="text-sm font-medium text-gray-700">
                      Monthly Multiplier
                    </Label>
                    <Input
                      id="monthlyMultiplier"
                      type="number"
                      min="1"
                      step="0.1"
                      value={settings.monthly_multiplier || ''}
                      onChange={(e) => onSettingsChange('monthly_multiplier', Number(e.target.value))}
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Daily rate × This = Monthly
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t pt-4 flex justify-end">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Rate Settings</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default RateSettingsForm;
