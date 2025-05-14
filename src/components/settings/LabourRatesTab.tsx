
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LabourRatesTab() {
  const [rates, setRates] = useState({
    standard: "125",
    diagnostic: "145",
    emergency: "175",
    warranty: "95",
    internal: "85"
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
      <Card>
        <CardHeader>
          <CardTitle>Labour Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="standard" className="text-sm font-medium">Standard Rate ($/hour)</Label>
                <Input 
                  id="standard" 
                  type="number" 
                  value={rates.standard} 
                  onChange={handleInputChange} 
                  className="w-full" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diagnostic" className="text-sm font-medium">Diagnostic Rate ($/hour)</Label>
                <Input 
                  id="diagnostic" 
                  type="number" 
                  value={rates.diagnostic} 
                  onChange={handleInputChange} 
                  className="w-full" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergency" className="text-sm font-medium">Emergency/After Hours Rate ($/hour)</Label>
                <Input 
                  id="emergency" 
                  type="number" 
                  value={rates.emergency} 
                  onChange={handleInputChange} 
                  className="w-full" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warranty" className="text-sm font-medium">Warranty Work Rate ($/hour)</Label>
                <Input 
                  id="warranty" 
                  type="number" 
                  value={rates.warranty} 
                  onChange={handleInputChange} 
                  className="w-full" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="internal" className="text-sm font-medium">Internal Work Rate ($/hour)</Label>
                <Input 
                  id="internal" 
                  type="number" 
                  value={rates.internal} 
                  onChange={handleInputChange} 
                  className="w-full" 
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={handleSave} 
                disabled={saving || !hasChanges}
                className={`${hasChanges ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 hover:bg-gray-400'}`}
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
