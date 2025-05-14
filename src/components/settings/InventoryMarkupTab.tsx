
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COST_RANGES = [
  { min: 0, max: 5, label: "$0 - $5" },
  { min: 5, max: 10, label: "$5 - $10" },
  { min: 10, max: 25, label: "$10 - $25" },
  { min: 25, max: 50, label: "$25 - $50" },
  { min: 50, max: 100, label: "$50 - $100" },
  { min: 100, max: 200, label: "$100 - $200" },
  { min: 200, max: 500, label: "$200 - $500" },
  { min: 500, max: 1000, label: "$500 - $1000" },
  { min: 1000, max: null, label: "$1000+" },
];

const SUPPLIERS = [
  { id: "all", name: "All Suppliers" },
  { id: "oem", name: "OEM Parts" },
  { id: "aftermarket", name: "Aftermarket" },
  { id: "wholesale", name: "Wholesale" },
  { id: "retail", name: "Retail" },
  { id: "local", name: "Local Vendors" },
];

export function InventoryMarkupTab() {
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [markupRates, setMarkupRates] = useState(
    COST_RANGES.map((range) => ({
      ...range,
      markup: range.min < 50 ? "35" : range.min < 200 ? "30" : range.min < 500 ? "25" : "20",
    }))
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleMarkupChange = (index: number, value: string) => {
    const newRates = [...markupRates];
    newRates[index].markup = value;
    setMarkupRates(newRates);
    setHasChanges(true);
  };

  const handleSupplierChange = (value: string) => {
    setSelectedSupplier(value);
    // In a real app, we would load the markup rates for the selected supplier
    // For now, we'll just simulate it
    setHasChanges(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Success",
        description: "Markup rates have been updated successfully.",
        variant: "default",
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update markup rates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inventory Markup Settings</CardTitle>
          <Select value={selectedSupplier} onValueChange={handleSupplierChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {SUPPLIERS.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configure markup percentages for parts based on cost ranges. These markups will be applied automatically when adding parts to work orders.
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              {markupRates.map((range, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-32 flex-shrink-0">
                    <span className="text-sm font-medium">{range.label}</span>
                  </div>
                  <div className="flex-1 max-w-xs">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={range.markup}
                        onChange={(e) => handleMarkupChange(index, e.target.value)}
                        className="w-24"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                </div>
              ))}
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
