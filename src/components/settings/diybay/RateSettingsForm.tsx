
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RateSettings } from "@/services/diybay/diybayService";
import { Save, Info, DollarSign, Percent, Clock, LayoutGrid, Table, Scroll } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type RateSettingViewMode = "cards" | "table" | "scroll";

interface RateSettingsFormProps {
  settings: RateSettings;
  onSettingsChange: (field: keyof RateSettings, value: number) => void;
  onSaveSettings: () => Promise<boolean | void>;
  isSaving: boolean;
}

export const RateSettingsForm: React.FC<RateSettingsFormProps> = ({
  settings,
  onSettingsChange,
  onSaveSettings,
  isSaving
}) => {
  const [localSettings, setLocalSettings] = useState<RateSettings>(settings);
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState<RateSettingViewMode>("cards");
  
  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  const handleInputChange = (field: keyof RateSettings, value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setLocalSettings(prev => ({ ...prev, [field]: numValue }));
      setIsDirty(true);
      onSettingsChange(field, numValue);
    }
  };
  
  const handleSave = async () => {
    await onSaveSettings();
    setIsDirty(false);
  };

  // Render appropriate content based on view mode
  const renderContent = () => {
    if (viewMode === "scroll") {
      return (
        <ScrollArea className="h-60 px-1">
          <div className="space-y-4 pr-4">
            {renderSettingsFields()}
          </div>
        </ScrollArea>
      );
    } else if (viewMode === "table") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-purple-50">
                <th className="text-left p-3 text-purple-700 border-b border-gray-200">Setting</th>
                <th className="text-left p-3 text-purple-700 border-b border-gray-200">Value</th>
                <th className="text-left p-3 text-purple-700 border-b border-gray-200">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-3 flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-blue-100 text-blue-700 rounded-full">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <span>Hourly Base Rate</span>
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    value={localSettings.hourly_base_rate}
                    onChange={(e) => handleInputChange('hourly_base_rate', e.target.value)}
                    className="w-24 border-gray-200"
                  />
                </td>
                <td className="p-3 text-gray-500 text-sm">Base rate for hourly bay rentals</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-3 flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-green-100 text-green-700 rounded-full">
                    <Clock className="h-4 w-4" />
                  </span>
                  <span>Daily Hours</span>
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    value={localSettings.daily_hours}
                    onChange={(e) => handleInputChange('daily_hours', e.target.value)}
                    className="w-24 border-gray-200"
                  />
                </td>
                <td className="p-3 text-gray-500 text-sm">Number of hours in a daily rental</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-3 flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-yellow-100 text-yellow-700 rounded-full">
                    <Percent className="h-4 w-4" />
                  </span>
                  <span>Daily Discount</span>
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    value={localSettings.daily_discount_percent}
                    onChange={(e) => handleInputChange('daily_discount_percent', e.target.value)}
                    className="w-24 border-gray-200"
                    min="0"
                    max="100"
                  />
                </td>
                <td className="p-3 text-gray-500 text-sm">Discount percentage for daily rentals</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-3 flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-indigo-100 text-indigo-700 rounded-full">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <span>Weekly Rate Multiplier</span>
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    value={localSettings.weekly_multiplier}
                    onChange={(e) => handleInputChange('weekly_multiplier', e.target.value)}
                    className="w-24 border-gray-200"
                  />
                </td>
                <td className="p-3 text-gray-500 text-sm">Multiplier for weekly rate</td>
              </tr>
              <tr>
                <td className="p-3 flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-pink-100 text-pink-700 rounded-full">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <span>Monthly Rate Multiplier</span>
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    value={localSettings.monthly_multiplier}
                    onChange={(e) => handleInputChange('monthly_multiplier', e.target.value)}
                    className="w-24 border-gray-200"
                  />
                </td>
                <td className="p-3 text-gray-500 text-sm">Multiplier for monthly rate</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    } else {
      // Cards view (default)
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderSettingsFields()}
        </div>
      );
    }
  };

  // Common settings fields for cards and scroll views
  const renderSettingsFields = () => {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="hourly_base_rate" className="text-sm font-medium flex items-center gap-2">
            <span className="inline-flex p-1.5 bg-blue-100 text-blue-700 rounded-full">
              <DollarSign className="h-4 w-4" />
            </span>
            Hourly Base Rate ($/hour)
          </Label>
          <Input
            id="hourly_base_rate"
            type="number"
            value={localSettings.hourly_base_rate}
            onChange={(e) => handleInputChange('hourly_base_rate', e.target.value)}
            className="w-full border-gray-200"
            placeholder="65.00"
          />
          <p className="text-sm text-gray-500">Base rate for hourly bay rentals</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="daily_hours" className="text-sm font-medium flex items-center gap-2">
            <span className="inline-flex p-1.5 bg-green-100 text-green-700 rounded-full">
              <Clock className="h-4 w-4" />
            </span>
            Daily Hours
          </Label>
          <Input
            id="daily_hours"
            type="number"
            value={localSettings.daily_hours}
            onChange={(e) => handleInputChange('daily_hours', e.target.value)}
            className="w-full border-gray-200"
            placeholder="8"
          />
          <p className="text-sm text-gray-500">Number of hours in a daily rental</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="daily_discount_percent" className="text-sm font-medium flex items-center gap-2">
            <span className="inline-flex p-1.5 bg-yellow-100 text-yellow-700 rounded-full">
              <Percent className="h-4 w-4" />
            </span>
            Daily Discount (%)
          </Label>
          <Input
            id="daily_discount_percent"
            type="number"
            value={localSettings.daily_discount_percent}
            onChange={(e) => handleInputChange('daily_discount_percent', e.target.value)}
            className="w-full border-gray-200"
            placeholder="25"
            min="0"
            max="100"
          />
          <p className="text-sm text-gray-500">Discount percentage for daily rentals</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weekly_multiplier" className="text-sm font-medium flex items-center gap-2">
            <span className="inline-flex p-1.5 bg-indigo-100 text-indigo-700 rounded-full">
              <DollarSign className="h-4 w-4" />
            </span>
            Weekly Rate Multiplier
          </Label>
          <Input
            id="weekly_multiplier"
            type="number"
            value={localSettings.weekly_multiplier}
            onChange={(e) => handleInputChange('weekly_multiplier', e.target.value)}
            className="w-full border-gray-200"
            placeholder="20"
          />
          <p className="text-sm text-gray-500">Multiplier for weekly rate (hourly rate × multiplier)</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="monthly_multiplier" className="text-sm font-medium flex items-center gap-2">
            <span className="inline-flex p-1.5 bg-pink-100 text-pink-700 rounded-full">
              <DollarSign className="h-4 w-4" />
            </span>
            Monthly Rate Multiplier
          </Label>
          <Input
            id="monthly_multiplier"
            type="number"
            value={localSettings.monthly_multiplier}
            onChange={(e) => handleInputChange('monthly_multiplier', e.target.value)}
            className="w-full border-gray-200"
            placeholder="40"
          />
          <p className="text-sm text-gray-500">Multiplier for monthly rate (hourly rate × multiplier)</p>
        </div>
      </>
    );
  };

  return (
    <div className="mb-8">
      <Card className="border-gray-100 shadow-md rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-700 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              DIY Bay Rate Settings
            </CardTitle>
            
            <div className="bg-white rounded-lg p-1 shadow-sm border border-indigo-100">
              <ToggleGroup 
                type="single" 
                value={viewMode} 
                onValueChange={(value) => value && setViewMode(value as RateSettingViewMode)}
                className="flex items-center"
              >
                <ToggleGroupItem
                  value="cards"
                  aria-label="Cards view"
                  className={`rounded-md px-3 py-2 ${
                    viewMode === "cards" 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" 
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">Cards</span>
                </ToggleGroupItem>
                
                <ToggleGroupItem
                  value="table"
                  aria-label="Table view"
                  className={`rounded-md px-3 py-2 ${
                    viewMode === "table" 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" 
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  <Table className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">Table</span>
                </ToggleGroupItem>
                
                <ToggleGroupItem
                  value="scroll"
                  aria-label="Scroll view"
                  className={`rounded-md px-3 py-2 ${
                    viewMode === "scroll" 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" 
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  <Scroll className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">Scroll</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {renderContent()}
          
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Info className="h-4 w-4" />
              <p className="text-sm">
                Changing the hourly base rate will update all bays using the default rate.
              </p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !isDirty}
              className="rounded-full px-6"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
