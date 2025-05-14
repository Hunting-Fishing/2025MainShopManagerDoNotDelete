
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RateSettings } from "@/services/diybay/diybayService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  isSaving,
}) => {
  const [viewMode, setViewMode] = useState<"form" | "table">("form");
  
  const handleInputChange = (field: keyof RateSettings, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onSettingsChange(field, numValue);
    }
  };

  const handleDiscountChange = (value: number[]) => {
    onSettingsChange('daily_discount_percent', value[0]);
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-gray-800">Rate Settings</CardTitle>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "form" | "table")}>
            <TabsList className="grid grid-cols-2 w-40">
              <TabsTrigger value="form">Form</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        <TabsContent value="form" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="hourly_base_rate" className="text-sm font-medium">
                  Base Hourly Rate ($)
                </Label>
                <Input
                  id="hourly_base_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.hourly_base_rate || ''}
                  onChange={(e) => handleInputChange('hourly_base_rate', e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">Default hourly rate for new bays</p>
              </div>
              
              <div>
                <Label htmlFor="daily_hours" className="text-sm font-medium">
                  Daily Hours
                </Label>
                <Input
                  id="daily_hours"
                  type="number"
                  min="1"
                  max="24"
                  value={settings.daily_hours}
                  onChange={(e) => handleInputChange('daily_hours', e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">Hours counted as a full day</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="daily_discount" className="text-sm font-medium">
                    Daily Discount
                  </Label>
                  <span className="text-sm text-blue-600 font-medium">{settings.daily_discount_percent}%</span>
                </div>
                <Slider
                  id="daily_discount"
                  min={0}
                  max={100}
                  step={1}
                  value={[settings.daily_discount_percent]}
                  onValueChange={handleDiscountChange}
                  className="mt-3"
                />
                <p className="text-sm text-gray-500 mt-1">Discount applied to daily rates</p>
              </div>
              
              <div>
                <Label htmlFor="weekly_multiplier" className="text-sm font-medium">
                  Weekly Rate Multiplier
                </Label>
                <Input
                  id="weekly_multiplier"
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.weekly_multiplier}
                  onChange={(e) => handleInputChange('weekly_multiplier', e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">Multiplied by hourly rate</p>
              </div>
              
              <div>
                <Label htmlFor="monthly_multiplier" className="text-sm font-medium">
                  Monthly Rate Multiplier
                </Label>
                <Input
                  id="monthly_multiplier"
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.monthly_multiplier}
                  onChange={(e) => handleInputChange('monthly_multiplier', e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">Multiplied by hourly rate</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="table" className="mt-0">
          <Table className="border rounded-md">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-medium">Setting</TableHead>
                <TableHead className="font-medium">Value</TableHead>
                <TableHead className="font-medium">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Base Hourly Rate</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.hourly_base_rate || ''}
                    onChange={(e) => handleInputChange('hourly_base_rate', e.target.value)}
                    className="w-24 h-8"
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-500">Default hourly rate for new bays</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Daily Hours</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={settings.daily_hours}
                    onChange={(e) => handleInputChange('daily_hours', e.target.value)}
                    className="w-24 h-8"
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-500">Hours counted as a full day</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Daily Discount</TableCell>
                <TableCell>
                  <div className="w-24 flex items-center">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.daily_discount_percent}
                      onChange={(e) => handleInputChange('daily_discount_percent', e.target.value)}
                      className="w-16 h-8 mr-1"
                    />
                    <span>%</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">Discount applied to daily rates</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekly Multiplier</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={settings.weekly_multiplier}
                    onChange={(e) => handleInputChange('weekly_multiplier', e.target.value)}
                    className="w-24 h-8"
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-500">Multiplied by hourly rate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Monthly Multiplier</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={settings.monthly_multiplier}
                    onChange={(e) => handleInputChange('monthly_multiplier', e.target.value)}
                    className="w-24 h-8"
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-500">Multiplied by hourly rate</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={onSaveSettings} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
