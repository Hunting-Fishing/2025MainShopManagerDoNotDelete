
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2, Info, Settings, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { companyService } from "@/services/settings/companyService";

interface BayRate {
  id: string;
  name: string;
  hourlyRate: string;
  dailyRate: string;
  weeklyRate: string;
  monthlyRate: string;
  useAutoCalculation: boolean;
}

export function DIYBayRatesTab() {
  const [bayRates, setBayRates] = useState<BayRate[]>([
    { 
      id: '1', 
      name: 'Bay 1', 
      hourlyRate: '65', 
      dailyRate: '480', 
      weeklyRate: '2000', 
      monthlyRate: '7000',
      useAutoCalculation: true
    },
    { 
      id: '2', 
      name: 'Bay 2', 
      hourlyRate: '70', 
      dailyRate: '520', 
      weeklyRate: '2200', 
      monthlyRate: '7500',
      useAutoCalculation: true
    }
  ]);

  // Calculation settings
  const [calculationSettings, setCalculationSettings] = useState({
    shopHoursPerDay: 8,
    daysPerWeek: 5,
    daysPerMonth: 20,
    dailyDiscountPercent: 10,
    weeklyDiscountPercent: 20,
    monthlyDiscountPercent: 30
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  // Fetch shop hours when component mounts
  useEffect(() => {
    const fetchShopHours = async () => {
      try {
        // Use a dummy shop ID for now - in a real app, you'd get this from context or props
        const shopId = "current-shop-id";
        const hours = await companyService.getBusinessHours(shopId);
        
        // Calculate average business hours per day from shop hours
        if (hours && hours.length > 0) {
          let totalHoursPerWeek = 0;
          let openDaysCount = 0;
          
          hours.forEach(day => {
            if (!day.is_closed) {
              const openTime = new Date(`1970-01-01T${day.open_time}`);
              const closeTime = new Date(`1970-01-01T${day.close_time}`);
              const hoursOpen = (closeTime.getTime() - openTime.getTime()) / (1000 * 60 * 60);
              totalHoursPerWeek += hoursOpen;
              openDaysCount++;
            }
          });
          
          if (openDaysCount > 0) {
            const avgHoursPerDay = Math.round(totalHoursPerWeek / openDaysCount);
            
            setCalculationSettings(prev => ({
              ...prev,
              shopHoursPerDay: avgHoursPerDay,
              daysPerWeek: openDaysCount
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching shop hours:", error);
      }
    };

    fetchShopHours();
  }, []);

  const handleAddBay = () => {
    const newId = String(bayRates.length + 1);
    setBayRates([
      ...bayRates, 
      { 
        id: newId, 
        name: `Bay ${newId}`, 
        hourlyRate: '65', 
        dailyRate: '480', 
        weeklyRate: '2000', 
        monthlyRate: '7000',
        useAutoCalculation: true
      }
    ]);
    setHasChanges(true);
  };

  const handleRemoveBay = (id: string) => {
    setBayRates(bayRates.filter(bay => bay.id !== id));
    setHasChanges(true);
  };

  const handleBayChange = (id: string, field: keyof BayRate, value: string | boolean) => {
    setBayRates(prevRates => 
      prevRates.map(bay => 
        bay.id === id ? { ...bay, [field]: value } : bay
      )
    );
    setHasChanges(true);
  };

  const handleSettingsChange = (field: keyof typeof calculationSettings, value: number) => {
    setCalculationSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  // Calculate rates based on hourly rate and settings
  const calculateRates = (bay: BayRate) => {
    if (!bay.useAutoCalculation) return bay;

    const hourlyRate = parseFloat(bay.hourlyRate);
    if (isNaN(hourlyRate)) return bay;

    const { shopHoursPerDay, daysPerWeek, daysPerMonth, dailyDiscountPercent, weeklyDiscountPercent, monthlyDiscountPercent } = calculationSettings;
    
    // Calculate daily rate: Hourly rate × hours per day × (1 - daily discount)
    const dailyRate = hourlyRate * shopHoursPerDay * (1 - dailyDiscountPercent/100);
    
    // Calculate weekly rate: Daily rate × days per week × (1 - weekly discount)
    const weeklyRate = dailyRate * daysPerWeek * (1 - weeklyDiscountPercent/100);
    
    // Calculate monthly rate: Daily rate × days per month × (1 - monthly discount)
    const monthlyRate = dailyRate * daysPerMonth * (1 - monthlyDiscountPercent/100);

    return {
      ...bay,
      dailyRate: dailyRate.toFixed(2),
      weeklyRate: weeklyRate.toFixed(2),
      monthlyRate: monthlyRate.toFixed(2)
    };
  };

  // Apply calculations to all bays that have auto-calculation enabled
  useEffect(() => {
    if (hasChanges) {
      const updatedRates = bayRates.map(bay => 
        bay.useAutoCalculation ? calculateRates(bay) : bay
      );
      setBayRates(updatedRates);
    }
  }, [calculationSettings, hasChanges]);

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

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 shadow-md rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-indigo-700">DIY Bay Rental Rates</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSettings}
            className="bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-1" />
            {showSettings ? "Hide Settings" : "Rate Calculation Settings"}
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          {showSettings && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 text-blue-700">
                <Settings className="h-4 w-4" />
                Rate Calculation Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="shopHoursPerDay" className="text-sm flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    Hours Per Day
                  </Label>
                  <Input
                    id="shopHoursPerDay"
                    type="number"
                    min="1"
                    max="24"
                    value={calculationSettings.shopHoursPerDay}
                    onChange={(e) => handleSettingsChange('shopHoursPerDay', parseInt(e.target.value))}
                    className="border-gray-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="daysPerWeek" className="text-sm flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    Days Per Week
                  </Label>
                  <Input
                    id="daysPerWeek"
                    type="number"
                    min="1"
                    max="7"
                    value={calculationSettings.daysPerWeek}
                    onChange={(e) => handleSettingsChange('daysPerWeek', parseInt(e.target.value))}
                    className="border-gray-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="daysPerMonth" className="text-sm flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    Days Per Month
                  </Label>
                  <Input
                    id="daysPerMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={calculationSettings.daysPerMonth}
                    onChange={(e) => handleSettingsChange('daysPerMonth', parseInt(e.target.value))}
                    className="border-gray-200"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyDiscountPercent" className="text-sm flex items-center gap-1.5">
                    Daily Discount %
                  </Label>
                  <Input
                    id="dailyDiscountPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={calculationSettings.dailyDiscountPercent}
                    onChange={(e) => handleSettingsChange('dailyDiscountPercent', parseInt(e.target.value))}
                    className="border-gray-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weeklyDiscountPercent" className="text-sm flex items-center gap-1.5">
                    Weekly Discount %
                  </Label>
                  <Input
                    id="weeklyDiscountPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={calculationSettings.weeklyDiscountPercent}
                    onChange={(e) => handleSettingsChange('weeklyDiscountPercent', parseInt(e.target.value))}
                    className="border-gray-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthlyDiscountPercent" className="text-sm flex items-center gap-1.5">
                    Monthly Discount %
                  </Label>
                  <Input
                    id="monthlyDiscountPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={calculationSettings.monthlyDiscountPercent}
                    onChange={(e) => handleSettingsChange('monthlyDiscountPercent', parseInt(e.target.value))}
                    className="border-gray-200"
                  />
                </div>
              </div>
              
              <div className="mt-4 text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                <p className="font-medium">How rates are calculated:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Daily Rate = Hourly Rate × Hours Per Day × (1 - Daily Discount %)</li>
                  <li>Weekly Rate = Daily Rate × Days Per Week × (1 - Weekly Discount %)</li>
                  <li>Monthly Rate = Daily Rate × Days Per Month × (1 - Monthly Discount %)</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {bayRates.map((bay) => (
              <div key={bay.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={bay.name}
                      onChange={(e) => handleBayChange(bay.id, 'name', e.target.value)}
                      className="font-medium text-md w-40 border-gray-200 bg-white"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center ml-2">
                            <Switch
                              checked={bay.useAutoCalculation}
                              onCheckedChange={(checked) => handleBayChange(bay.id, 'useAutoCalculation', checked)}
                              id={`auto-calc-${bay.id}`}
                            />
                            <Label htmlFor={`auto-calc-${bay.id}`} className="ml-2 text-sm">
                              Auto Calculate
                            </Label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-60">When enabled, daily, weekly, and monthly rates will be automatically calculated based on the hourly rate and settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBay(bay.id)}
                    className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`hourly-${bay.id}`} className="flex items-center gap-1.5">
                      <span className="inline-flex p-1 bg-blue-100 text-blue-700 rounded-full">
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                      Hourly Rate ($/hour)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id={`hourly-${bay.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={bay.hourlyRate}
                        onChange={(e) => handleBayChange(bay.id, 'hourlyRate', e.target.value)}
                        className="pl-7 border-gray-200"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`daily-${bay.id}`} className="flex items-center gap-1.5">
                      <span className="inline-flex p-1 bg-green-100 text-green-700 rounded-full">
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                      Daily Rate ($/day)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id={`daily-${bay.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={bay.dailyRate}
                        onChange={(e) => handleBayChange(bay.id, 'dailyRate', e.target.value)}
                        className={`pl-7 border-gray-200 ${bay.useAutoCalculation ? 'bg-gray-100' : ''}`}
                        readOnly={bay.useAutoCalculation}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`weekly-${bay.id}`} className="flex items-center gap-1.5">
                      <span className="inline-flex p-1 bg-purple-100 text-purple-700 rounded-full">
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                      Weekly Rate ($/week)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id={`weekly-${bay.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={bay.weeklyRate}
                        onChange={(e) => handleBayChange(bay.id, 'weeklyRate', e.target.value)}
                        className={`pl-7 border-gray-200 ${bay.useAutoCalculation ? 'bg-gray-100' : ''}`}
                        readOnly={bay.useAutoCalculation}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`monthly-${bay.id}`} className="flex items-center gap-1.5">
                      <span className="inline-flex p-1 bg-yellow-100 text-yellow-700 rounded-full">
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                      Monthly Rate ($/month)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id={`monthly-${bay.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={bay.monthlyRate}
                        onChange={(e) => handleBayChange(bay.id, 'monthlyRate', e.target.value)}
                        className={`pl-7 border-gray-200 ${bay.useAutoCalculation ? 'bg-gray-100' : ''}`}
                        readOnly={bay.useAutoCalculation}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button 
              onClick={handleAddBay} 
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Bay
            </Button>
            
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
        </CardContent>
      </Card>
      
      <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
        <h3 className="flex items-center text-blue-800 font-medium mb-2">
          <Info className="h-4 w-4 mr-2" />
          Understanding DIY Bay Rental Rates
        </h3>
        <p className="text-sm text-blue-700">
          DIY bay rental rates offer flexibility for customers who want to work on their own vehicles. 
          Rates can be configured on hourly, daily, weekly or monthly terms, with discounts applied for longer-term rentals.
        </p>
        <p className="text-sm text-blue-700 mt-2">
          When auto-calculation is enabled, rates will be automatically calculated based on your hourly rate and settings - 
          providing consistent pricing across all rental terms.
        </p>
      </div>
    </div>
  );
}
