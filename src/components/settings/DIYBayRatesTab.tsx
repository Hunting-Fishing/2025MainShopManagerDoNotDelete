
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Plus, Trash, DollarSign, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils";

interface BayRate {
  id: string;
  name: string;
  location: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
}

interface RateMultiplier {
  daily: number;
  weekly: number;
  monthly: number;
}

export function DIYBayRatesTab() {
  const [bayRates, setBayRates] = useState<BayRate[]>([
    { 
      id: "bay-1", 
      name: "Bay 1", 
      location: "Main garage area, first bay on left when entering from south entrance. Has 2-post lift rated for 10,000 lbs.",
      hourlyRate: 45, 
      dailyRate: 280, 
      weeklyRate: 1200, 
      monthlyRate: 4000 
    },
    { 
      id: "bay-2", 
      name: "Bay 2", 
      location: "Main garage area, second bay from left, has 4-post alignment rack with pneumatic jacks.",
      hourlyRate: 55, 
      dailyRate: 350, 
      weeklyRate: 1500, 
      monthlyRate: 5000 
    },
  ]);

  // Shop hour settings
  const [shopHoursPerDay, setShopHoursPerDay] = useState<number>(8);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(22);
  
  // Rate multipliers
  const [useCustomRates, setUseCustomRates] = useState<boolean>(false);
  const [rateMultipliers, setRateMultipliers] = useState<RateMultiplier>({
    daily: 0.9, // 10% discount for daily rate
    weekly: 0.8, // 20% discount for weekly rate
    monthly: 0.7, // 30% discount for monthly rate
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Update derived rates when hours change
  useEffect(() => {
    if (!useCustomRates) {
      const updatedRates = bayRates.map(bay => ({
        ...bay,
        dailyRate: Math.round(bay.hourlyRate * shopHoursPerDay * rateMultipliers.daily),
        weeklyRate: Math.round(bay.hourlyRate * shopHoursPerDay * daysPerWeek * rateMultipliers.weekly),
        monthlyRate: Math.round(bay.hourlyRate * shopHoursPerDay * daysPerMonth * rateMultipliers.monthly)
      }));
      
      setBayRates(updatedRates);
    }
  }, [shopHoursPerDay, daysPerWeek, daysPerMonth, useCustomRates, rateMultipliers]);

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Success",
        description: "DIY bay rates have been updated successfully.",
        variant: "default",
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update DIY bay rates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddBay = () => {
    const newId = `bay-${bayRates.length + 1}`;
    const baseHourlyRate = 50;
    
    const newBay: BayRate = {
      id: newId,
      name: `Bay ${bayRates.length + 1}`,
      location: "",
      hourlyRate: baseHourlyRate,
      dailyRate: Math.round(baseHourlyRate * shopHoursPerDay * rateMultipliers.daily),
      weeklyRate: Math.round(baseHourlyRate * shopHoursPerDay * daysPerWeek * rateMultipliers.weekly),
      monthlyRate: Math.round(baseHourlyRate * shopHoursPerDay * daysPerMonth * rateMultipliers.monthly),
    };
    
    setBayRates([...bayRates, newBay]);
    setHasChanges(true);
  };

  const handleRemoveBay = (bayId: string) => {
    setBayRates(bayRates.filter(bay => bay.id !== bayId));
    setHasChanges(true);
  };

  const handleBayChange = (bayId: string, field: keyof BayRate, value: string | number) => {
    const updatedRates = bayRates.map(bay => {
      if (bay.id === bayId) {
        const updatedBay = { ...bay, [field]: value };
        
        // If hourly rate changes and we're not using custom rates, recalculate other rates
        if (field === 'hourlyRate' && !useCustomRates) {
          const hourlyRate = Number(value);
          return {
            ...updatedBay,
            dailyRate: Math.round(hourlyRate * shopHoursPerDay * rateMultipliers.daily),
            weeklyRate: Math.round(hourlyRate * shopHoursPerDay * daysPerWeek * rateMultipliers.weekly),
            monthlyRate: Math.round(hourlyRate * shopHoursPerDay * daysPerMonth * rateMultipliers.monthly),
          };
        }
        return updatedBay;
      }
      return bay;
    });
    
    setBayRates(updatedRates);
    setHasChanges(true);
  };

  const handleMultiplierChange = (type: keyof RateMultiplier, value: number[]) => {
    const multiplierValue = value[0] / 100;
    setRateMultipliers({
      ...rateMultipliers,
      [type]: multiplierValue
    });
    setHasChanges(true);
  };

  const handleCustomRatesToggle = (checked: boolean) => {
    setUseCustomRates(checked);
    setHasChanges(true);

    // If turning off custom rates, recalculate all rates based on hourly rate
    if (!checked) {
      const updatedRates = bayRates.map(bay => ({
        ...bay,
        dailyRate: Math.round(bay.hourlyRate * shopHoursPerDay * rateMultipliers.daily),
        weeklyRate: Math.round(bay.hourlyRate * shopHoursPerDay * daysPerWeek * rateMultipliers.weekly),
        monthlyRate: Math.round(bay.hourlyRate * shopHoursPerDay * daysPerMonth * rateMultipliers.monthly)
      }));
      
      setBayRates(updatedRates);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rate Calculation Settings */}
      <Card className="border-gray-100 shadow-md rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
          <CardTitle className="text-blue-700">DIY Bay Rate Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Custom Rates</h3>
                <p className="text-sm text-gray-500">Enable to manually set daily, weekly and monthly rates</p>
              </div>
              <Switch
                checked={useCustomRates}
                onCheckedChange={handleCustomRatesToggle}
              />
            </div>
            
            {!useCustomRates && (
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="text-md font-semibold">Rate Calculation Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="hours-per-day">Shop Hours Per Day:</Label>
                      <span className="text-sm font-medium">{shopHoursPerDay} hours</span>
                    </div>
                    <Slider 
                      id="hours-per-day"
                      min={1} 
                      max={24} 
                      step={1} 
                      value={[shopHoursPerDay]}
                      onValueChange={(value) => {
                        setShopHoursPerDay(value[0]);
                        setHasChanges(true);
                      }}
                      className="py-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="days-per-week">Work Days Per Week:</Label>
                      <span className="text-sm font-medium">{daysPerWeek} days</span>
                    </div>
                    <Slider 
                      id="days-per-week"
                      min={1} 
                      max={7} 
                      step={1} 
                      value={[daysPerWeek]}
                      onValueChange={(value) => {
                        setDaysPerWeek(value[0]);
                        setHasChanges(true);
                      }}
                      className="py-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="days-per-month">Work Days Per Month:</Label>
                      <span className="text-sm font-medium">{daysPerMonth} days</span>
                    </div>
                    <Slider 
                      id="days-per-month"
                      min={10} 
                      max={31} 
                      step={1} 
                      value={[daysPerMonth]}
                      onValueChange={(value) => {
                        setDaysPerMonth(value[0]);
                        setHasChanges(true);
                      }}
                      className="py-2"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="text-md font-semibold mb-4">Discounted Rate Multipliers</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="daily-multiplier">
                          Daily Rate Discount:
                        </Label>
                        <span className="text-sm font-medium">
                          {Math.round((1 - rateMultipliers.daily) * 100)}% off ({rateMultipliers.daily.toFixed(2)}x)
                        </span>
                      </div>
                      <Slider 
                        id="daily-multiplier"
                        min={50} 
                        max={100} 
                        step={1} 
                        value={[Math.round(rateMultipliers.daily * 100)]}
                        onValueChange={(value) => handleMultiplierChange('daily', value)}
                        className="py-2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="weekly-multiplier">
                          Weekly Rate Discount:
                        </Label>
                        <span className="text-sm font-medium">
                          {Math.round((1 - rateMultipliers.weekly) * 100)}% off ({rateMultipliers.weekly.toFixed(2)}x)
                        </span>
                      </div>
                      <Slider 
                        id="weekly-multiplier"
                        min={40} 
                        max={95} 
                        step={1} 
                        value={[Math.round(rateMultipliers.weekly * 100)]}
                        onValueChange={(value) => handleMultiplierChange('weekly', value)}
                        className="py-2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="monthly-multiplier">
                          Monthly Rate Discount:
                        </Label>
                        <span className="text-sm font-medium">
                          {Math.round((1 - rateMultipliers.monthly) * 100)}% off ({rateMultipliers.monthly.toFixed(2)}x)
                        </span>
                      </div>
                      <Slider 
                        id="monthly-multiplier"
                        min={30} 
                        max={90} 
                        step={1} 
                        value={[Math.round(rateMultipliers.monthly * 100)]}
                        onValueChange={(value) => handleMultiplierChange('monthly', value)}
                        className="py-2"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">How Rates Are Calculated</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• <strong>Daily Rate:</strong> Hourly Rate × {shopHoursPerDay} hours × {rateMultipliers.daily.toFixed(2)} ({Math.round((1 - rateMultipliers.daily) * 100)}% discount)</li>
                    <li>• <strong>Weekly Rate:</strong> Hourly Rate × {shopHoursPerDay} hours × {daysPerWeek} days × {rateMultipliers.weekly.toFixed(2)} ({Math.round((1 - rateMultipliers.weekly) * 100)}% discount)</li>
                    <li>• <strong>Monthly Rate:</strong> Hourly Rate × {shopHoursPerDay} hours × {daysPerMonth} days × {rateMultipliers.monthly.toFixed(2)} ({Math.round((1 - rateMultipliers.monthly) * 100)}% discount)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-md rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <CardTitle className="text-blue-700">DIY Bay Rates</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {bayRates.map((bay, index) => (
              <div 
                key={bay.id} 
                className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-3 border-b">
                  <div className="flex-1 mb-2 md:mb-0">
                    <Label htmlFor={`name-${bay.id}`} className="text-sm font-medium mb-1 block">Bay Name</Label>
                    <Input
                      id={`name-${bay.id}`}
                      value={bay.name}
                      onChange={(e) => handleBayChange(bay.id, 'name', e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBay(bay.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={bayRates.length <= 1}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Remove Bay
                  </Button>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor={`location-${bay.id}`} className="text-sm font-medium mb-1 block">Bay Location & Details</Label>
                  <Textarea
                    id={`location-${bay.id}`}
                    value={bay.location}
                    onChange={(e) => handleBayChange(bay.id, 'location', e.target.value)}
                    className="min-h-[80px] resize-y"
                    placeholder="Enter bay location details and equipment information..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`hourly-${bay.id}`} className="text-sm font-medium flex items-center gap-2">
                      <span className="inline-flex p-1.5 bg-blue-100 text-blue-700 rounded-full">
                        <DollarSign className="h-3 w-3" />
                      </span>
                      Hourly Rate
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id={`hourly-${bay.id}`}
                        type="number"
                        value={bay.hourlyRate}
                        onChange={(e) => handleBayChange(bay.id, 'hourlyRate', Number(e.target.value))}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`daily-${bay.id}`} className="text-sm font-medium flex items-center gap-2">
                      <span className="inline-flex p-1.5 bg-green-100 text-green-700 rounded-full">
                        <DollarSign className="h-3 w-3" />
                      </span>
                      Daily Rate
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id={`daily-${bay.id}`}
                        type="number"
                        value={bay.dailyRate}
                        onChange={(e) => handleBayChange(bay.id, 'dailyRate', Number(e.target.value))}
                        className="pl-8"
                        disabled={!useCustomRates}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`weekly-${bay.id}`} className="text-sm font-medium flex items-center gap-2">
                      <span className="inline-flex p-1.5 bg-purple-100 text-purple-700 rounded-full">
                        <DollarSign className="h-3 w-3" />
                      </span>
                      Weekly Rate
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id={`weekly-${bay.id}`}
                        type="number"
                        value={bay.weeklyRate}
                        onChange={(e) => handleBayChange(bay.id, 'weeklyRate', Number(e.target.value))}
                        className="pl-8"
                        disabled={!useCustomRates}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`monthly-${bay.id}`} className="text-sm font-medium flex items-center gap-2">
                      <span className="inline-flex p-1.5 bg-yellow-100 text-yellow-700 rounded-full">
                        <DollarSign className="h-3 w-3" />
                      </span>
                      Monthly Rate
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id={`monthly-${bay.id}`}
                        type="number"
                        value={bay.monthlyRate}
                        onChange={(e) => handleBayChange(bay.id, 'monthlyRate', Number(e.target.value))}
                        className="pl-8"
                        disabled={!useCustomRates}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              onClick={handleAddBay} 
              variant="outline" 
              className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Bay
            </Button>
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={handleSave} 
                disabled={saving || !hasChanges}
                className={`rounded-full px-6 ${hasChanges 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-100 text-gray-400'}`}
              >
                {saving ? (
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
