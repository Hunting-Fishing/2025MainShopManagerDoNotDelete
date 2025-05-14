
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarkupRange {
  min: number;
  max: number | null;
  markup: number;
}

export function InventoryMarkupTab() {
  const [supplierOptions, setSupplierOptions] = useState([
    { id: 'all', name: 'All Suppliers' },
    { id: 'acme', name: 'Acme Parts Inc.' },
    { id: 'bestparts', name: 'BestParts Co.' },
    { id: 'qualityauto', name: 'Quality Auto Supply' }
  ]);
  
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  
  const [markupRanges, setMarkupRanges] = useState<MarkupRange[]>([
    { min: 0, max: 5, markup: 100 },
    { min: 5, max: 10, markup: 80 },
    { min: 10, max: 25, markup: 60 },
    { min: 25, max: 50, markup: 50 },
    { min: 50, max: 100, markup: 40 },
    { min: 100, max: 200, markup: 35 },
    { min: 200, max: 500, markup: 30 },
    { min: 500, max: 1000, markup: 25 },
    { min: 1000, max: null, markup: 20 }
  ]);
  
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleMarkupChange = (index: number, value: string) => {
    const updatedRanges = [...markupRanges];
    updatedRanges[index].markup = Number(value);
    setMarkupRanges(updatedRanges);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Success",
        description: `Markup settings for ${supplierOptions.find(s => s.id === selectedSupplier)?.name} have been updated successfully.`,
        variant: "default",
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update markup settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatRangeLabel = (range: MarkupRange) => {
    if (range.max === null) {
      return `Over $${range.min}`;
    }
    return `$${range.min} - $${range.max}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Markup Settings</CardTitle>
          <CardDescription>Configure markup percentages based on part cost ranges by supplier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="supplier" className="text-sm font-medium mb-2 block">Select Supplier</Label>
              <Select value={selectedSupplier} onValueChange={value => setSelectedSupplier(value)}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {supplierOptions.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-4">Markup Percentages by Cost Range</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {markupRanges.map((range, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded min-w-[120px] text-sm">
                      {formatRangeLabel(range)}
                    </div>
                    <div className="flex-1 flex items-center">
                      <Input
                        id={`markup-${index}`}
                        type="number"
                        min="0"
                        max="500"
                        value={range.markup}
                        onChange={(e) => handleMarkupChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <Percent className="text-muted-foreground ml-2 h-4 w-4" />
                    </div>
                  </div>
                ))}
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
