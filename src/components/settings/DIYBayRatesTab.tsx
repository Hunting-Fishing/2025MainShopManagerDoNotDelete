
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash2, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BayRate {
  id: string;
  name: string;
  hourlyRate: string;
  dailyRate: string;
  weeklyRate: string;
  monthlyRate: string;
}

export function DIYBayRatesTab() {
  const [bayRates, setBayRates] = useState<BayRate[]>([
    { id: "1", name: "Bay 1", hourlyRate: "65", dailyRate: "350", weeklyRate: "1500", monthlyRate: "4500" },
    { id: "2", name: "Bay 2", hourlyRate: "55", dailyRate: "320", weeklyRate: "1400", monthlyRate: "4000" }
  ]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (id: string, field: keyof BayRate, value: string) => {
    setBayRates(prev => prev.map(bay => 
      bay.id === id ? { ...bay, [field]: value } : bay
    ));
    setHasChanges(true);
  };

  const addNewBay = () => {
    const newId = (Math.max(...bayRates.map(b => parseInt(b.id))) + 1).toString();
    setBayRates([...bayRates, { 
      id: newId,
      name: `Bay ${newId}`, 
      hourlyRate: "50", 
      dailyRate: "300", 
      weeklyRate: "1200", 
      monthlyRate: "3800" 
    }]);
    setHasChanges(true);
  };

  const removeBay = (id: string) => {
    setBayRates(bayRates.filter(bay => bay.id !== id));
    setHasChanges(true);
  };

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

  return (
    <Card className="border-gray-100 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
        <CardTitle className="text-indigo-700 flex items-center gap-2">
          <span className="inline-flex p-1.5 bg-indigo-100 text-indigo-700 rounded-full">
            <Clock className="h-4 w-4" />
          </span>
          DIY Bay Rental Rates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Configure hourly, daily, weekly, and monthly rates for your DIY service bays. Each bay can have different rates based on equipment, size, or features.
            </p>
          </div>
          
          {bayRates.map((bay) => (
            <div key={bay.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-purple-100 text-purple-700 rounded-full">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <Input 
                    value={bay.name}
                    onChange={(e) => handleInputChange(bay.id, 'name', e.target.value)}
                    className="font-medium border-none bg-transparent p-0 text-purple-700 focus-visible:ring-0"
                    style={{ width: `${bay.name.length + 2}ch`, minWidth: "60px" }}
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeBay(bay.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`hourly-${bay.id}`} className="text-sm font-medium flex items-center gap-2">
                    Hourly Rate ($)
                  </Label>
                  <Input 
                    id={`hourly-${bay.id}`} 
                    type="number"
                    value={bay.hourlyRate}
                    onChange={(e) => handleInputChange(bay.id, 'hourlyRate', e.target.value)}
                    className="w-full border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`daily-${bay.id}`} className="text-sm font-medium flex items-center gap-2">
                    Daily Rate ($)
                  </Label>
                  <Input 
                    id={`daily-${bay.id}`} 
                    type="number"
                    value={bay.dailyRate}
                    onChange={(e) => handleInputChange(bay.id, 'dailyRate', e.target.value)}
                    className="w-full border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`weekly-${bay.id}`} className="text-sm font-medium flex items-center gap-2">
                    Weekly Rate ($)
                  </Label>
                  <Input 
                    id={`weekly-${bay.id}`} 
                    type="number"
                    value={bay.weeklyRate}
                    onChange={(e) => handleInputChange(bay.id, 'weeklyRate', e.target.value)}
                    className="w-full border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`monthly-${bay.id}`} className="text-sm font-medium flex items-center gap-2">
                    Monthly Rate ($)
                  </Label>
                  <Input 
                    id={`monthly-${bay.id}`} 
                    type="number"
                    value={bay.monthlyRate}
                    onChange={(e) => handleInputChange(bay.id, 'monthlyRate', e.target.value)}
                    className="w-full border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-between mt-6">
            <Button 
              onClick={addNewBay} 
              variant="outline"
              className="rounded-full px-4 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Bay
            </Button>
            
            <Button 
              onClick={handleSave} 
              disabled={saving || !hasChanges}
              className={`rounded-full px-6 ${hasChanges 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
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
  );
}
