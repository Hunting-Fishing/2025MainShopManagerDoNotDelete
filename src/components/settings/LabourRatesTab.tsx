
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LabourRatesTab() {
  const [rates, setRates] = useState({
    standard: "125",
    diagnostic: "145",
    emergency: "175",
    warranty: "95",
    internal: "85",
    diy: "65"  // Added DIY rate
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setRates(prev => ({
      ...prev,
      [id]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Success",
        description: "Labour rates have been updated successfully.",
        variant: "default",
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update labour rates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 shadow-md rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <CardTitle className="text-blue-700">Labour Rates</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="standard" className="text-sm font-medium flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-blue-100 text-blue-700 rounded-full">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  Standard Rate ($/hour)
                </Label>
                <Input 
                  id="standard" 
                  type="number" 
                  value={rates.standard} 
                  onChange={handleInputChange} 
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diagnostic" className="text-sm font-medium flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-purple-100 text-purple-700 rounded-full">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  Diagnostic Rate ($/hour)
                </Label>
                <Input 
                  id="diagnostic" 
                  type="number" 
                  value={rates.diagnostic} 
                  onChange={handleInputChange} 
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergency" className="text-sm font-medium flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-red-100 text-red-700 rounded-full">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  Emergency/After Hours Rate ($/hour)
                </Label>
                <Input 
                  id="emergency" 
                  type="number" 
                  value={rates.emergency} 
                  onChange={handleInputChange} 
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warranty" className="text-sm font-medium flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-green-100 text-green-700 rounded-full">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  Warranty Work Rate ($/hour)
                </Label>
                <Input 
                  id="warranty" 
                  type="number" 
                  value={rates.warranty} 
                  onChange={handleInputChange} 
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="internal" className="text-sm font-medium flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-yellow-100 text-yellow-700 rounded-full">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  Internal Work Rate ($/hour)
                </Label>
                <Input 
                  id="internal" 
                  type="number" 
                  value={rates.internal} 
                  onChange={handleInputChange} 
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diy" className="text-sm font-medium flex items-center gap-2">
                  <span className="inline-flex p-1.5 bg-indigo-100 text-indigo-700 rounded-full">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  DIY Bay Rental Rate ($/hour)
                </Label>
                <Input 
                  id="diy" 
                  type="number" 
                  value={rates.diy} 
                  onChange={handleInputChange} 
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                  placeholder="Enter DIY bay rental rate per hour"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Base rate for DIY bay rentals (hourly). Day/Week/Month rates can be configured as multiples of this base rate.
                </p>
              </div>
            </div>
            
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
